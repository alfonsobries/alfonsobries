import SwiftUI
import WatchKit

/// The Auxilium sequence for today, one prayer per screen: scroll the text with
/// the crown, move on from the toolbar without reaching the end, and the last
/// step marks the day.
struct PrayersView: View {
    @StateObject private var session = PrayerSession()
    @State private var finished = false

    var body: some View {
        Group {
            if finished {
                CompletedView(title: "Oraciones completadas", module: .prayers)
            } else {
                stepView
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationTitle(finished ? "Auxilium" : session.positionLabel)
    }

    private var stepView: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 6) {
                    // A zero-height anchor: the next prayer opens at its
                    // beginning instead of keeping the previous scroll offset.
                    Color.clear
                        .frame(height: 0)
                        .id(topAnchor)

                    Text(session.step.title)
                        .font(.headline)

                    if let subtitle = session.step.subtitle {
                        Text(subtitle)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }

                    Text(session.step.text)
                        .font(.body)
                }
                // Clearance for the floating toolbar, so the closing lines of a
                // prayer never sit behind it.
                .padding(.bottom, 28)
            }
            .onChange(of: session.index) { _, _ in
                proxy.scrollTo(topAnchor, anchor: .top)
            }
        }
        .toolbar {
            ToolbarItemGroup(placement: .bottomBar) {
                if session.index > 0 {
                    Button {
                        session.goBack()
                    } label: {
                        Image(systemName: "chevron.left")
                    }
                }

                Button(session.isLast ? "Terminar" : "Siguiente") {
                    advance()
                }
                .tint(.accentColor)
            }
        }
    }

    private var topAnchor: String { "prayer-top" }

    private func advance() {
        if session.isLast {
            WKInterfaceDevice.current().play(.success)
            finished = true
            return
        }

        session.advance()
        WKInterfaceDevice.current().play(.click)
    }
}
