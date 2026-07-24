import SwiftUI
import UserNotifications
import WatchKit

@main
struct RosarioApp: App {
    @WKApplicationDelegateAdaptor(WatchDelegate.self) private var delegate
    @StateObject private var router = WatchRouter.shared

    init() {
        PhoneLink.shared.activate()
    }

    var body: some Scene {
        WindowGroup {
            NavigationStack(path: $router.path) {
                HomeView()
                    .navigationDestination(for: WatchRoute.self) { route in
                        switch route {
                        case let .mysterySet(key):
                            SetView(setKey: key)
                        case .prayers:
                            PrayersView()
                        case .benedict:
                            BenedictView()
                        }
                    }
            }
            .task {
                await VirtueAPI.flushPending()
            }
        }
    }
}

enum WatchRoute: Hashable {
    case mysterySet(String)
    case prayers
    case benedict
}

/// The one place that can push a screen from outside the view tree — today,
/// the daily prayers notification arriving from the iPhone.
final class WatchRouter: ObservableObject {
    static let shared = WatchRouter()

    @Published var path: [WatchRoute] = []

    func open(_ route: WatchRoute) {
        path = [route]
    }
}

/// The reminder is scheduled by the iPhone app and forwarded here by watchOS;
/// tapping it on the wrist should land on the prayers themselves.
final class WatchDelegate: NSObject, WKApplicationDelegate, UNUserNotificationCenterDelegate {
    static let prayersCategory = "auxilium-prayers"

    func applicationDidFinishLaunching() {
        UNUserNotificationCenter.current().delegate = self
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        if response.notification.request.content.categoryIdentifier == Self.prayersCategory {
            DispatchQueue.main.async {
                WatchRouter.shared.open(.prayers)
            }
        }

        completionHandler()
    }
}

/// Today's mysteries front and center, the daily prayers beside them, and the
/// other sets one tap away.
struct HomeView: View {
    private let todayKey = RosaryLibrary.todayKey

    var body: some View {
        List {
            Section {
                SetRow(setKey: todayKey, isToday: true)

                NavigationLink(value: WatchRoute.prayers) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Oraciones del día")
                            .font(.headline)
                            .foregroundStyle(Color.accentColor)
                        Text("Auxilium · \(PrayerLibrary.todayLabel)")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
            } header: {
                Text("Hoy")
            }

            Section {
                ForEach(orderedOtherKeys, id: \.self) { key in
                    SetRow(setKey: key, isToday: false)
                }
            } header: {
                Text("Otros misterios")
            }

            Section {
                NavigationLink(value: WatchRoute.benedict) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("San Benito")
                            .font(.headline)
                        Text("Latín y español")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
            } header: {
                Text("Consulta")
            }
        }
        .navigationTitle("Oración")
    }

    private var orderedOtherKeys: [String] {
        ["gozosos", "luminosos", "dolorosos", "gloriosos"].filter { $0 != todayKey }
    }
}

private struct SetRow: View {
    let setKey: String
    let isToday: Bool

    var body: some View {
        let set = RosaryLibrary.set(for: setKey)

        NavigationLink(value: WatchRoute.mysterySet(setKey)) {
            VStack(alignment: .leading, spacing: 2) {
                Text(set.name)
                    .font(.headline)
                    .foregroundStyle(isToday ? Color.accentColor : .primary)
                Text(set.daysLabel)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

/// One mystery set: pray by hand or with the voice.
struct SetView: View {
    let setKey: String

    var body: some View {
        let set = RosaryLibrary.set(for: setKey)

        ScrollView {
            VStack(spacing: 10) {
                Text(set.name)
                    .font(.headline)
                    .multilineTextAlignment(.center)

                NavigationLink {
                    PrayView(session: RosarySession(setKey: setKey))
                } label: {
                    Label("Rezar", systemImage: "hands.sparkles.fill")
                }
                .buttonStyle(.borderedProminent)
                .tint(.accentColor)
                .foregroundStyle(.black)

                NavigationLink {
                    AudioPlayView(session: RosarySession(setKey: setKey))
                } label: {
                    Label("Con audio", systemImage: "airpods.gen3")
                }
            }
            .padding(.horizontal, 4)
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}
