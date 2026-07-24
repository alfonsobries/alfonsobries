import Foundation

/// Marks a virtue module as done against the family API. Days that could not be
/// sent (offline, out of pocket) wait in a queue and flush on the next run.
enum VirtueAPI {
    enum Module: String, CaseIterable {
        case rosary
        case prayers

        var urlKey: String { "\(rawValue)-url" }
        var pendingKey: String { "pending-\(rawValue)-dates" }
    }

    static func isConfigured(_ module: Module) -> Bool {
        Keychain.get("api-token") != nil
            && UserDefaults.standard.string(forKey: module.urlKey) != nil
    }

    /// Marks today; returns false when it could not reach the API and the
    /// day was queued instead.
    static func markCompleted(_ module: Module) async -> Bool {
        enqueue(localDate(), for: module)
        await flushPending(module)
        return pendingDates(for: module).isEmpty
    }

    static func flushPending() async {
        for module in Module.allCases {
            await flushPending(module)
        }
    }

    static func flushPending(_ module: Module) async {
        guard isConfigured(module) else {
            return
        }

        for date in pendingDates(for: module) {
            if await send(date: date, to: module) {
                dequeue(date, for: module)
            } else {
                break
            }
        }
    }

    private static func send(date: String, to module: Module) async -> Bool {
        guard let token = Keychain.get("api-token"),
              let urlString = UserDefaults.standard.string(forKey: module.urlKey),
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

    private static func pendingDates(for module: Module) -> [String] {
        UserDefaults.standard.stringArray(forKey: module.pendingKey) ?? []
    }

    private static func enqueue(_ date: String, for module: Module) {
        var dates = pendingDates(for: module)

        if !dates.contains(date) {
            dates.append(date)
            UserDefaults.standard.set(dates, forKey: module.pendingKey)
        }
    }

    private static func dequeue(_ date: String, for module: Module) {
        let dates = pendingDates(for: module).filter { $0 != date }
        UserDefaults.standard.set(dates, forKey: module.pendingKey)
    }
}
