import { type Gender, GenderSelect, LoginLayoutScreen, useAuth } from '@/features/auth';

export function GenderSelectFrame() {
  const { logInWithGender } = useAuth();

  // 성별 최종 선택 완료 시 뷰모델의 전용 로그인 가동 (DTO 의존 제거)
  const handleGenderSelect = (gender: Gender) => {
    if (!gender) return;

    logInWithGender(gender);
  };

  return (
    <LoginLayoutScreen>
      <GenderSelect onLogin={handleGenderSelect} />
    </LoginLayoutScreen>
  );
}
