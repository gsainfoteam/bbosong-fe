import { useNavigate } from '@tanstack/react-router';

import { SplashScreen } from '@/common/components';
import { ErrorPage } from '@/common/pages';
import { MapScreen, RoomSheet } from '@/features/user';
import {
  useFindMap,
  useFindMyMachine,
  useFindUserProfile,
  useMachineViews,
} from '@/features/user/viewmodels';

import { useRoomSelection } from './use-room-selection';

export function MapFrame() {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading, isError: isUserError } = useFindUserProfile();
  const { data: usingMachines, isLoading: isUsingLoading } = useFindMyMachine();
  const {
    views,
    isLoading: isMachinesLoading,
    isError: isMachinesError,
    refetch,
  } = useMachineViews(usingMachines);

  const { location, current, room, sheet } = useRoomSelection(views, user?.gender);
  const { layout } = useFindMap(location);

  const spots = layout.spots.flatMap((spot) => {
    const machine = current.find((view) => view.type === spot.type && view.id === spot.id);
    return machine ? [{ machine, x: spot.x, y: spot.y }] : [];
  });

  if (isUserLoading || isUsingLoading || isMachinesLoading) return <SplashScreen />;

  if (isUserError || isMachinesError) {
    return <ErrorPage reset={() => void refetch()} />;
  }

  return (
    <>
      <MapScreen
        room={room}
        layout={layout}
        spots={spots}
        onBack={() => void navigate({ to: '/' })}
      />
      <RoomSheet {...sheet} />
    </>
  );
}
