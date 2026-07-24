import Foundation

struct RosaryBundle: Decodable {
    /// Mystery set key per weekday, index 0 = Sunday (matches JS getDay()).
    let weekdays: [String]
    let sets: [String: RosarySet]
}

struct RosarySet: Decodable {
    let name: String
    let daysLabel: String
    let steps: [RosaryStep]
}

struct RosaryStep: Decodable, Identifiable {
    struct Bead: Decodable {
        let index: Int
        let count: Int
    }

    let key: String
    let section: String
    let title: String
    let subtitle: String?
    let audio: String
    let bead: Bead?
    let text: String

    var id: String { key }
}

enum RosaryLibrary {
    static let bundle: RosaryBundle = {
        guard let url = resourceURL(name: "rosary", ext: "json"),
              let data = try? Data(contentsOf: url),
              let decoded = try? JSONDecoder().decode(RosaryBundle.self, from: data)
        else {
            fatalError("rosary.json missing from the watch bundle")
        }

        return decoded
    }()

    static var todayKey: String {
        let weekday = Calendar.current.component(.weekday, from: Date()) - 1
        return bundle.weekdays[weekday]
    }

    static func set(for key: String) -> RosarySet {
        bundle.sets[key]!
    }

    /// The synchronized folder may keep the Resources/ hierarchy or flatten
    /// it depending on how Xcode ingests it — try both.
    static func resourceURL(name: String, ext: String) -> URL? {
        Bundle.main.url(forResource: name, withExtension: ext)
            ?? Bundle.main.url(forResource: name, withExtension: ext, subdirectory: "Resources")
            ?? Bundle.main.url(forResource: name, withExtension: ext, subdirectory: "Audio")
            ?? Bundle.main.url(forResource: name, withExtension: ext, subdirectory: "Resources/Audio")
    }
}

/// Shared walk state for both modes: where we are in the set's step list.
final class RosarySession: ObservableObject {
    let setKey: String
    let rosarySet: RosarySet

    @Published var index = 0

    init(setKey: String) {
        self.setKey = setKey
        self.rosarySet = RosaryLibrary.set(for: setKey)
    }

    var steps: [RosaryStep] { rosarySet.steps }
    var step: RosaryStep { steps[index] }
    var isLast: Bool { index == steps.count - 1 }

    /// "Misterio 2 de 5" style position, for the quiet header line.
    var sectionLabel: String {
        if step.section.hasPrefix("misterio-") {
            let number = step.section.dropFirst("misterio-".count)
            return "Misterio \(number) de 5"
        }

        switch step.section {
        case "inicio": return "Inicio"
        case "letanias": return "Letanías"
        default: return "Final"
        }
    }

    func advance() {
        if !isLast {
            index += 1
        }
    }

    func goBack() {
        if index > 0 {
            index -= 1
        }
    }
}
