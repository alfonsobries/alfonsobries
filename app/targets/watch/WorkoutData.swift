import Foundation

/// One exercise of the daily routine, as the iPhone describes it.
struct WorkoutExercise: Codable, Identifiable, Hashable {
    let key: String
    let sets: Int
    let target: Int
    let unit: String

    var id: String { key }

    var title: String {
        switch key {
        case "pull_ups": return "Dominadas"
        case "push_ups": return "Lagartijas"
        case "air_squats": return "Sentadillas"
        case "deep_squat": return "Sentadilla profunda"
        default: return key
        }
    }

    /// One set said the way it is done: "10 reps" or "1 min".
    var setLabel: String {
        unit == "reps" ? "\(target) reps" : (target >= 60 ? "\(target / 60) min" : "\(target) s")
    }
}

/// The routine and how much of today is done. The plan comes from the iPhone;
/// the fallback keeps the screen usable on a watch that has never been synced.
enum WorkoutLibrary {
    private static let planKey = "workout-plan"
    private static let todayKey = "workout-today"

    private static let fallback: [WorkoutExercise] = [
        WorkoutExercise(key: "pull_ups", sets: 3, target: 10, unit: "reps"),
        WorkoutExercise(key: "push_ups", sets: 3, target: 30, unit: "reps"),
        WorkoutExercise(key: "air_squats", sets: 3, target: 20, unit: "reps"),
        WorkoutExercise(key: "deep_squat", sets: 5, target: 60, unit: "seconds"),
    ]

    static var plan: [WorkoutExercise] {
        guard let raw = UserDefaults.standard.string(forKey: planKey),
              let data = raw.data(using: .utf8),
              let decoded = try? JSONDecoder().decode([WorkoutExercise].self, from: data),
              !decoded.isEmpty
        else {
            return fallback
        }

        return decoded
    }

    static var totalSets: Int {
        plan.reduce(0) { $0 + $1.sets }
    }

    static func storePlan(_ json: String) {
        UserDefaults.standard.set(json, forKey: planKey)
    }

    /// Today's counts, dropped automatically once the date rolls over.
    static var today: [String: Int] {
        guard let stored = UserDefaults.standard.dictionary(forKey: todayKey),
              stored["date"] as? String == WorkoutAPI.localDate(),
              let counts = stored["exercises"] as? [String: Int]
        else {
            return [:]
        }

        return counts
    }

    static func done(_ exercise: WorkoutExercise) -> Int {
        min(today[exercise.key] ?? 0, exercise.sets)
    }

    static var setsDone: Int {
        plan.reduce(0) { $0 + done($1) }
    }

    static func store(_ counts: [String: Int]) {
        UserDefaults.standard.set(
            ["date": WorkoutAPI.localDate(), "exercises": counts],
            forKey: todayKey
        )
    }

    static func set(_ value: Int, for exercise: WorkoutExercise) {
        var counts = today
        counts[exercise.key] = max(0, min(value, exercise.sets))
        store(counts)
    }

    /// Applies the day the iPhone sent, but only when it is still today.
    static func storeToday(_ json: String) {
        guard let data = json.data(using: .utf8),
              let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              payload["date"] as? String == WorkoutAPI.localDate(),
              let counts = payload["exercises"] as? [String: Int]
        else {
            return
        }

        store(counts)
    }
}
