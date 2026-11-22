import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - 색 (뽀송 디자인 시스템: src/styles.css 토큰과 같은 값)

private extension Color {
    init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }
}

/// 브랜드 색은 기기 맥락에만 쓴다. 세탁기는 하늘, 건조기는 주황이고 나머지는 시스템의 글자색을 따른다.
private enum Palette {
    /// `--color-sky-deep` 칩·진행 막대
    static let washer = Color(hex: 0x3CC3EC)
    /// `--color-orange-deep` 칩·진행 막대
    static let dryer = Color(hex: 0xF7953E)
    /// `--color-sky-water` 어두운 면(Dynamic Island) 위의 시간 글자
    static let washerWater = Color(hex: 0x9FE7FB)
    /// `--color-orange-water`
    static let dryerWater = Color(hex: 0xFDB576)
    /// `--color-ink3` 오류 칩
    static let off = Color(hex: 0x9A9DA4)
    /// `--color-live` 끝났을 때 칩 모서리의 체크
    static let live = Color(hex: 0x2FBF71)
}

/// 위젯 익스텐션은 i18next를 쓸 수 없어 한국어/영어만 직접 고른다
private func tr(_ ko: String, _ en: String) -> String {
    Locale.preferredLanguages.first?.hasPrefix("ko") == true ? ko : en
}

/// 숫자는 Allo를 쓰고 싶지만 위젯 익스텐션에 폰트를 넣기 전까지는 둥근 시스템 폰트(SF Pro Rounded)로 대신한다
private func numeral(_ size: CGFloat, _ weight: Font.Weight = .bold) -> Font {
    .system(size: size, weight: weight, design: .rounded)
}

// MARK: - 모델 확장

private extension LaundryActivityAttributes {
    var color: Color { machineKind == .washer ? Palette.washer : Palette.dryer }

    /// 어두운 면 위에서 시간 글자에 쓰는 밝은 색
    var waterColor: Color { machineKind == .washer ? Palette.washerWater : Palette.dryerWater }

    /// 칩 안의 번호. 제목("A동 건조기 3번", "A Dryer No. 3")의 마지막 숫자를 쓴다
    var machineNumber: String? {
        title.split(whereSeparator: { !$0.isNumber }).last.map(String.init)
    }
}

private extension LaundryActivityAttributes.ContentState {
    /// 카운트다운을 보여줄 수 있는 상태인지. 종료 시각을 모르거나 끝난 뒤에는 보여줄 수 없다
    var countdownEnd: Date? {
        switch phase {
        case .running, .cooling:
            return endDate
        case .pause, .detecting, .end, .error:
            return nil
        }
    }

    /// 건조기가 남은 시간을 아직 모르는 상태. 세탁기는 처음부터 경과 시간만 보여주므로 해당하지 않는다
    func isCalculating(for kind: LaundryActivityAttributes.Kind) -> Bool {
        switch phase {
        case .detecting: return true
        case .running: return kind == .dryer && endDate == nil
        case .cooling, .pause, .end, .error: return false
        }
    }
}

/// 분을 시계 모양으로. 일시정지처럼 멈춘 시간에 쓴다 (34 → "34:00", 63 → "1:03:00")
private func clock(minutes: Int) -> String {
    let hours = minutes / 60
    let rest = minutes % 60
    return hours > 0 ? String(format: "%d:%02d:00", hours, rest) : String(format: "%d:00", rest)
}

// MARK: - 칩

private enum ChipGlyph {
    case number
    case check
}

