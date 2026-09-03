import { useNavigate, useRouterState } from '@tanstack/react-router';

import { useAuthPrompt, useConsentForm, type RequiredConsents } from '@/features/auth';

import { ConsentScreen } from '../screens';

export function ConsentFrame() {
  const requiredConsents = useAuthPrompt((state) => state.requiredConsents);
  if (!requiredConsents) {
    return null;
  }
  return <ConsentInnerFrame requiredConsents={requiredConsents} />;
}

function ConsentInnerFrame({ requiredConsents }: { requiredConsents: RequiredConsents }) {
  const navigate = useNavigate();
  const consentFormData = useRouterState({
    select: (s) => s.location.state?.consentFormData,
  });

  const {
    form: { formState, watch, setValue, trigger },
    allChecked,
    handleAllChange,
    onSubmit,
  } = useConsentForm(requiredConsents, consentFormData);

  const privacyVersion = watch('privacyVersion');
  const tosVersion = watch('tosVersion');
  const formValues = watch();
  const { privacy, tos } = watch();

  const handleTermsClick = (type: 'privacy' | 'tos', version: string) => {
    navigate({
      to: '/auth/terms/$type',
      params: { type },
      search: { version },
      state: (prev) => ({
        ...prev,
        consentFormData: formValues,
      }),
    });
  };

  return (
    <ConsentScreen
      allChecked={allChecked}
      onAllChange={handleAllChange}
      privacyChecked={privacy}
      onPrivacyChange={(checked) => {
        setValue('privacy', checked);
        trigger();
      }}
      tosChecked={tos}
      onTosChange={(checked) => {
        setValue('tos', checked);
        trigger();
      }}
      onPrivacyTermsClick={() => handleTermsClick('privacy', privacyVersion)}
      onTosTermsClick={() => handleTermsClick('tos', tosVersion)}
      onSubmit={onSubmit}
      isSubmitDisabled={!formState.isValid}
    />
  );
}
