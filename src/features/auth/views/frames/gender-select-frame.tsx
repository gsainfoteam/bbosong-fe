import { type Gender, GenderSelect, LoginLayoutScreen, ApiGender, useAuth } from '@/features/auth';

export function GenderSelectFrame() {
  const { logIn, idpToken } = useAuth();

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
      params: {
        header: {
          Authorization: `Bearer ${idpToken}`,
        },
      },
    } as unknown as Parameters<typeof logIn>[0]);
  };

  return (
    <LoginLayoutScreen>
      <GenderSelect onLogin={handleGenderSelect} />
    </LoginLayoutScreen>
  );
}
