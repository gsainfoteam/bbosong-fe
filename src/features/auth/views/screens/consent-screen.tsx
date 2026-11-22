import { type SubmitEventHandler } from 'react';

import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BrandMark, Button, Checkbox, IconButton, LanguageButton } from '@/common/components';
import { cn } from '@/common/utils';

function ConsentRow({
  label,
  viewLabel,
  checked,
  onChange,
  onView,
}: {
  label: string;
  viewLabel: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onView: () => void;
}) {
  const { t } = useTranslation('auth');

  return (
    <div className="flex min-h-11 items-center">
      <label className="flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 text-[15px] font-medium">
        <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
        {label}
        <span className="text-ink-3 text-[12.5px] font-bold">{t('consent.required')}</span>
      </label>
      <IconButton onClick={onView} label={viewLabel} className="text-ink-3 -mr-2.5">
        <ChevronRight size={20} strokeWidth={2.2} aria-hidden />
      </IconButton>
    </div>
  );
}

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
  className,
}: ConsentScreen.Props) {
  const { t } = useTranslation('auth');

  return (
    <form
      onSubmit={onSubmit}
      className={cn('bg-surface flex min-h-dvh flex-1 flex-col', className)}
    >
      <div className="flex h-12 items-center justify-end px-4">
        <LanguageButton />
      </div>
      <div className="px-6">
        <BrandMark size={44} className="mt-3" />
        <h1 className="mt-5 text-[26px] leading-[1.3] font-extrabold tracking-[-0.03em] text-balance">
          {t('consent.title')}
        </h1>
        <div className="mt-9">
          <ConsentRow
            label={t('consent.privacyPolicy')}
            viewLabel={t('consent.viewPrivacyPolicy')}
            checked={privacyChecked}
            onChange={onPrivacyChange}
            onView={onPrivacyTermsClick}
          />
          <ConsentRow
            label={t('consent.termsOfService')}
            viewLabel={t('consent.viewTermsOfService')}
            checked={tosChecked}
            onChange={onTosChange}
            onView={onTosTermsClick}
          />
          <label className="border-line mt-2 flex h-16 cursor-pointer items-center gap-3 border-t text-[18px] font-extrabold tracking-[-0.025em]">
            <Checkbox checked={allChecked} onChange={(e) => onAllChange(e.target.checked)} />
            {t('consent.agreeAll')}
          </label>
        </div>
      </div>

      <div className="pb-cta mt-auto px-5 pt-6">
        <Button type="submit" size="l" wide disabled={isSubmitDisabled}>
          {t('consent.next')}
        </Button>
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
    className?: string;
  };
}
