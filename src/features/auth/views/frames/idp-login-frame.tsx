// import { useNavigate } from '@tanstack/react-router';

import { IdpLoginButton, LoginLayoutScreen } from '@/features/auth';

export function IdpLoginFrame() {
  // const navigate = useNavigate();

  const handleLogin = () => {
    console.log('Login complete in IdpLoginFrame');
    // navigate({ to: '/auth/login/gender' });
  };

  return (
    <LoginLayoutScreen>
      <IdpLoginButton onLogin={handleLogin} />
    </LoginLayoutScreen>
  );
}
