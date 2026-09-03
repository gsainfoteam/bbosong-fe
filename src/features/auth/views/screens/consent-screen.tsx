import type { SubmitEventHandler } from 'react';

import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Checkbox, LanguageToggle } from '@/common/components';
import { cn } from '@/common/utils';

export function ConsentScreen({
  allChecked,
  onAllChange,
  privacyChecked,
  onPrivacyChange,
  tosChecked,
  onTosChange,
  onPrivacyTermsClick,
  onTosTermsClick,
  onSubmit,
  isSubmitDisabled,
}: ConsentScreen.Props) {
  const { t } = useTranslation('auth');

  return (
    <form onSubmit={onSubmit} className="bg-bg relative flex h-dvh flex-col px-6 pt-8 pb-8">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <img src="/3d/logo.png" alt="logo" className="size-40" />
          <h1 className="text-display text-center leading-tight font-bold whitespace-pre-line">
            {t('consent.title')}
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <label
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                allChecked ? 'border-primary bg-primary-light text-primary' : 'border-border',
              )}
            >
              <Checkbox checked={allChecked} onChange={(e) => onAllChange(e.target.checked)} />
              <span className="text-body-lg font-semibold">{t('consent.agreeAll')}</span>
            </label>

            <div className="mt-4 flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1">
                <Checkbox
                  checked={privacyChecked}
                  onChange={(e) => onPrivacyChange(e.target.checked)}
                />
                <span className="text-body-lg flex-1 font-medium">
                  {t('consent.privacyPolicy')}
                  <span className="text-primary ml-1">*</span>
                </span>
                <button
                  type="button"
                  onClick={onPrivacyTermsClick}
                  className="flex items-center"
                  aria-label={t('consent.viewPrivacyPolicy')}
                >
                  <ChevronRight size={20} className="text-icon" />
                </button>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1">
                <Checkbox checked={tosChecked} onChange={(e) => onTosChange(e.target.checked)} />
                <span className="text-body-lg flex-1 font-medium">
                  {t('consent.termsOfService')}
                  <span className="text-primary ml-1">*</span>
                </span>
                <button
                  type="button"
                  onClick={onTosTermsClick}
                  className="flex items-center"
                  aria-label={t('consent.viewTermsOfService')}
                >
                  <ChevronRight size={20} className="text-icon" />
                </button>
              </label>
            </div>
          </div>

          <div>
            <Button type="submit" variant="default" disabled={isSubmitDisabled} className="w-full">
              {t('consent.next')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export namespace ConsentScreen {
  export type Props = {
    allChecked: boolean;
    onAllChange: (checked: boolean) => void;
    privacyChecked: boolean;
    onPrivacyChange: (checked: boolean) => void;
    tosChecked: boolean;
    onTosChange: (checked: boolean) => void;
    onPrivacyTermsClick: () => void;
    onTosTermsClick: () => void;
    onSubmit: SubmitEventHandler<HTMLFormElement>;
    isSubmitDisabled: boolean;
  };
}
