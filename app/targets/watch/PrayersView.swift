import SwiftUI
import WatchKit

/// The Auxilium sequence for today, one prayer per screen: scroll the text with
/// the crown, tap to move on, and the last step marks the day.
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
        ScrollView {
            VStack(alignment: .leading, spacing: 6) {
                Text(session.step.title)
                    .font(.headline)

                if let subtitle = session.step.subtitle {
                    Text(subtitle)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }

                Text(session.step.text)
                    .font(.body)

                HStack(spacing: 6) {
                    if session.index > 0 {
                        Button {
                            session.goBack()
                        } label: {
                            Image(systemName: "chevron.left")
                        }
                        .buttonStyle(.bordered)
                        .fixedSize()
                    }

                    Button(session.isLast ? "Terminar" : "Siguiente") {
                        advance()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.accentColor)
                    .foregroundStyle(.black)
                }
                .padding(.top, 6)
            }
            // A fresh identity per step so the next prayer opens at its
            // beginning instead of keeping the previous scroll offset.
            .id(session.index)
        }
    }

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
