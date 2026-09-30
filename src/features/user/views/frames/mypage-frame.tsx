import { useFindUserProfile } from '../../viewmodels';
import { MypageScreen } from '../screens';

export function MypageFrame() {
  const { user, isLoading } = useFindUserProfile();

  if (isLoading || !user) {
    return (
      <div className="bg-bg flex h-dvh w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* <PushPermissionCard /> */}
      <MypageScreen user={user} />
    </>
  );
}
