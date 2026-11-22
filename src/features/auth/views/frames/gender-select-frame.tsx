import { GenderScreen, useAuth } from '@/features/auth';

export function GenderSelectFrame() {
  const { logInWithGender, logInMutation } = useAuth();

  return <GenderScreen onSelect={logInWithGender} isError={logInMutation.isError} />;
}
