import SwiftUI

@main
struct RosarioApp: App {
    init() {
        PhoneLink.shared.activate()
    }

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                HomeView()
            }
            .task {
                await RosaryAPI.flushPending()
            }
        }
    }
}

/// Today's mysteries front and center, the other sets one tap away.
struct HomeView: View {
    private let todayKey = RosaryLibrary.todayKey

    var body: some View {
        List {
            Section {
                SetRow(setKey: todayKey, isToday: true)
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
        }
        .navigationTitle("Rosario")
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

        NavigationLink {
            SetView(setKey: setKey)
        } label: {
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
