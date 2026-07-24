import Foundation

struct PrayerBundle: Decodable {
    /// Step keys per weekday, index 0 = Sunday (matches JS getDay()).
    let days: [[String]]
    let steps: [String: PrayerStep]
}

struct PrayerStep: Decodable {
    let title: String
    let subtitle: String?
    let text: String
}

enum PrayerLibrary {
    static let bundle: PrayerBundle = WatchBundle.decode(PrayerBundle.self, from: "prayers")

    static var todaySteps: [PrayerStep] {
        let weekday = Calendar.current.component(.weekday, from: Date()) - 1
        let keys = bundle.days[weekday]

        return keys.compactMap { bundle.steps[$0] }
    }

    static var todayLabel: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "es_MX")
        formatter.dateFormat = "EEEE"

        return formatter.string(from: Date()).capitalized
    }
}

/// Where we are in today's sequence, one prayer per screen.
final class PrayerSession: ObservableObject {
    let steps: [PrayerStep]

    @Published var index = 0

    init() {
        self.steps = PrayerLibrary.todaySteps
    }

    var step: PrayerStep { steps[index] }
    var isLast: Bool { index == steps.count - 1 }
    var positionLabel: String { "\(index + 1) de \(steps.count)" }

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
