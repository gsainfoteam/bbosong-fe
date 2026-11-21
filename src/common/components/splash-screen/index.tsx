import { useLayoutEffect, useRef } from 'react';

/**
 * 앱 부팅 중 보이는 스플래시. 로고가 위아래로 부드럽게 움직인다.
 *
 * 여러 곳에서 스플래시가 교체되며 마운트되어도 애니메이션이 끊기지 않도록,
 * 애니메이션 시작 시각을 문서 타임라인 기준 0으로 고정해 위상을 전역 시간에 동기화한다.
 */
export function SplashScreen({ className }: SplashScreen.Props) {
  const logoRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const logo = logoRef.current;
    if (!logo || typeof logo.getAnimations !== 'function') return;
    for (const animation of logo.getAnimations()) {
      animation.startTime = 0;
    }
  }, []);

  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={`flex h-dvh items-center justify-center bg-white ${className ?? ''}`}
    >
      <img
        ref={logoRef}
        src="/icon-512.png"
        alt="로고"
        className="motion-safe:animate-splash-bob size-32"
        draggable={false}
      />
    </div>
  );
}

export namespace SplashScreen {
  export type Props = { className?: string };
}
