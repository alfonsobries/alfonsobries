import Foundation
import WidgetKit

struct ClimateState: Decodable, Equatable {
    var power: Bool
    var targetTemperature: Double
    var mode: String
    var fanSpeed: String
    var indoorTemperature: Double?
    var outdoorTemperature: Double?

    enum CodingKeys: String, CodingKey {
        case power
        case targetTemperature = "target_temperature"
        case mode
        case fanSpeed = "fan_speed"
        case indoorTemperature = "indoor_temperature"
        case outdoorTemperature = "outdoor_temperature"
    }
}

struct ClimateCapabilities: Decodable, Equatable {
    var modes: [String]
    var fanSpeeds: [String]
    var minTemperature: Double
    var maxTemperature: Double
    var halfDegrees: Bool

    enum CodingKeys: String, CodingKey {
        case modes
        case fanSpeeds = "fan_speeds"
        case minTemperature = "min_temperature"
        case maxTemperature = "max_temperature"
        case halfDegrees = "half_degrees"
    }

    var step: Double { halfDegrees ? 0.5 : 1 }
}

struct ClimateUnit: Decodable, Identifiable, Equatable {
    var id: String
    var name: String
    var online: Bool
    var state: ClimateState?
    var capabilities: ClimateCapabilities
}

/// The home's air conditioners, through the family API. Every change goes
/// straight to the server, which talks to the units.
enum ClimateAPI {
    private static let indexUrlKey = "climate-index-url"
    private static let unitUrlKey = "climate-unit-url"
    private static let unitPlaceholder = "9999999999"

    enum Failure: Error {
        case notConfigured
        case offline
        case rejected(String)
    }

    static func storeUrls(index: String?, unit: String?) {
        if let index {
            UserDefaults.standard.set(index, forKey: indexUrlKey)
        }

        if let unit {
            UserDefaults.standard.set(unit, forKey: unitUrlKey)
        }
    }

    static var isConfigured: Bool {
        Keychain.get("api-token") != nil
            && UserDefaults.standard.string(forKey: indexUrlKey) != nil
            && UserDefaults.standard.string(forKey: unitUrlKey) != nil
    }

    static func units() async throws -> [ClimateUnit] {
        let data = try await send(method: "GET", url: UserDefaults.standard.string(forKey: indexUrlKey), body: nil)

        struct Payload: Decodable {
            struct Overview: Decodable {
                var units: [ClimateUnit]
            }

            var data: Overview
        }

        return try JSONDecoder().decode(Payload.self, from: data).data.units
    }

    static func update(_ unitId: String, _ change: [String: Any]) async throws -> ClimateUnit {
        let url = UserDefaults.standard.string(forKey: unitUrlKey)?
            .replacingOccurrences(of: unitPlaceholder, with: unitId)
        let data = try await send(method: "PATCH", url: url, body: change)

        struct Payload: Decodable {
            var data: ClimateUnit
        }

        return try JSONDecoder().decode(Payload.self, from: data).data
    }

    private static func send(method: String, url urlString: String?, body: [String: Any]?) async throws -> Data {
        guard let token = Keychain.get("api-token"),
              let urlString,
              let url = URL(string: urlString)
        else {
            throw Failure.notConfigured
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        // The server reaches every unit through Carrier's cloud; a cold call can take a few seconds.
        request.timeoutInterval = 25
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        }

        let data: Data
        let response: URLResponse

        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw Failure.offline
        }

        guard let http = response as? HTTPURLResponse else {
            throw Failure.offline
        }

        guard (200 ..< 300).contains(http.statusCode) else {
            let message = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["message"] as? String
            throw Failure.rejected(message ?? "Intenta de nuevo en un momento.")
        }

        return data
    }
}

/// What the wrist shows: the units, kept in step with the server, with each
/// change shown immediately and rolled back if the unit refuses it.
@MainActor
final class ClimateStore: ObservableObject {
    static let shared = ClimateStore()

    enum Status: Equatable {
        case idle
        case loading
        case loaded
        case failed(String)
    }

    @Published private(set) var units: [ClimateUnit] = [] {
        didSet { ClimateGlance.store(onCount: onCount, total: units.count) }
    }
    @Published private(set) var status: Status = .idle
    @Published var alert: String?

    var onCount: Int { units.filter { $0.state?.power == true }.count }

    func refresh() async {
        guard ClimateAPI.isConfigured else {
            status = .failed("Abre la app en tu iPhone una vez para conectar los aires.")
            return
        }

        if units.isEmpty {
            status = .loading
        }

        do {
            units = try await ClimateAPI.units()
            status = .loaded
        } catch {
            status = units.isEmpty ? .failed(Self.message(for: error)) : .loaded
            if !units.isEmpty {
                alert = Self.message(for: error)
            }
        }
    }

    func unit(_ id: String) -> ClimateUnit? {
        units.first { $0.id == id }
    }

    func change(_ id: String, _ change: [String: Any], apply: (inout ClimateState) -> Void) async {
        guard let index = units.firstIndex(where: { $0.id == id }), var state = units[index].state else {
            return
        }

        let previous = units[index]
        apply(&state)
        units[index].state = state

        do {
            let confirmed = try await ClimateAPI.update(id, change)
            if let current = units.firstIndex(where: { $0.id == id }) {
                units[current] = confirmed
            }
        } catch {
            if let current = units.firstIndex(where: { $0.id == id }) {
                units[current] = previous
            }
            alert = Self.message(for: error)
        }
    }

    func turnAllOff() async {
        await withTaskGroup(of: Void.self) { group in
            for unit in units where unit.state?.power == true {
                group.addTask { await self.change(unit.id, ["power": false]) { $0.power = false } }
            }
        }
    }

    private static func message(for error: Error) -> String {
        switch error {
        case ClimateAPI.Failure.offline:
            return "Sin conexión."
        case ClimateAPI.Failure.notConfigured:
            return "Abre la app en tu iPhone una vez para conectar los aires."
        case let ClimateAPI.Failure.rejected(message):
            return message
        default:
            return "Intenta de nuevo en un momento."
        }
    }
}

/// What the "Aires" complication shows, shared with the widget extension
/// through the app group. Written whenever the wrist learns the units' state.
enum ClimateGlance {
    static let suite = "group.com.alfonsobries.app"
    static let kind = "ClimateShortcut"

    static func store(onCount: Int, total: Int) {
        guard total > 0, let defaults = UserDefaults(suiteName: suite) else {
            return
        }

        let previous = defaults.object(forKey: "climate-on-count") as? Int
        defaults.set(onCount, forKey: "climate-on-count")
        defaults.set(Date(), forKey: "climate-updated-at")

        if previous != onCount {
            WidgetCenter.shared.reloadTimelines(ofKind: kind)
        }
    }
}
