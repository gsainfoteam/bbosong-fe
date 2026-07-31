export type MapMachine = {
  id: number;
  type: 'WASHER' | 'DRYER';
  x: number;
  y: number;
};

export type LaundryRoomLayout = {
  label: 'location.a' | 'location.b';
  machines: MapMachine[];
  doorX?: number;
};

export function useMapViewModel() {
  // 세탁기 및 건조기 배치 모의 데이터
  const mockDevices: MapMachine[] = [
    { id: 1, type: 'WASHER', x: 85, y: 75 },
    { id: 2, type: 'WASHER', x: 140, y: 75 },
    { id: 3, type: 'WASHER', x: 195, y: 75 },
    { id: 4, type: 'WASHER', x: 250, y: 75 },
    { id: 5, type: 'WASHER', x: 305, y: 75 },
    { id: 6, type: 'WASHER', x: 360, y: 75 },
    { id: 7, type: 'WASHER', x: 415, y: 75 },
    { id: 8, type: 'WASHER', x: 470, y: 75 },
    { id: 1, type: 'DRYER', x: 540, y: 75 },
    { id: 2, type: 'DRYER', x: 595, y: 75 },
    { id: 3, type: 'DRYER', x: 380, y: 320 },
    { id: 4, type: 'DRYER', x: 435, y: 320 },
    { id: 5, type: 'DRYER', x: 490, y: 320 },
    { id: 6, type: 'DRYER', x: 545, y: 320 },
    { id: 7, type: 'DRYER', x: 600, y: 320 },
    { id: 8, type: 'DRYER', x: 655, y: 320 },
  ];

  // A동 및 B동 세탁실 맵 구성
  const laundryRoomLayouts: LaundryRoomLayout[] = [
    {
      label: 'location.a',
      machines: mockDevices,
      doorX: 150,
    },
    {
      label: 'location.b',
      machines: mockDevices,
      doorX: 400,
    },
  ];

  return {
    laundryRoomLayouts,
  };
}
