import SwiftUI
import WatchKit

/// How each mode reads on the wrist; the tints match the iPhone's Aires screen.
enum ClimateMode {
    static let order = ["cool", "heat", "auto", "dry", "fan"]

    static func label(_ mode: String) -> String {
        switch mode {
        case "cool": "Frío"
        case "heat": "Calor"
        case "dry": "Seco"
        case "fan": "Ventilador"
        default: "Auto"
        }
    }

    static func activity(_ mode: String) -> String {
        switch mode {
        case "cool": "Enfriando"
        case "heat": "Calentando"
        case "dry": "Deshumidificando"
        case "fan": "Solo ventilador"
        default: "Automático"
        }
    }

    static func symbol(_ mode: String) -> String {
        switch mode {
        case "cool": "snowflake"
        case "heat": "sun.max.fill"
        case "dry": "drop.fill"
        case "fan": "fan.fill"
        default: "arrow.triangle.2.circlepath"
        }
    }

    static func tint(_ mode: String) -> Color {
        switch mode {
        case "cool": Color(red: 0.23, green: 0.51, blue: 0.96)
        case "heat": Color(red: 0.98, green: 0.45, blue: 0.09)
        case "dry": Color(red: 0.08, green: 0.72, blue: 0.65)
        case "fan": Color(red: 0.13, green: 0.77, blue: 0.37)
        default: Color(red: 0.55, green: 0.36, blue: 0.96)
        }
    }

    static func fanLabel(_ speed: String) -> String {
        switch speed {
        case "silent": "Silencioso"
        case "low": "Bajo"
        case "medium": "Medio"
        case "high": "Alto"
        case "max": "Máximo"
        default: "Auto"
        }
    }

    static func temperature(_ value: Double?) -> String {
        guard let value else {
            return "-"
        }

        return value.truncatingRemainder(dividingBy: 1) == 0
            ? "\(Int(value))°"
            : String(format: "%.1f°", value)
    }

    static func subtitle(for unit: ClimateUnit) -> String {
        guard unit.online, let state = unit.state else {
            return "Sin conexión"
        }

        guard state.power else {
            return "Apagado"
        }

        return state.mode == "fan"
            ? activity(state.mode)
            : "\(activity(state.mode)) a \(temperature(state.targetTemperature))"
    }
}

struct ClimateListView: View {
    @ObservedObject private var store = ClimateStore.shared

    var body: some View {
        content
            .navigationTitle("Aires")
            .task { await store.refresh() }
            .alert(store.alert ?? "", isPresented: alertShown) {
                Button("OK", role: .cancel) {}
            }
    }

    @ViewBuilder
    private var content: some View {
        if store.units.isEmpty, case let .failed(message) = store.status {
            VStack(spacing: 8) {
                Image(systemName: "wifi.exclamationmark")
                    .font(.title2)
                    .foregroundStyle(.secondary)
                Text(message)
                    .font(.footnote)
                    .multilineTextAlignment(.center)
                Button("Reintentar") {
                    Task { await store.refresh() }
                }
            }
        } else if store.units.isEmpty {
            ProgressView()
        } else {
            List {
                if store.onCount > 0 {
                    Button(role: .destructive) {
                        Task { await store.turnAllOff() }
                    } label: {
                        Label("Apagar todos", systemImage: "power")
                    }
                }

                ForEach(store.units) { unit in
                    NavigationLink(value: WatchRoute.climateUnit(unit.id)) {
                        ClimateRow(unit: unit)
                    }
                    .disabled(!unit.online || unit.state == nil)
                    .swipeActions {
                        if let state = unit.state {
                            Button {
                                Task { await store.change(unit.id, ["power": !state.power]) { $0.power.toggle() } }
                            } label: {
                                Label(state.power ? "Apagar" : "Encender", systemImage: "power")
                            }
                            .tint(state.power ? .red : .green)
                        }
                    }
                }
            }
        }
    }

    private var alertShown: Binding<Bool> {
        Binding(
            get: { store.alert != nil },
            set: { if !$0 { store.alert = nil } }
        )
    }
}

private struct ClimateRow: View {
    let unit: ClimateUnit

    var body: some View {
        let on = unit.state?.power == true
        let mode = unit.state?.mode ?? "cool"

        HStack(spacing: 8) {
            Image(systemName: on ? ClimateMode.symbol(mode) : "power")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(on ? .white : .secondary)
                .frame(width: 28, height: 28)
                .background(Circle().fill(on ? ClimateMode.tint(mode) : Color.gray.opacity(0.25)))

            VStack(alignment: .leading, spacing: 1) {
                Text(unit.name)
                    .font(.headline)
                    .lineLimit(1)
                Text(ClimateMode.subtitle(for: unit))
                    .font(.footnote)
                    .foregroundStyle(unit.online ? Color.secondary : Color.red)
                    .lineLimit(1)
            }
        }
        .accessibilityElement(children: .combine)
    }
}

