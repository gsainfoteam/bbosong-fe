import ActivityKit
import SwiftUI
import WidgetKit

/// 앱의 primary 색(`src/styles.css`의 #4F7DF3과 같은 값)
private let brandColor = Color(red: 0x4F / 255, green: 0x7D / 255, blue: 0xF3 / 255)

/// 위젯 익스텐션은 i18next를 쓸 수 없어 한국어/영어만 직접 고른다
private func tr(_ ko: String, _ en: String) -> String {
    Locale.preferredLanguages.first?.hasPrefix("ko") == true ? ko : en
}

private extension DryerActivityAttributes.ContentState {
    /// 카운트다운을 보여줄 수 있는 상태인지. 종료 시각을 모르거나 끝난 뒤에는 보여줄 수 없다
    var countdownEnd: Date? {
        switch phase {
        case .running, .cooling:
            return endDate
        case .pause, .detecting, .end, .error:
            return nil
        }
    }

    var statusText: String {
        switch phase {
        case .running: return countdownEnd == nil ? tr("남은 시간 계산 중", "Calculating time left") : tr("건조 중", "Drying")
        case .cooling: return tr("냉각 중", "Cooling down")
        case .pause: return tr("일시정지", "Paused")
        case .detecting: return tr("시간 계산 중", "Calculating time left")
        case .end: return tr("건조가 끝났어요", "Drying is done")
        case .error: return tr("기기에 문제가 생겼어요", "Something went wrong")
        }
    }

    var iconName: String {
        switch phase {
        case .end: return "checkmark.circle.fill"
        case .error: return "exclamationmark.triangle.fill"
        case .pause: return "pause.circle.fill"
        default: return "wind"
        }
    }
}

/// 남은 시간. OS가 직접 카운트다운하므로 푸시가 없어도 계속 줄어든다
private struct RemainingTime: View {
    let state: DryerActivityAttributes.ContentState

    var body: some View {
        if let end = state.countdownEnd {
            // 이미 지난 시각이면 ClosedRange가 만들어지지 않으므로 현재로 맞춘다
            let now = Date()
            Text(timerInterval: now...max(end, now), countsDown: true)
                .monospacedDigit()
                .multilineTextAlignment(.trailing)
        } else if state.phase == .end {
            Text(tr("완료", "Done"))
        } else {
            Text("--")
        }
    }
}

private struct LockScreenView: View {
    let attributes: DryerActivityAttributes
    let state: DryerActivityAttributes.ContentState

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: state.iconName)
                .font(.title)
                .foregroundStyle(brandColor)
                .frame(width: 36)

            VStack(alignment: .leading, spacing: 2) {
                Text(attributes.title)
                    .font(.headline)
                Text(state.statusText)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 8)

            RemainingTime(state: state)
                .font(.system(size: 30, weight: .semibold))
                .foregroundStyle(state.phase == .end ? brandColor : .primary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}

struct DryerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DryerActivityAttributes.self) { context in
            LockScreenView(attributes: context.attributes, state: context.state)
                .activityBackgroundTint(Color(.systemBackground).opacity(0.9))
                .activitySystemActionForegroundColor(brandColor)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Label(context.attributes.title, systemImage: context.state.iconName)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(brandColor)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    RemainingTime(state: context.state)
                        .font(.title2.weight(.semibold))
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.statusText)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            } compactLeading: {
                Image(systemName: context.state.iconName)
                    .foregroundStyle(brandColor)
            } compactTrailing: {
                RemainingTime(state: context.state)
                    .frame(maxWidth: 52)
            } minimal: {
                Image(systemName: context.state.iconName)
                    .foregroundStyle(brandColor)
            }
            .keylineTint(brandColor)
        }
    }
}

// MARK: - Xcode Preview (Canvas에서 잠금화면/Dynamic Island를 상태별로 확인한다)

#if DEBUG
private let previewAttributes = DryerActivityAttributes(machineUuid: "preview", title: "A동 건조기 3번")

private func previewState(
    _ state: String,
    minutes: Int? = nil,
    updatedAt: Date = Date()
) -> DryerActivityAttributes.ContentState {
    DryerActivityAttributes.ContentState(
        state: state,
        endsAt: minutes.map { updatedAt.addingTimeInterval(Double($0) * 60).timeIntervalSince1970 },
        remainingMinutes: minutes,
        updatedAt: updatedAt.timeIntervalSince1970
    )
}

@available(iOS 17.0, *)
#Preview("잠금화면", as: .content, using: previewAttributes) {
    DryerLiveActivity()
} contentStates: {
    previewState("RUNNING", minutes: 42)
    previewState("COOLING", minutes: 8)
    previewState("PAUSE", minutes: 20)
    previewState("DETECTING")
    previewState("END")
    previewState("ERROR")
}

@available(iOS 17.0, *)
#Preview("Dynamic Island 확장", as: .dynamicIsland(.expanded), using: previewAttributes) {
    DryerLiveActivity()
} contentStates: {
    previewState("RUNNING", minutes: 42)
    previewState("END")
}

@available(iOS 17.0, *)
#Preview("Dynamic Island 컴팩트", as: .dynamicIsland(.compact), using: previewAttributes) {
    DryerLiveActivity()
} contentStates: {
    previewState("RUNNING", minutes: 42)
    previewState("END")
}

@available(iOS 17.0, *)
#Preview("Dynamic Island 최소", as: .dynamicIsland(.minimal), using: previewAttributes) {
    DryerLiveActivity()
} contentStates: {
    previewState("RUNNING", minutes: 42)
}
#endif
