import ActivityKit
import Capacitor
import Foundation

/// 건조기 Live Activity를 시작/갱신/종료하는 앱 내 Capacitor 플러그인(JS 이름 `LiveActivity`).
///
/// - 앱 타깃은 iOS 15를 지원하므로 ActivityKit 호출은 모두 `#available(iOS 16.1, *)` 안에서만 한다.
/// - activity는 서버 푸시(`pushType: .token`)로 갱신되며, activity별 push token은 `pushToken` 이벤트로 JS에 전달한다.
///   토큰은 도중에 바뀔 수 있고 JS가 바뀔 때마다 서버에 다시 등록한다.
/// - 사용자가 잠금화면에서 지우거나 시스템이 종료하면 `activityEnded` 이벤트를 보낸다.
@objc(LiveActivityPlugin)
public class LiveActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LiveActivityPlugin"
    public let jsName = "LiveActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isSupported", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise),
    ]

    /// machineUuid → 이 activity의 토큰/상태 관찰 작업. 같은 activity를 중복 관찰하지 않도록 한다
    private var observers: [String: [Task<Void, Never>]] = [:]

    /// Debug 빌드(Xcode 직접 실행)는 APNs sandbox, TestFlight/App Store 빌드는 production이다
    private var environment: String {
        #if DEBUG
        return "SANDBOX"
        #else
        return "PRODUCTION"
        #endif
    }

    deinit {
        observers.values.flatMap { $0 }.forEach { $0.cancel() }
    }

    @objc func isSupported(_ call: CAPPluginCall) {
        if #available(iOS 16.1, *) {
            call.resolve(["supported": ActivityAuthorizationInfo().areActivitiesEnabled])
        } else {
            call.resolve(["supported": false])
        }
    }

    /// 같은 기계의 activity가 이미 있으면 내용만 갱신하고(앱 재시작 후 재연결 포함), 없으면 새로 시작한다
    @objc func start(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.reject("Live Activities require iOS 16.1 or later.", "UNSUPPORTED")
            return
        }
        guard let machineUuid = call.getString("machineUuid"), let title = call.getString("title"),
              let state = contentState(from: call)
        else {
            call.reject("machineUuid, title and state are required.", "INVALID_ARGUMENT")
            return
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            call.reject("Live Activities are disabled in Settings.", "DISABLED")
            return
        }

        Task {
            do {
                if let existing = Self.activity(for: machineUuid) {
                    await Self.update(existing, with: state)
                    self.observe(existing)
                    // 이미 관찰 중이면 토큰 이벤트가 다시 오지 않으므로, JS가 서버에 다시 등록할 수 있게 현재 토큰을 내보낸다
                    self.emitCurrentPushToken(of: existing)
                } else {
                    let activity = try Self.request(
                        attributes: DryerActivityAttributes(machineUuid: machineUuid, title: title),
                        state: state
                    )
                    self.observe(activity)
                }
                call.resolve()
            } catch {
                call.reject("Failed to start Live Activity: \(error.localizedDescription)", "START_FAILED")
            }
        }
    }

    @objc func update(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.resolve()
            return
        }
        guard let machineUuid = call.getString("machineUuid"), let state = contentState(from: call) else {
            call.reject("machineUuid and state are required.", "INVALID_ARGUMENT")
            return
        }
        guard let activity = Self.activity(for: machineUuid) else {
            call.resolve()
            return
        }

        Task {
            await Self.update(activity, with: state)
            call.resolve()
        }
    }

    /// 없는 activity를 끝내려 해도 성공으로 본다
    @objc func end(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.resolve()
            return
        }
        guard let machineUuid = call.getString("machineUuid") else {
            call.reject("machineUuid is required.", "INVALID_ARGUMENT")
            return
        }

        Task {
            self.stopObserving(machineUuid)
            for activity in Activity<DryerActivityAttributes>.activities
            where activity.attributes.machineUuid == machineUuid {
                await Self.end(activity)
            }
            call.resolve()
        }
    }

    // MARK: - ActivityKit (iOS 16.1+)

    @available(iOS 16.1, *)
    private func contentState(from call: CAPPluginCall) -> DryerActivityAttributes.ContentState? {
        guard let state = call.getString("state"), let updatedAt = call.getDouble("updatedAt") else {
            return nil
        }

        return DryerActivityAttributes.ContentState(
            state: state,
            endsAt: call.getDouble("endsAt"),
            remainingMinutes: call.getInt("remainingMinutes"),
            updatedAt: updatedAt
        )
    }

    @available(iOS 16.1, *)
    private static func activity(for machineUuid: String) -> Activity<DryerActivityAttributes>? {
        Activity<DryerActivityAttributes>.activities.first {
            $0.attributes.machineUuid == machineUuid
                && $0.activityState != .ended && $0.activityState != .dismissed
        }
    }

    @available(iOS 16.1, *)
    private static func request(
        attributes: DryerActivityAttributes,
        state: DryerActivityAttributes.ContentState
    ) throws -> Activity<DryerActivityAttributes> {
        if #available(iOS 16.2, *) {
            return try Activity.request(
                attributes: attributes,
                content: ActivityContent(state: state, staleDate: nil),
                pushType: .token
            )
        }

        return try Activity.request(attributes: attributes, contentState: state, pushType: .token)
    }

    @available(iOS 16.1, *)
    private static func update(
        _ activity: Activity<DryerActivityAttributes>,
        with state: DryerActivityAttributes.ContentState
    ) async {
        if #available(iOS 16.2, *) {
            await activity.update(ActivityContent(state: state, staleDate: nil))
        } else {
            await activity.update(using: state)
        }
    }

    @available(iOS 16.1, *)
    private static func end(_ activity: Activity<DryerActivityAttributes>) async {
        if #available(iOS 16.2, *) {
            await activity.end(nil, dismissalPolicy: .immediate)
        } else {
            await activity.end(using: nil, dismissalPolicy: .immediate)
        }
    }

    @available(iOS 16.1, *)
    private func emitCurrentPushToken(of activity: Activity<DryerActivityAttributes>) {
        // `pushToken` 프로퍼티는 iOS 16.2부터. 16.1은 `pushTokenUpdates`가 처음 구독될 때만 받을 수 있다
        guard #available(iOS 16.2, *), let data = activity.pushToken else { return }

        notifyListeners("pushToken", data: [
            "machineUuid": activity.attributes.machineUuid,
            "token": Self.hex(data),
            "environment": environment,
        ])
    }

    private static func hex(_ data: Data) -> String {
        data.map { String(format: "%02x", $0) }.joined()
    }

    /// push token 변경과 종료를 JS로 전달한다. `pushTokenUpdates`는 구독 즉시 현재 토큰부터 내보낸다
    @available(iOS 16.1, *)
    private func observe(_ activity: Activity<DryerActivityAttributes>) {
        let machineUuid = activity.attributes.machineUuid
        guard observers[machineUuid] == nil else { return }

        let tokenTask = Task { [weak self] in
            for await data in activity.pushTokenUpdates {
                self?.notifyListeners("pushToken", data: [
                    "machineUuid": machineUuid,
                    "token": Self.hex(data),
                    "environment": self?.environment ?? "PRODUCTION",
                ])
            }
        }
        let stateTask = Task { [weak self] in
            for await state in activity.activityStateUpdates {
                guard state == .ended || state == .dismissed else { continue }
                self?.notifyListeners("activityEnded", data: ["machineUuid": machineUuid])
                self?.stopObserving(machineUuid)
                break
            }
        }
        observers[machineUuid] = [tokenTask, stateTask]
    }

    private func stopObserving(_ machineUuid: String) {
        observers.removeValue(forKey: machineUuid)?.forEach { $0.cancel() }
    }
}
