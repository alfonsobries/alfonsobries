import SwiftUI
import WatchKit

/// The pocket rosary by hand: tap to advance, the crown passes the beads on
/// decade steps, and every bead lands as a tick on the wrist so it can be
/// prayed without looking.
struct PrayView: View {
    @ObservedObject var session: RosarySession
    @Environment(\.dismiss) private var dismiss

    @State private var crown = 0.0
    @State private var finished = false

    var body: some View {
        Group {
            if finished {
                CompletedView()
            } else if let bead = session.step.bead {
                beadView(bead)
            } else {
                textView
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationTitle(session.sectionLabel)
    }

    private func beadView(_ bead: RosaryStep.Bead) -> some View {
        ZStack {
            DecadeRing(current: bead.index, count: bead.count)

            VStack(spacing: 3) {
                Text(session.step.title)
                    .font(.headline)
                    .multilineTextAlignment(.center)

                if bead.index > 0 {
                    Text("\(bead.index) de \(bead.count)")
                        .font(.system(.title2, design: .rounded).weight(.bold))
                        .foregroundStyle(Color.accentColor)
                }

                if let subtitle = session.step.subtitle, bead.index == 0 {
                    Text(subtitle)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(.horizontal, 26)
        }
        .contentShape(Rectangle())
        .onTapGesture { advance() }
        .focusable()
        .digitalCrownRotation(
            $crown,
            from: 0,
            through: Double(session.steps.count - 1),
            by: 1,
            sensitivity: .medium,
            isContinuous: false,
            isHapticFeedbackEnabled: true
        )
        .onChange(of: crown) { _, value in
            let target = Int(value.rounded())

            if target != session.index {
                session.index = min(max(target, 0), session.steps.count - 1)
                WKInterfaceDevice.current().play(.click)
            }
        }
        .onAppear { crown = Double(session.index) }
    }

    private var textView: some View {
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

                Button(session.isLast ? "Terminar" : "Siguiente") {
                    advance()
                }
                .buttonStyle(.borderedProminent)
                .tint(.accentColor)
                .foregroundStyle(.black)
                .padding(.top, 6)
            }
        }
    }

    private func advance() {
        if session.isLast {
            WKInterfaceDevice.current().play(.success)
            finished = true
            return
        }

        session.advance()
        crown = Double(session.index)

        // A decade closing (arriving at the Gloria) lands stronger than a bead.
        WKInterfaceDevice.current().play(session.step.bead == nil ? .success : .click)
    }
}

/// The decade as a ring of beads around the screen edge — the watch's round
/// face becomes the rosary. The Padre Nuestro bead sits at the top.
struct DecadeRing: View {
    let current: Int
    let count: Int

    var body: some View {
        GeometryReader { geometry in
            let size = min(geometry.size.width, geometry.size.height)
            let radius = size / 2 - 8

            ZStack {
                ForEach(0 ... count, id: \.self) { index in
                    let angle = Angle.degrees(Double(index) / Double(count + 1) * 360 - 90)
                    let filled = index < current
                    let isCurrent = index == current

                    Circle()
                        .fill(filled || isCurrent ? Color.accentColor : Color.gray.opacity(0.35))
                        .frame(
                            width: beadSize(index: index, isCurrent: isCurrent),
                            height: beadSize(index: index, isCurrent: isCurrent)
                        )
                        .position(
                            x: geometry.size.width / 2 + cos(angle.radians) * radius,
                            y: geometry.size.height / 2 + sin(angle.radians) * radius
                        )
                }
            }
        }
        .ignoresSafeArea()
    }

    private func beadSize(index: Int, isCurrent: Bool) -> CGFloat {
        let base: CGFloat = index == 0 ? 12 : 8
        return isCurrent ? base + 4 : base
    }
}

struct CompletedView: View {
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "checkmark.seal.fill")
                .font(.largeTitle)
                .foregroundStyle(Color.accentColor)
            Text("Rosario completado")
                .font(.headline)
                .multilineTextAlignment(.center)
            Text("Márcalo como rezado en tu iPhone.")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
    }
}
