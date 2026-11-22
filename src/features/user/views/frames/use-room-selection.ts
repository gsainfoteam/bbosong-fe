import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { type Gender } from '@/features/auth';
import { type MachineView } from '@/features/user/viewmodels';

import { type RoomSheet } from '../components';

const LOCATIONS = ['a', 'b'] as const;

export type Location = (typeof LOCATIONS)[number];

const isLocation = (value: unknown): value is Location => LOCATIONS.includes(value as Location);

const STORAGE_KEY = 'location';

export function useRoomNames() {
  const { t } = useTranslation(['main', 'location']);
  return (location: Location, gender: Gender | string | undefined) => ({
    location: location === 'a' ? t('location:a_long') : t('location:b_long'),
    gender: gender === 'female' ? t('female') : t('male'),
  });
}

export function useRoomSelection(views: MachineView[], gender: Gender | undefined) {
  const { t } = useTranslation('main');
  const roomNames = useRoomNames();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [location, setLocation] = useState<Location>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLocation(saved) ? saved : 'a';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, location);
  }, [location]);

  const roomViews = (target: Location) =>
    views.filter((view) => view.location === target && view.gender === gender);

  const rooms: RoomSheet.Room[] = LOCATIONS.map((target) => {
    const list = roomViews(target);
    const freeOf = (type: MachineView['type']) =>
      list.filter((view) => view.type === type && view.state === 'idle').length;
    return {
      location: target,
      label: t('roomTile', roomNames(target, gender)),
      freeWashers: freeOf('washer'),
      freeDryers: freeOf('dryer'),
      selected: target === location,
    };
  });

  return {
    location,
    current: roomViews(location),
    room: {
      title: t('roomTitle', roomNames(location, gender)),
      onOpen: () => setIsSheetOpen(true),
    },
    sheet: {
      open: isSheetOpen,
      rooms,
      onSelect: (item: string) => {
        if (isLocation(item)) setLocation(item);
        setIsSheetOpen(false);
      },
      onClose: () => setIsSheetOpen(false),
    } satisfies RoomSheet.Props,
  };
}
