import { useSearch } from '@tanstack/react-router';

import { IdpLoginButton, LoginLayoutScreen, useAuth, useAuthRedirect } from '@/features/auth';

export function IdpLoginFrame() {
  const { idpLogIn } = useAuth();
  const { redirect } = useSearch({ from: '/auth' });

  // const navigate = useNavigate();

  const handleLogin = () => {
    useAuthRedirect.getState().setRedirect(redirect);
    idpLogIn();
  };

  return (
    <LoginLayoutScreen>
      <IdpLoginButton onLogin={handleLogin} />
    </LoginLayoutScreen>
  );
}
