import SwiftUI

/// The closing screen for any module the watch can mark on its own.
struct CompletedView: View {
    let title: String
    let module: VirtueAPI.Module

    @State private var note = ""

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "checkmark.seal.fill")
                .font(.largeTitle)
                .foregroundStyle(Color.accentColor)
            Text(title)
                .font(.headline)
                .multilineTextAlignment(.center)
            Text(note)
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .task {
            guard VirtueAPI.isConfigured(module) else {
                note = "Abre la app en tu iPhone una vez para conectar el registro."
                return
            }

            note = await VirtueAPI.markCompleted(module)
                ? "Marcado como rezado."
                : "Se marcará en cuanto haya conexión."
        }
    }
}