/// 기기를 알아보는 칩. 세탁기는 원, 건조기는 둥근 사각이고 안에 번호가 들어간다.
/// 끝났을 때는 모서리에 초록 체크가 붙고, 오류일 때는 회색이 된다.
private struct MachineChip: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState
    var size: CGFloat
    var glyph: ChipGlyph = .number

    private var fill: Color { state.phase == .error ? Palette.off : attributes.color }

    @ViewBuilder
    private var shape: some View {
        if attributes.machineKind == .washer {
            Circle().fill(fill)
        } else {
            RoundedRectangle(cornerRadius: size * 0.27, style: .continuous).fill(fill)
        }
    }

    var body: some View {
        ZStack {
            shape

            switch glyph {
            case .number:
                if let number = attributes.machineNumber {
                    Text(number)
                        .font(numeral(size * 0.4545))
                        .foregroundStyle(.white)
                        .minimumScaleFactor(0.6)
                        .lineLimit(1)
                }
            case .check:
                Image(systemName: "checkmark")
                    .font(.system(size: size * 0.45, weight: .heavy))
                    .foregroundStyle(.white)
            }
        }
        .frame(width: size, height: size)
        .overlay(alignment: .bottomTrailing) {
            if state.phase == .end, glyph == .number {
                let badge = size * 0.41
                Circle()
                    .fill(Palette.live)
                    .frame(width: badge, height: badge)
                    .overlay(Circle().stroke(Color(.systemBackground), lineWidth: 2))
                    .overlay(
                        Image(systemName: "checkmark")
                            .font(.system(size: badge * 0.5, weight: .heavy))
                            .foregroundStyle(.white)
                    )
                    .offset(x: size * 0.07, y: size * 0.07)
            }
        }
        .accessibilityHidden(true)
    }
}

// MARK: - 시간

/// 오른쪽에 놓는 시간. 시간이 흐르는 것은 OS가 직접 그리므로 푸시가 없어도 계속 흐른다.
/// 건조기는 남은 시간, 세탁기는 경과 시간(남은 시간을 모른다)을 보여주고, 모르면 시간 대신 문구를 둔다.
private struct TimeLabel: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState
    var size: CGFloat
    /// "시작한 지" 같은 작은 설명을 시간 위에 얹을지. 좁은 자리(컴팩트)에서는 끈다
    var showsCaption = true

    var body: some View {
        if let end = state.countdownEnd {
            // 이미 지난 시각이면 ClosedRange가 만들어지지 않으므로 현재로 맞춘다
            let now = Date()
            Text(timerInterval: now...max(end, now), countsDown: true)
                .font(numeral(size))
                .monospacedDigit()
                .multilineTextAlignment(.trailing)
        } else if state.phase == .pause, let minutes = state.remainingMinutes {
            // 일시정지 중에는 시간이 멈춘다. 흐리게 보여준다
            Text(clock(minutes: minutes))
                .font(numeral(size))
                .monospacedDigit()
                .foregroundStyle(.secondary)
        } else if state.isCalculating(for: attributes.machineKind) {
            Text(tr("시간 계산 중", "Calculating"))
                .font(.system(size: max(size * 0.55, 11), weight: .bold))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.trailing)
        } else if attributes.machineKind == .washer, state.phase == .running {
            VStack(alignment: .trailing, spacing: 4) {
                if showsCaption {
                    Text(tr("시작한 지", "Running for"))
                        .font(.system(size: 11.5, weight: .semibold))
                        .foregroundStyle(.secondary)
                }
                // 1시간이 넘으면 자리가 늘어나므로 줄어들 수 있게 해 둔다
                Text(attributes.startDate, style: .timer)
                    .font(numeral(size))
                    .monospacedDigit()
                    .multilineTextAlignment(.trailing)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
            }
        }
    }
}

// MARK: - 진행 막대

/// 사용 시작부터 종료 예상 시각까지의 막대. 시간이 흐르는 대로 OS가 채운다.
/// 일시정지에서는 멈춘 채 흐리게 두고, 세탁기·계산 중·끝·오류에서는 막대 자체를 그리지 않는다.
private struct CycleBar: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    /// 일시정지 시점까지 진행한 비율. 남은 시간을 모르면 nil
    private var pausedFraction: Double? {
        guard let minutes = state.remainingMinutes else { return nil }
        let elapsed = max(0, state.updatedAt - attributes.startedAt)
        let total = elapsed + Double(minutes) * 60
        return total > 0 ? min(1, elapsed / total) : nil
    }

    var body: some View {
        Group {
            if let end = state.countdownEnd, end > attributes.startDate {
                ProgressView(
                    timerInterval: attributes.startDate...end,
                    countsDown: false,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .tint(attributes.color)
            } else if state.phase == .pause, let fraction = pausedFraction {
                ProgressView(value: fraction)
                    .tint(attributes.color)
                    .opacity(0.45)
            }
        }
        // 선형 막대는 기본 높이가 낮아 디자인의 6pt에 맞춘다
        .scaleEffect(x: 1, y: 1.5)
    }

    /// 자리를 차지할 막대가 있는지. 없으면 위아래 간격도 만들지 않는다
    var isVisible: Bool {
        if let end = state.countdownEnd, end > attributes.startDate { return true }
        return state.phase == .pause && pausedFraction != nil
    }
}

