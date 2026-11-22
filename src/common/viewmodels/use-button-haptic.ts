import { useEffect } from 'react';

import { haptic } from '@/common/lib/haptic';

/** 진동을 주지 않을 버튼에 붙이는 속성: `<button data-haptic="off">` */
const OPT_OUT_ATTRIBUTE = 'data-haptic';

const BUTTON_SELECTOR = 'button, [role="button"]';

const isInteractive = (button: Element): boolean =>
  !button.matches(':disabled') &&
  button.getAttribute('aria-disabled') !== 'true' &&
  // 로딩 중인 Button은 클릭을 무시하므로 진동도 주지 않는다
  button.getAttribute('aria-busy') !== 'true' &&
  button.getAttribute(OPT_OUT_ATTRIBUTE) !== 'off';

/**
 * 앱 전체의 모든 버튼에 가벼운 진동을 준다. 앱 루트에서 한 번만 호출한다.
 *
 * 버튼마다 핸들러를 달지 않고 document의 click을 위임받아 처리한다.
 * - 비활성(disabled, aria-disabled)이거나 로딩 중인 버튼은 건너뛴다.
 * - 핸들러가 `preventDefault`/`stopPropagation`으로 클릭을 소비하면 여기까지 오지 않아 진동도 없다.
 *   (길게 누르기 뒤에 이어지는 click이 이렇게 걸러진다)
 */
export function useButtonHaptic(): void {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || !(event.target instanceof Element)) return;

      const button = event.target.closest(BUTTON_SELECTOR);
      if (button && isInteractive(button)) haptic.light();
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
