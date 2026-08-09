import Foundation

/// Marks sets of the daily routine against the family API.
///
/// The wrist only ever adds sets, so a write is safe to resolve as the larger
/// of what the server already has and what the watch wants — a stale watch can
/// never undo progress marked on the phone. Taking a set back is the phone's
/// job, where the whole day is visible.
enum WorkoutAPI {
    private static let indexUrlKey = "workout-index-url"
    private static let updateUrlKey = "workout-update-url"
    private static let pendingKey = "pending-workout-sets"

    static func storeUrls(index: String?, update: String?) {
        if let index {
            UserDefaults.standard.set(index, forKey: indexUrlKey)
        }

        if let update {
            UserDefaults.standard.set(update, forKey: updateUrlKey)
        }
    }

    static var isConfigured: Bool {
        Keychain.get("api-token") != nil
            && UserDefaults.standard.string(forKey: indexUrlKey) != nil
            && UserDefaults.standard.string(forKey: updateUrlKey) != nil
    }

    /// Adds one set locally, then tries to settle it with the API. Returns
    /// false when the day is queued instead.
    static func addSet(to exercise: WorkoutExercise) async -> Bool {
        let next = min(WorkoutLibrary.done(exercise) + 1, exercise.sets)
        WorkoutLibrary.set(next, for: exercise)
        enqueue(next, for: exercise.key)

        return await flushPending()
    }

    /// Pulls today from the API and settles whatever is queued. Returns false
    /// when something is still waiting.
    @discardableResult
    static func flushPending() async -> Bool {
        guard isConfigured else {
            return false
        }

        guard let server = await fetchToday() else {
            return false
        }

        var counts = server
        var pending = pendingSets()

        for exercise in WorkoutLibrary.plan {
            guard let wanted = pending[exercise.key] else {
                continue
            }

            let value = max(wanted, server[exercise.key] ?? 0)
            var settled = value == server[exercise.key]

            if !settled {
                settled = await send(value, for: exercise.key)
            }

            if settled {
                counts[exercise.key] = value
                pending.removeValue(forKey: exercise.key)
            }
        }

        // Anything not queued is whatever the API says, so a set taken back on
        // the phone shows up here too.
        for (key, value) in pending {
            counts[key] = max(counts[key] ?? 0, value)
        }

        UserDefaults.standard.set(pending, forKey: pendingKey)
        WorkoutLibrary.store(counts)

        return pending.isEmpty
    }

    static func localDate() -> String {
        let formatter = DateFormatter()
        // A fixed locale, so a device set to a non-Gregorian calendar still
        // sends the date the API validates.
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }

    private static func fetchToday() async -> [String: Int]? {
        guard let token = Keychain.get("api-token"),
              let urlString = UserDefaults.standard.string(forKey: indexUrlKey),
              let url = URL(string: urlString)
        else {
            return nil
        }

        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        guard let (data, response) = try? await URLSession.shared.data(for: request),
              let http = response as? HTTPURLResponse,
              (200 ..< 300).contains(http.statusCode),
              let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            return nil
        }

        if let plan = payload["plan"],
           let planData = try? JSONSerialization.data(withJSONObject: plan),
           let planJson = String(data: planData, encoding: .utf8) {
            WorkoutLibrary.storePlan(planJson)
        }

        let days = payload["data"] as? [[String: Any]] ?? []
        let today = days.first { $0["date"] as? String == localDate() }

        return today?["exercises"] as? [String: Int] ?? [:]
    }

    private static func send(_ sets: Int, for exercise: String) async -> Bool {
        guard let token = Keychain.get("api-token"),
              let template = UserDefaults.standard.string(forKey: updateUrlKey)
        else {
            return false
        }

        let urlString = template
            .replacingOccurrences(of: "__date__", with: localDate())
            .replacingOccurrences(of: "__exercise__", with: exercise)

        guard let url = URL(string: urlString) else {
            return false
        }

        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["sets": sets])

        guard let (_, response) = try? await URLSession.shared.data(for: request),
              let http = response as? HTTPURLResponse
        else {
            return false
        }

        return (200 ..< 300).contains(http.statusCode)
    }

    private static func pendingSets() -> [String: Int] {
        guard let stored = UserDefaults.standard.dictionary(forKey: pendingKey) as? [String: Int]
        else {
            return [:]
        }

        return stored
    }

    private static func enqueue(_ sets: Int, for exercise: String) {
        var pending = pendingSets()
        pending[exercise] = max(pending[exercise] ?? 0, sets)
        UserDefaults.standard.set(pending, forKey: pendingKey)
    }
}
