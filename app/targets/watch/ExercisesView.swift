import SwiftUI
import WatchKit

/// The daily routine on the wrist: one row per exercise, one tap per set. The
/// watch only adds sets — taking one back is the phone's job, where the whole
/// day is visible.
struct ExercisesView: View {
    @State private var plan: [WorkoutExercise] = WorkoutLibrary.plan
    @State private var counts: [String: Int] = [:]
    @State private var pending = false

    private var setsDone: Int {
        plan.reduce(0) { $0 + min(counts[$1.key] ?? 0, $1.sets) }
    }

    private var setsTotal: Int {
        plan.reduce(0) { $0 + $1.sets }
    }

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 6) {
                    Text("\(setsDone) de \(setsTotal) series")
                        .font(.headline)
                        .foregroundStyle(setsDone >= setsTotal ? Color.accentColor : .primary)

                    ProgressView(value: Double(setsDone), total: Double(max(setsTotal, 1)))
                        .tint(.accentColor)

                    Text(statusLine)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 2)
            }

            Section {
                ForEach(plan) { exercise in
                    ExerciseRow(
                        exercise: exercise,
                        done: min(counts[exercise.key] ?? 0, exercise.sets),
                        add: { add(exercise) }
                    )
                }
            } header: {
                Text("Toca para sumar una serie")
            }
        }
        .navigationTitle("Ejercicios")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            reload()
            pending = !(await WorkoutAPI.flushPending())
            reload()
        }
    }

    private var statusLine: String {
        if pending {
            return "Sin conexión · se envía luego"
        }

        if setsDone >= setsTotal {
            return "Rutina completa · 3 puntos"
        }

        return setsDone == 0 ? "Una serie ya cuenta el día" : "Termínala y son 3 puntos"
    }

    private func reload() {
        plan = WorkoutLibrary.plan
        counts = WorkoutLibrary.today
    }

    private func add(_ exercise: WorkoutExercise) {
        guard min(counts[exercise.key] ?? 0, exercise.sets) < exercise.sets else {
            return
        }

        WKInterfaceDevice.current().play(.click)

        Task {
            let settled = await WorkoutAPI.addSet(to: exercise)
            pending = !settled
            reload()

            if setsDone >= setsTotal {
                WKInterfaceDevice.current().play(.success)
            }
        }

        reload()
    }
}

private struct ExerciseRow: View {
    let exercise: WorkoutExercise
    let done: Int
    let add: () -> Void

    var body: some View {
        Button(action: add) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(exercise.title)
                        .font(.headline)
                    Text("\(exercise.sets) × \(exercise.setLabel)")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Text("\(done)/\(exercise.sets)")
                    .font(.headline)
                    .foregroundStyle(done >= exercise.sets ? Color.accentColor : .secondary)
            }
        }
        .buttonStyle(.plain)
        .disabled(done >= exercise.sets)
    }
}
