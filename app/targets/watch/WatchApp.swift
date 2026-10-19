import SwiftUI

@main
struct AlfonsoWatchApp: App {
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
                        case .benedict:
                            BenedictView()
                        case .exercises:
                            ExercisesView()
                        case .climate:
                            ClimateListView()
                        case let .climateUnit(id):
                            ClimateUnitView(unitId: id)
                        }
                    }
            }
            .onOpenURL { url in
                router.open(url: url)
            }
            .task {
                await WorkoutAPI.flushPending()
            }
        }
    }
}

enum WatchRoute: Hashable {
    case benedict
    case exercises
    case climate
    case climateUnit(String)
}

/// The one place that can push a screen from outside the view tree — today,
/// a complication opening the app.
final class WatchRouter: ObservableObject {
    static let shared = WatchRouter()

    @Published var path: [WatchRoute] = []

    func open(_ route: WatchRoute) {
        path = [route]
    }

    /// Complications open the app with `alfonso://<route>`.
    func open(url: URL) {
        switch url.host() {
        case "climate":
            open(.climate)
        default:
            path = []
        }
    }
}

/// The day on the wrist: the air conditioners and the exercise routine, with
/// San Benito one tap away.
struct HomeView: View {
    @ObservedObject private var climate = ClimateStore.shared

    private var climateSummary: String {
        switch climate.onCount {
        case _ where climate.units.isEmpty: "Controla los aires"
        case 0: "Todos apagados"
        case 1: "1 encendido"
        default: "\(climate.onCount) encendidos"
        }
    }

    var body: some View {
        List {
            Section {
                NavigationLink(value: WatchRoute.climate) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Aires")
                            .font(.headline)
                        Text(climateSummary)
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
        .task { await climate.refresh() }
    }
}

