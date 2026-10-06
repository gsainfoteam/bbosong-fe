import { useEffect, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { type Gender, useUser } from '@/features/auth';

export function useFindUserProfile() {
  const { t } = useTranslation('error');

  const { data, error, isError, isLoading, refetch } = useUser();

  useEffect(() => {
    if (!isError) return;
    if (error?.statusCode === 401) {
      toast.error(t('unauthorized'));
    } else if (error?.statusCode === 403) {
      toast.error(t('forbidden'));
    } else if (error?.statusCode === 404) {
      toast.error(t('notFound'));
    } else if (error?.statusCode === 400) {
      toast.error(t('badRequest'));
    } else if (error?.statusCode === 500) {
      toast.error(t('internalServerError'));
    }
  }, [error, isError, t]);

  const user = useMemo(() => {
    if (!data) return undefined;
    return {
      name: data.name,
      studentNumber: data.studentNumber,
      email: data.email,
      gender: data.gender.toLowerCase() as Gender,
    };
  }, [data]);

  return {
    user,
    isError,
    isLoading,
    refetch,
  };
}
