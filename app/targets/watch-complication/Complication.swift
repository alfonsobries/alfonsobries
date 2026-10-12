import SwiftUI
import WidgetKit

@main
struct AlfonsoComplicationBundle: WidgetBundle {
    var body: some Widget {
        ClimateShortcut()
        PrayerShortcut()
    }
}

/// A watch face shortcut straight into the air conditioners.
struct ClimateShortcut: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "ClimateShortcut", provider: ShortcutProvider()) { _ in
            ShortcutView(
                title: "Aires",
                subtitle: "Ajustar la casa",
                symbol: "snowflake",
                url: URL(string: "alfonso://climate")!
            )
        }
        .configurationDisplayName("Aires")
        .description("Abre los aires de la casa.")
        .supportedFamilies(ShortcutView.families)
    }
}

/// A watch face shortcut into the daily prayers.
struct PrayerShortcut: Widget {
    var body: some WidgetConfiguration {
        // The kind is the identity watch faces store; renaming it would drop the complication from them.
        StaticConfiguration(kind: "RosarioShortcut", provider: ShortcutProvider()) { _ in
            ShortcutView(
                title: "Oración",
                subtitle: "Auxilium",
                symbol: "hands.sparkles.fill",
                url: URL(string: "alfonso://prayers")!
            )
        }
        .configurationDisplayName("Oración")
        .description("Abre las oraciones del día.")
        .supportedFamilies(ShortcutView.families)
    }
}

struct ShortcutEntry: TimelineEntry {
    let date: Date
}

/// Static on purpose: the shortcuts carry no state worth refreshing, they exist
/// so each screen is one tap away from the wrist.
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
    static let families: [WidgetFamily] = [
        .accessoryCircular,
        .accessoryCorner,
        .accessoryInline,
        .accessoryRectangular,
    ]

    let title: String
    let subtitle: String
    let symbol: String
    let url: URL

    @Environment(\.widgetFamily) private var family

    var body: some View {
        content
            .containerBackground(.clear, for: .widget)
            .widgetURL(url)
    }

    @ViewBuilder
    private var content: some View {
        switch family {
        case .accessoryInline:
            Label(title, systemImage: symbol)

        case .accessoryCorner:
            Image(systemName: symbol)
                .font(.title2)
                .widgetLabel(title)

        case .accessoryRectangular:
            HStack(spacing: 6) {
                Image(systemName: symbol)
                    .font(.title3)
                VStack(alignment: .leading, spacing: 0) {
                    Text(title)
                        .font(.headline)
                    Text(subtitle)
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
            .accessibilityLabel(title)
        }
    }
}
