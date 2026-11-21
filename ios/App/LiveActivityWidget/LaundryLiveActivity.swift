import ActivityKit
import SwiftUI
import WidgetKit

/// 앱의 primary 색(`src/styles.css`의 #4F7DF3과 같은 값)
private let brandColor = Color(red: 0x4F / 255, green: 0x7D / 255, blue: 0xF3 / 255)

/// 위젯 익스텐션은 i18next를 쓸 수 없어 한국어/영어만 직접 고른다
private func tr(_ ko: String, _ en: String) -> String {
    Locale.preferredLanguages.first?.hasPrefix("ko") == true ? ko : en
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

    func statusText(for kind: LaundryActivityAttributes.Kind) -> String {
        switch phase {
        case .running:
            if kind == .washer { return tr("세탁 중", "Washing") }
            return countdownEnd == nil ? tr("남은 시간 계산 중", "Calculating time left") : tr("건조 중", "Drying")
        case .cooling: return tr("냉각 중", "Cooling down")
        case .pause: return tr("일시정지", "Paused")
        case .detecting: return tr("시간 계산 중", "Calculating time left")
        case .end: return kind == .washer ? tr("세탁이 끝났어요", "Washing is done") : tr("건조가 끝났어요", "Drying is done")
        case .error: return tr("기기에 문제가 생겼어요", "Something went wrong")
        }
    }
}

/// 앱 로고. 상태는 문구와 진행 막대로 구분하고 아이콘은 항상 로고를 쓴다
private struct AppLogo: View {
    var size: CGFloat

    var body: some View {
        Image("AppLogo")
            .resizable()
            .scaledToFit()
            .frame(width: size, height: size)
            .accessibilityHidden(true)
    }
}

/// 건조기는 남은 시간, 세탁기는 경과 시간(남은 시간을 모른다). OS가 직접 그리므로 푸시가 없어도 계속 흐른다
private struct TimeLabel: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    var body: some View {
        if let end = state.countdownEnd {
            // 이미 지난 시각이면 ClosedRange가 만들어지지 않으므로 현재로 맞춘다
            let now = Date()
            Text(timerInterval: now...max(end, now), countsDown: true)
                .monospacedDigit()
                .multilineTextAlignment(.trailing)
        } else if state.phase == .end {
            Text(tr("완료", "Done"))
        } else if attributes.machineKind == .washer, state.phase != .error {
            // 1시간이 넘으면 자리가 늘어나므로 줄어들 수 있게 해 둔다
            Text(attributes.startDate, style: .timer)
                .monospacedDigit()
                .multilineTextAlignment(.trailing)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
        } else {
            Text("--")
        }
    }
}

/// 사용 시작부터 종료 예상 시각까지의 진행 막대. 시간이 흐르는 대로 OS가 채운다
private struct CycleProgress: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    var body: some View {
        if state.phase == .end {
            ProgressView(value: 1).tint(brandColor)
        } else if let end = state.countdownEnd, end > attributes.startDate {
            ProgressView(
                timerInterval: attributes.startDate...end,
                countsDown: false,
                label: { EmptyView() },
                currentValueLabel: { EmptyView() }
            )
            .tint(brandColor)
        }
    }
}

/// "12:15 완료 예정". 종료 시각을 알 때만 보여준다
private struct FinishTime: View {
    let state: LaundryActivityAttributes.ContentState

    var body: some View {
        if let end = state.countdownEnd {
            HStack(spacing: 4) {
                Text(tr("완료 예정", "Done at"))
                Text(end, style: .time)
            }
        }
    }
}

/// "건조 중 · 완료 예정 17:23". 잠금화면과 Dynamic Island 확장이 함께 쓴다
private struct StatusFooter: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    var body: some View {
        HStack {
            Text(state.statusText(for: attributes.machineKind))
            Spacer()
            FinishTime(state: state)
        }
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
}

private struct LockScreenView: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 14) {
                AppLogo(size: 40)

                Text(attributes.title)
                    .font(.headline)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                Spacer(minLength: 8)

                TimeLabel(attributes: attributes, state: state)
                    .font(.system(size: 30, weight: .semibold))
                    .foregroundStyle(state.phase == .end ? brandColor : .primary)
            }

            CycleProgress(attributes: attributes, state: state)

            StatusFooter(attributes: attributes, state: state)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}

/// Dynamic Island를 길게 눌러 펼쳤을 때의 아래쪽 내용.
/// 위쪽 줄은 카메라 영역 양옆(로고, 남은 시간)에만 놓을 수 있어 비어 보이므로, 제목도 아래쪽에 한 줄로 둔다
private struct ExpandedBottom: View {
    let attributes: LaundryActivityAttributes
    let state: LaundryActivityAttributes.ContentState

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(attributes.title)
                .font(.headline)
                .foregroundStyle(brandColor)
                .lineLimit(1)
                .minimumScaleFactor(0.8)

            CycleProgress(attributes: attributes, state: state)

            // 맨 아래 줄은 Dynamic Island의 둥근 모서리에 걸리므로 좌우로 들여 쓴다
            StatusFooter(attributes: attributes, state: state)
                .padding(.horizontal, 10)
        }
        .padding(.top, 4)
        .padding(.bottom, 12)
    }
}

struct LaundryLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: LaundryActivityAttributes.self) { context in
            LockScreenView(attributes: context.attributes, state: context.state)
                .activityBackgroundTint(Color(.systemBackground).opacity(0.9))
                .activitySystemActionForegroundColor(brandColor)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    AppLogo(size: 38)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    TimeLabel(attributes: context.attributes, state: context.state)
                        .font(.system(size: 34, weight: .semibold))
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ExpandedBottom(attributes: context.attributes, state: context.state)
                }
            } compactLeading: {
                AppLogo(size: 22)
            } compactTrailing: {
                TimeLabel(attributes: context.attributes, state: context.state)
                    .frame(maxWidth: 52)
            } minimal: {
                AppLogo(size: 22)
            }
            .keylineTint(brandColor)
        }
    }
}

// MARK: - Xcode Preview (Canvas에서 잠금화면/Dynamic Island를 상태별로 확인한다)

#if DEBUG
/// 사용을 시작한 지 30분이 지난 것으로 보여준다
private let previewAttributes = LaundryActivityAttributes(
    machineUuid: "preview",
    kind: "DRYER",
    title: "A동 건조기 3번",
    startedAt: Date().addingTimeInterval(-30 * 60).timeIntervalSince1970
)

private let washerPreviewAttributes = LaundryActivityAttributes(
    machineUuid: "preview-washer",
    kind: "WASHER",
    title: "A동 세탁기 2번",
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
#Preview("잠금화면", as: .content, using: previewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING", minutes: 42)
    previewState("COOLING", minutes: 8)
    previewState("PAUSE", minutes: 20)
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
}

@available(iOS 17.0, *)
#Preview("세탁기 Dynamic Island 확장", as: .dynamicIsland(.expanded), using: washerPreviewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING")
    previewState("END")
}

@available(iOS 17.0, *)
#Preview("세탁기 Dynamic Island 컴팩트", as: .dynamicIsland(.compact), using: washerPreviewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING")
}

@available(iOS 17.0, *)
#Preview("Dynamic Island 확장", as: .dynamicIsland(.expanded), using: previewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING", minutes: 42)
    previewState("COOLING", minutes: 8)
    previewState("DETECTING")
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
#Preview("Dynamic Island 최소", as: .dynamicIsland(.minimal), using: previewAttributes) {
    LaundryLiveActivity()
} contentStates: {
    previewState("RUNNING", minutes: 42)
}
#endif
