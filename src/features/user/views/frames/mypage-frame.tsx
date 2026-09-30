import { useMypageScreen } from '../../viewmodels';
import { MypageScreen } from '../screens';


export function MypageFrame() {
  const { user, isLoading } = useMypageScreen();

  if (isLoading || !user) {
    return (
      <div className="bg-bg h-dvh w-full flex items-center justify-center">
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