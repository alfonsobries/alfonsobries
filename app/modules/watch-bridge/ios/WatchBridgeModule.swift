import ExpoModulesCore
import WatchConnectivity

public class WatchBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WatchBridge")

    AsyncFunction("syncContext") { (token: String, rosaryUrl: String) in
      WatchLink.shared.sync(context: ["token": token, "rosaryUrl": rosaryUrl])
    }
  }
}

/// Pushes the latest auth context to the paired watch. Application context is
/// delivered lazily by the system, so the watch gets it even if it is off
/// wrist or out of reach right now.
final class WatchLink: NSObject, WCSessionDelegate {
  static let shared = WatchLink()

  private var pending: [String: Any]?

  func sync(context: [String: Any]) {
    guard WCSession.isSupported() else {
      return
    }

    let session = WCSession.default
    session.delegate = self

    guard session.activationState == .activated else {
      pending = context
      session.activate()
      return
    }

    try? session.updateApplicationContext(context)
  }

  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    if activationState == .activated, let pending {
      try? session.updateApplicationContext(pending)
      self.pending = nil
    }
  }

  func sessionDidBecomeInactive(_ session: WCSession) {}

  func sessionDidDeactivate(_ session: WCSession) {
    session.activate()
  }
}
