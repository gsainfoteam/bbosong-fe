import { PushPermissionCard } from '@/features/push-notification';

// import { MypageScreen } from '../screens';

export function MypageFrame() {
  // return <MypageScreen />;
  return (
    <>
      {/* 권한이 granted면 카드 자체가 렌더링되지 않는다 */}
      <PushPermissionCard />
      <p>MypageScreen</p>
    </>
  );
}
