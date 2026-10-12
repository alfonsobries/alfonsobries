import SwiftUI
import WidgetKit

@main
struct AlfonsoComplicationBundle: WidgetBundle {
    var body: some Widget {
        ClimateShortcut()
        PrayerShortcut()
    }
}

/// A watch face shortcut straight into the air conditioners, with how many are
/// on as of the last time the watch app saw them.
struct ClimateShortcut: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "ClimateShortcut", provider: ClimateProvider()) { entry in
            ShortcutView(
                title: "Aires",
                subtitle: entry.subtitle,
                symbol: "snowflake",
                url: URL(string: "alfonso://climate")!,
                badge: entry.onCount.map(String.init)
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

struct ClimateEntry: TimelineEntry {
    let date: Date
    let onCount: Int?

    var subtitle: String {
        switch onCount {
        case nil: "Ajustar la casa"
        case 0: "Todos apagados"
        case 1: "1 encendido"
        case let count?: "\(count) encendidos"
        }
    }
}

/// Reads the count the watch app shares through the app group; the app reloads
/// this timeline whenever the count changes, so it never polls on its own.
struct ClimateProvider: TimelineProvider {
    private static let suite = "group.com.alfonsobries.app"

    func placeholder(in context: Context) -> ClimateEntry {
        ClimateEntry(date: Date(), onCount: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (ClimateEntry) -> Void) {
        completion(current())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ClimateEntry>) -> Void) {
        completion(Timeline(entries: [current()], policy: .never))
    }

    private func current() -> ClimateEntry {
        let count = UserDefaults(suiteName: Self.suite)?.object(forKey: "climate-on-count") as? Int
        return ClimateEntry(date: Date(), onCount: count)
    }
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
    var badge: String? = nil

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
            Label(badge.map { "\(title) \($0)" } ?? title, systemImage: symbol)

        case .accessoryCorner:
            Image(systemName: symbol)
                .font(.title2)
                .widgetLabel(badge.map { "\(title) \($0)" } ?? title)

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
                if let badge {
                    VStack(spacing: 0) {
                        Image(systemName: symbol)
                            .font(.caption)
                        Text(badge)
                            .font(.headline)
                            .monospacedDigit()
                    }
                } else {
                    Image(systemName: symbol)
                        .font(.title3)
                }
            }
            .accessibilityLabel(badge.map { "\(title), \($0) encendidos" } ?? title)
        }
    }
}