// MARK: - 문구

/// 제목 줄과 설명 줄. 끝났을 때와 오류일 때는 제목 자리에 상태 문장이 오고, 기기 이름은 설명 줄로 내려간다.
private struct Headline: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    @ViewBuilder
    var body: some View {
        switch state.phase {
        case .end:
            Text(attributes.machineKind == .washer
                ? tr("세탁이 끝났어요", "Washing is done")
                : tr("건조가 끝났어요", "Drying is done"))
        case .error:
            Text(tr("기기에 문제가 생겼어요", "Something went wrong"))
        default:
            Text(attributes.title)
        }
    }
}

private struct Subline: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    private var label: String {
        switch state.phase {
        case .running:
            if attributes.machineKind == .washer { return tr("세탁 중", "Washing") }
            return state.endDate == nil ? tr("방금 시작했어요", "Just started") : tr("건조 중", "Drying")
        case .cooling: return tr("냉각 중", "Cooling down")
        case .pause: return tr("일시정지", "Paused")
        case .detecting: return tr("방금 시작했어요", "Just started")
        case .end: return tr("\(attributes.title)에서 꺼내 주세요", "Take it out of \(attributes.title)")
        case .error: return attributes.title
        }
    }

    var body: some View {
        // "건조 중 · 22:21 종료": 종료 시각을 알 때만 덧붙인다
        if let end = state.countdownEnd {
            (Text(verbatim: "\(label) · ") + Text(end, style: .time) + Text(verbatim: tr(" 종료", " end")))
        } else {
            Text(label)
        }
    }
}

// MARK: - 잠금화면

private struct LockScreenView: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    var body: some View {
        let bar = CycleBar(attributes: attributes, state: state)

        VStack(spacing: 14) {
            HStack(spacing: 12) {
                MachineChip(attributes: attributes, state: state, size: 44)

                VStack(alignment: .leading, spacing: 3) {
                    Headline(attributes: attributes, state: state)
                        .font(.system(size: 16, weight: .bold))
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                    Subline(attributes: attributes, state: state)
                        .font(.system(size: 13))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }

                Spacer(minLength: 8)

                TimeLabel(attributes: attributes, state: state, size: 32)
            }

            if bar.isVisible { bar }
        }
        .padding(16)
    }
}

// MARK: - Dynamic Island

/// Dynamic Island는 항상 어두운 면이라 글자색을 직접 정한다
private struct ExpandedBottom: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    var body: some View {
        let bar = CycleBar(attributes: attributes, state: state)

        VStack(alignment: .leading, spacing: 3) {
            Headline(attributes: attributes, state: state)
                .font(.system(size: 16, weight: .bold))
                .foregroundStyle(.white)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            Subline(attributes: attributes, state: state)
                .font(.system(size: 13))
                .foregroundStyle(.white.opacity(0.6))
                .lineLimit(1)
                .minimumScaleFactor(0.8)

            if bar.isVisible {
                bar.padding(.top, 9)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        // 맨 아래 줄은 Dynamic Island의 둥근 모서리에 걸리므로 좌우로 들여 쓴다
        .padding(.horizontal, 10)
        .padding(.top, 4)
        .padding(.bottom, 12)
    }
}

/// 컴팩트 오른쪽. 끝나면 시간 대신 "끝", 시간을 모르면 아무것도 두지 않는다
private struct CompactTrailing: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    var body: some View {
        if state.phase == .end {
            Text(tr("끝", "Done"))
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(attributes.waterColor)
        } else if state.phase == .error {
            Image(systemName: "exclamationmark")
                .font(.system(size: 13, weight: .heavy))
                .foregroundStyle(Palette.off)
        } else {
            TimeLabel(attributes: attributes, state: state, size: 15, showsCaption: false)
                .foregroundStyle(attributes.waterColor)
                .frame(maxWidth: 56)
        }
    }
}

