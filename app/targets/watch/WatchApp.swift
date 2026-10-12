import SwiftUI
import UserNotifications
import WatchKit

@main
struct AlfonsoWatchApp: App {
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
                        case .prayers:
                            PrayersView()
                        case .benedict:
                            BenedictView()
                        case .exercises:
                            ExercisesView()
                        }
                    }
            }
            .task {
                await VirtueAPI.flushPending()
                await WorkoutAPI.flushPending()
            }
        }
    }
}

enum WatchRoute: Hashable {
    case prayers
    case benedict
    case exercises
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

/// The day on the wrist: the daily prayers and the exercise routine, with
/// San Benito one tap away.
struct HomeView: View {
    var body: some View {
        List {
            Section {
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

                NavigationLink(value: WatchRoute.exercises) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Ejercicios")
                            .font(.headline)
                        Text("\(WorkoutLibrary.setsDone)/\(WorkoutLibrary.totalSets) series")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
            } header: {
                Text("Hoy")
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
        .navigationTitle("Alfonso")
    }
}

