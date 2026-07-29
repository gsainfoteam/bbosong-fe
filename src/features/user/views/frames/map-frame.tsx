import { MapScreen } from '@/features/user';

import { useMapViewModel } from '../../viewmodels';

export function MapFrame() {
  // 뷰모델을 통해 가공된 세탁실 배치도 데이터를 조회
  const { laundryRoomLayouts } = useMapViewModel();

  return <MapScreen laundryRoomLayouts={laundryRoomLayouts} />;
}