struct ClimateUnitView: View {
    let unitId: String

    @ObservedObject private var store = ClimateStore.shared
    @State private var crown: Double = 24
    @State private var pendingTarget: Task<Void, Never>?
    @State private var crownReady = false

    var body: some View {
        if let unit = store.unit(unitId), let state = unit.state {
            detail(unit: unit, state: state)
                .navigationTitle(unit.name)
                .onAppear {
                    crown = state.targetTemperature
                    crownReady = true
                }
                .onChange(of: state.targetTemperature) { _, value in
                    if pendingTarget == nil {
                        crown = value
                    }
                }
        } else {
            Text("Sin conexión con este aire.")
                .font(.footnote)
                .multilineTextAlignment(.center)
        }
    }

    private func detail(unit: ClimateUnit, state: ClimateState) -> some View {
        let caps = unit.capabilities

        return ScrollView {
            VStack(spacing: 10) {
                Toggle(isOn: Binding(
                    get: { state.power },
                    set: { value in
                        Task { await store.change(unitId, ["power": value]) { $0.power = value } }
                    }
                )) {
                    Text("Encendido")
                }
                .tint(ClimateMode.tint(state.mode))

                if state.mode != "fan" {
                    HStack {
                        stepButton("minus", label: "Bajar temperatura", enabled: state.power && crown > caps.minTemperature) {
                            crown = max(caps.minTemperature, crown - caps.step)
                        }

                        VStack(spacing: 0) {
                            Text(ClimateMode.temperature(crown))
                                .font(.system(size: 34, weight: .light, design: .rounded))
                                .monospacedDigit()
                                .contentTransition(.numericText(value: crown))
                            Text("Adentro \(ClimateMode.temperature(state.indoorTemperature))")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                        .focusable(state.power)
                        .digitalCrownRotation(
                            $crown,
                            from: caps.minTemperature,
                            through: caps.maxTemperature,
                            by: caps.step,
                            sensitivity: .low,
                            isContinuous: false,
                            isHapticFeedbackEnabled: true
                        )
                        .accessibilityElement(children: .ignore)
                        .accessibilityLabel("Temperatura objetivo")
                        .accessibilityValue(ClimateMode.temperature(crown))
                        .accessibilityAdjustableAction { direction in
                            crown = direction == .increment
                                ? min(caps.maxTemperature, crown + caps.step)
                                : max(caps.minTemperature, crown - caps.step)
                        }

                        stepButton("plus", label: "Subir temperatura", enabled: state.power && crown < caps.maxTemperature) {
                            crown = min(caps.maxTemperature, crown + caps.step)
                        }
                    }
                    .opacity(state.power ? 1 : 0.5)
                    .onChange(of: crown) { _, value in
                        guard crownReady, value != state.targetTemperature else {
                            return
                        }

                        scheduleTarget(value)
                    }
                }

                Picker("Modo", selection: Binding(
                    get: { state.mode },
                    set: { value in
                        Task { await store.change(unitId, ["mode": value]) { $0.mode = value } }
                    }
                )) {
                    ForEach(ClimateMode.order.filter(caps.modes.contains), id: \.self) { mode in
                        Label(ClimateMode.label(mode), systemImage: ClimateMode.symbol(mode)).tag(mode)
                    }
                }
                .pickerStyle(.navigationLink)
                .disabled(!state.power)

                Picker("Ventilador", selection: Binding(
                    get: { state.fanSpeed },
                    set: { value in
                        Task { await store.change(unitId, ["fan_speed": value]) { $0.fanSpeed = value } }
                    }
                )) {
                    ForEach(caps.fanSpeeds, id: \.self) { speed in
                        Text(ClimateMode.fanLabel(speed)).tag(speed)
                    }
                }
                .pickerStyle(.navigationLink)
                .disabled(!state.power || state.mode == "dry")
            }
        }
    }

    private func stepButton(_ symbol: String, label: String, enabled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.footnote.weight(.bold))
        }
        .buttonStyle(.bordered)
        .buttonBorderShape(.circle)
        .frame(width: 36)
        .disabled(!enabled)
        .accessibilityLabel(label)
    }

    /// Crown turns and taps settle into one command once the wrist stops moving.
    private func scheduleTarget(_ value: Double) {
        pendingTarget?.cancel()
        pendingTarget = Task {
            try? await Task.sleep(for: .milliseconds(800))
            guard !Task.isCancelled else {
                return
            }

            await store.change(unitId, ["target_temperature": value]) { $0.targetTemperature = value }
            pendingTarget = nil
        }
    }
}
