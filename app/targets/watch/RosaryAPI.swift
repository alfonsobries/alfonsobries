import Foundation

/// Marks the rosary as prayed against the family API. Days that could not be
/// sent (offline, out of pocket) wait in a queue and flush on the next run.
enum RosaryAPI {
    private static let pendingKey = "pending-rosary-dates"

    static var isConfigured: Bool {
        Keychain.get("api-token") != nil && UserDefaults.standard.string(forKey: "rosary-url") != nil
    }

    /// Marks today; returns false when it could not reach the API and the
    /// day was queued instead.
    static func markPrayed() async -> Bool {
        enqueue(localDate())
        await flushPending()
        return pendingDates().isEmpty
    }

    static func flushPending() async {
        guard isConfigured else {
            return
        }

        for date in pendingDates() {
            if await send(date: date) {
                dequeue(date)
            } else {
                break
            }
        }
    }

    private static func send(date: String) async -> Bool {
        guard let token = Keychain.get("api-token"),
              let urlString = UserDefaults.standard.string(forKey: "rosary-url"),
              let url = URL(string: urlString)
        else {
            return false
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["date": date])

        guard let (_, response) = try? await URLSession.shared.data(for: request),
              let http = response as? HTTPURLResponse
        else {
            return false
        }

        return (200 ..< 300).contains(http.statusCode)
    }

    private static func localDate() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }

    private static func pendingDates() -> [String] {
        UserDefaults.standard.stringArray(forKey: pendingKey) ?? []
    }

    private static func enqueue(_ date: String) {
        var dates = pendingDates()

        if !dates.contains(date) {
            dates.append(date)
            UserDefaults.standard.set(dates, forKey: pendingKey)
        }
    }

    private static func dequeue(_ date: String) {
        let dates = pendingDates().filter { $0 != date }
        UserDefaults.standard.set(dates, forKey: pendingKey)
    }
}
