/** 앱 부팅 중 보이는 스플래시. 로고가 위아래로 부드럽게 움직인다 */
export function SplashScreen({ className }: SplashScreen.Props) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={`flex h-dvh items-center justify-center bg-white ${className ?? ''}`}
    >
      <img
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