/// 최소. 건조기는 칩 둘레에 진행 고리를 두르고, 세탁기는 진행률이 없어 칩만 둔다
private struct MinimalView: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    var body: some View {
        if let end = state.countdownEnd, end > attributes.startDate {
            ZStack {
                ProgressView(
                    timerInterval: attributes.startDate...end,
                    countsDown: false,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .progressViewStyle(.circular)
                .tint(attributes.color)

                MachineChip(attributes: attributes, state: state, size: 16)
            }
        } else {
            MachineChip(attributes: attributes, state: state, size: 22)
        }
    }
}

struct LaundryLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: LaundryActivityAttributes.self) { context in
            LockScreenView(attributes: context.attributes, state: context.state)
                .activityBackgroundTint(Color(.systemBackground).opacity(0.9))
                .activitySystemActionForegroundColor(context.attributes.color)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    MachineChip(attributes: context.attributes, state: context.state, size: 44)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    TimeLabel(attributes: context.attributes, state: context.state, size: 34)
                        .foregroundStyle(context.attributes.waterColor)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ExpandedBottom(attributes: context.attributes, state: context.state)
                }
            } compactLeading: {
                MachineChip(
                    attributes: context.attributes,
                    state: context.state,
                    size: 22,
                    glyph: context.state.phase == .end ? .check : .number
                )
            } compactTrailing: {
                CompactTrailing(attributes: context.attributes, state: context.state)
            } minimal: {
                MinimalView(attributes: context.attributes, state: context.state)
            }
            .keylineTint(context.attributes.color)
        }
    }
}

// MARK: - Xcode Preview (Canvas에서 잠금화면/Dynamic Island를 상태별로 확인한다)

#if DEBUG
/// 사용을 시작한 지 30분이 지난 것으로 보여준다
private let previewAttributes = LaundryActivityAttributes(
    machineUuid: "preview",
    kind: "DRYER",
    title: "A동 건조기 5번",
    startedAt: Date().addingTimeInterval(-30 * 60).timeIntervalSince1970
)

private let washerPreviewAttributes = LaundryActivityAttributes(
    machineUuid: "preview-washer",
    kind: "WASHER",
    title: "A동 세탁기 3번",
    startedAt: Date().addingTimeInterval(-18 * 60).timeIntervalSince1970
)

private func previewState(
    _ state: String,
    minutes: Int? = nil,
    updatedAt: Date = Date()
) -> LaundryActivityAttributes.ContentState {
    LaundryActivityAttributes.ContentState(
        state: state,
        endsAt: minutes.map { updatedAt.addingTimeInterval(Double($0) * 60).timeIntervalSince1970 },
        remainingMinutes: minutes,
        updatedAt: updatedAt.timeIntervalSince1970
    )
}

@available(iOS 17.0, *)
#Preview("건조기 잠금화면", as: .content, using: previewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING", minutes: 42)
    previewState("COOLING", minutes: 5)
    previewState("PAUSE", minutes: 34)
    previewState("DETECTING")
    previewState("END")
    previewState("ERROR")
}

@available(iOS 17.0, *)
#Preview("세탁기 잠금화면", as: .content, using: washerPreviewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING")
    previewState("END")
    previewState("ERROR")
}

@available(iOS 17.0, *)
#Preview("Dynamic Island 확장", as: .dynamicIsland(.expanded), using: previewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING", minutes: 42)
    previewState("COOLING", minutes: 5)
    previewState("DETECTING")
    previewState("END")
}

@available(iOS 17.0, *)
#Preview("세탁기 Dynamic Island 확장", as: .dynamicIsland(.expanded), using: washerPreviewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING")
    previewState("END")
}

@available(iOS 17.0, *)
#Preview("Dynamic Island 컴팩트", as: .dynamicIsland(.compact), using: previewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING", minutes: 42)
    previewState("END")
}

@available(iOS 17.0, *)
#Preview("세탁기 Dynamic Island 컴팩트", as: .dynamicIsland(.compact), using: washerPreviewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING")
}

@available(iOS 17.0, *)
#Preview("Dynamic Island 최소", as: .dynamicIsland(.minimal), using: previewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING", minutes: 42)
}

@available(iOS 17.0, *)
#Preview("세탁기 Dynamic Island 최소", as: .dynamicIsland(.minimal), using: washerPreviewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING")
}
#endif
