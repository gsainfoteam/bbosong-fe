// import { useNavigate } from '@tanstack/react-router';

import { type Gender, GenderSelect, LoginLayoutScreen } from '@/features/auth';

export function GenderSelectFrame() {
  // const navigate = useNavigate();

  const handleGenderSelect = (gender: Gender) => {
    console.log(`gender selected: ${gender} in GenderSelectFrame`);
    // navigate({ to: '/' });
  };

  return (
    <LoginLayoutScreen>
      <GenderSelect onLogin={handleGenderSelect} />
    </LoginLayoutScreen>
  );
}
