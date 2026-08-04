import SwiftUI
import WidgetKit

@main
struct RosarioComplicationBundle: WidgetBundle {
    var body: some Widget {
        PrayerShortcut()
    }
}

/// A watch face shortcut into the app. Static on purpose: it carries no state
/// worth refreshing, it exists so praying is one tap away from the wrist.
struct PrayerShortcut: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "RosarioShortcut", provider: ShortcutProvider()) { _ in
            ShortcutView()
        }
        .configurationDisplayName("Oración")
        .description("Abre el rosario y las oraciones del día.")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryCorner,
            .accessoryInline,
            .accessoryRectangular,
        ])
    }
}

struct ShortcutEntry: TimelineEntry {
    let date: Date
}

struct ShortcutProvider: TimelineProvider {
    func placeholder(in context: Context) -> ShortcutEntry {
        ShortcutEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (ShortcutEntry) -> Void) {
        completion(ShortcutEntry(date: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ShortcutEntry>) -> Void) {
        completion(Timeline(entries: [ShortcutEntry(date: Date())], policy: .never))
    }
}

struct ShortcutView: View {
    @Environment(\.widgetFamily) private var family

    private let symbol = "hands.sparkles.fill"

    var body: some View {
        content
            .containerBackground(.clear, for: .widget)
    }

    @ViewBuilder
    private var content: some View {
        switch family {
        case .accessoryInline:
            Label("Oración", systemImage: symbol)

        case .accessoryCorner:
            Image(systemName: symbol)
                .font(.title2)
                .widgetLabel("Oración")

        case .accessoryRectangular:
            HStack(spacing: 6) {
                Image(systemName: symbol)
                    .font(.title3)
                VStack(alignment: .leading, spacing: 0) {
                    Text("Oración")
                        .font(.headline)
                    Text("Rosario y Auxilium")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

        default:
            ZStack {
                AccessoryWidgetBackground()
                Image(systemName: symbol)
                    .font(.title3)
            }
        }
    }
}
