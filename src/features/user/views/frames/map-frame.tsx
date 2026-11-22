import { useNavigate } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';

import { SplashScreen } from '@/common/components';
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
  const { t } = useTranslation('error');
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
    return (
      <div className="bg-surface flex w-full flex-1 flex-col items-center justify-center">
        <p role="alert">{t('generic')}</p>
        <button type="button" onClick={() => void refetch()}>
          {t('refetch')}
        </button>
      </div>
    );
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
