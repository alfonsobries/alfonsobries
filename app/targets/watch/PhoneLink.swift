import Foundation
import Security
import WatchConnectivity

/// Receives the auth context pushed from the iPhone and keeps it stored, so
/// the watch can mark the rosary against the API entirely on its own.
final class PhoneLink: NSObject, WCSessionDelegate {
    static let shared = PhoneLink()

    func activate() {
        guard WCSession.isSupported() else {
            return
        }

        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) {
        apply(session.receivedApplicationContext)
    }

    func session(_ session: WCSession, didReceiveApplicationContext context: [String: Any]) {
        apply(context)
    }

    private func apply(_ context: [String: Any]) {
        guard let token = context["token"] as? String,
              let url = context["rosaryUrl"] as? String
        else {
            return
        }

        Keychain.set(token, for: "api-token")
        UserDefaults.standard.set(url, forKey: "rosary-url")
    }
}

/// Just enough keychain for one secret.
enum Keychain {
    static func set(_ value: String, for key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
        ]

        SecItemDelete(query as CFDictionary)

        var attributes = query
        attributes[kSecValueData as String] = Data(value.utf8)
        SecItemAdd(attributes as CFDictionary, nil)
    }

    static func get(_ key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]

        var result: AnyObject?

        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data
        else {
            return nil
        }

        return String(decoding: data, as: UTF8.self)
    }
}
