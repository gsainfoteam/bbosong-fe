import { type Gender, GenderSelect, LoginLayoutScreen, ApiGender, useAuth } from '@/features/auth';

export function GenderSelectFrame() {
  const { logIn } = useAuth();

  // 성별 최종 선택 완료 시 DTO 스펙에만 맞춰 2차 로그인 트리거 (타입 단언 완전 배제)
  const handleGenderSelect = (gender: Gender) => {
    if (!gender) return;

    logIn({
      body: {
        gender: gender === 'male' ? ApiGender.MALE : ApiGender.FEMALE,
        agreedToTerms: true,
        agreedToPrivacy: true,
        termsVersion: '260301',
        privacyVersion: '260301',
      },
    });
  };

  return (
    <LoginLayoutScreen>
      <GenderSelect onLogin={handleGenderSelect} />
    </LoginLayoutScreen>
  );
}
