import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'react-oauth2-code-pkce';
import { z } from 'zod';

import { useAuth } from './use-auth';

import type { RequiredConsents } from '../models';
import type { TFunction } from 'i18next';

const createConsentSchema = (t: TFunction<'auth'>) =>
  z.object({
    privacy: z.boolean().refine((val) => val, {
      error: t('consent.error.privacyRequired'),
    }),
    tos: z.boolean().refine((val) => val, {
      error: t('consent.error.tosRequired'),
    }),
    privacyVersion: z.string(),
    tosVersion: z.string(),
  });

export type ConsentFormData = z.infer<ReturnType<typeof createConsentSchema>>;

export const useConsentForm = (requiredConsents: RequiredConsents, formData?: ConsentFormData) => {
  const { token } = useAuthContext();
  const { t } = useTranslation('auth');
  const { logIn } = useAuth({ showToast: true });

  const consentSchema = createConsentSchema(t);

  const form = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
    defaultValues: formData ?? {
      privacy: requiredConsents.privacy.currentVersion === requiredConsents.privacy.requiredVersion,
      tos: requiredConsents.terms.currentVersion === requiredConsents.terms.requiredVersion,
      privacyVersion: requiredConsents.privacy.requiredVersion,
      tosVersion: requiredConsents.terms.requiredVersion,
    },
    mode: 'onChange',
  });

  const privacy = useWatch({
    control: form.control,
    name: 'privacy',
  });
  const tos = useWatch({
    control: form.control,
    name: 'tos',
  });
  const allChecked = privacy && tos;

  const handleAllChange = (checked: boolean) => {
    form.setValue('privacy', checked);
    form.setValue('tos', checked);
    form.trigger();
  };

  const onSubmit = form.handleSubmit(async (data) => {
    logIn({
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        agreedToPrivacy: data.privacy,
        agreedToTerms: data.tos,
        privacyVersion: data.privacyVersion,
        termsVersion: data.tosVersion,
      },
    });
  });

  return {
    form,
    privacy,
    tos,
    allChecked,
    handleAllChange,
    onSubmit,
  };
};
