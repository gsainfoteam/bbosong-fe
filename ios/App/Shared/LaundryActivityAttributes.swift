import ActivityKit
import Foundation

/// 세탁기/건조기 Live Activity의 데이터 모델. App 타깃과 LiveActivityWidget 타깃이 함께 컴파일한다.
///
/// `ContentState`의 키는 서버가 APNs로 보내는 content-state(bbosong-be `docs/native-push.md`)와
/// 정확히 일치해야 한다. 시간은 모두 epoch 초이고, 남은 시간을 모르면 `endsAt`, `remainingMinutes`는 null이다.
/// 건조기는 ThinQ가 남은 시간을 알려 준다. 세탁기는 ThinQ가 없어, 사용자가 화면의 남은 시간을 입력했을 때만 값이 있고
/// 입력 전에는 null이라 경과 시간을 보여준다. 입력한 시각은 예상치라 지난 뒤에도 더 돌 수 있다.
@available(iOS 16.1, *)
struct LaundryActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        /// `RUNNING | COOLING | PAUSE | DETECTING | END | ERROR`. 알 수 없는 값도 디코딩이 실패하지 않도록 문자열로 둔다
        var state: String
        var endsAt: Double?
        var remainingMinutes: Int?
        var updatedAt: Double

        var phase: Phase { Phase(rawValue: state) ?? .running }
        var endDate: Date? { endsAt.map { Date(timeIntervalSince1970: $0) } }
    }

    enum Phase: String {
        case running = "RUNNING"
        case cooling = "COOLING"
        case pause = "PAUSE"
        case detecting = "DETECTING"
        case end = "END"
        case error = "ERROR"
    }

    enum Kind: String {
        case washer = "WASHER"
        case dryer = "DRYER"
    }

    /// 서버의 machine uuid. 같은 기계의 activity를 찾는 키다
    var machineUuid: String
    /// `WASHER | DRYER`
    var kind: String
    /// "A동 건조기 3번"처럼 앱이 언어에 맞게 만들어 넘기는 표시 이름
    var title: String
    /// 사용 시작 시각(epoch 초). 진행 막대의 시작점이고, 세탁기는 종료 시각이 없을 때 경과 시간의 기준이다
    var startedAt: Double

    var machineKind: Kind { Kind(rawValue: kind) ?? .dryer }

    var startDate: Date { Date(timeIntervalSince1970: startedAt) }
}
