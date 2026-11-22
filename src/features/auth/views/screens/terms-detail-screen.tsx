import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/common/components';

export function TermsDetailScreen({ title, termsUrl, onBack }: TermsDetailScreen.Props) {
  const { t } = useTranslation('auth');

  return (
    <div className="bg-surface flex h-dvh flex-col px-4 pt-4 pb-5">
      <div className="mx-auto flex h-full w-full max-w-md flex-col gap-3">
        <div className="border-line relative flex items-center justify-center rounded-xl border px-4 py-3">
          <IconButton label={t('consent.back')} onClick={onBack} className="absolute left-1">
            <ChevronLeft size={24} aria-hidden />
          </IconButton>
          <h2 className="text-body-lg text-ink text-center font-semibold">{title}</h2>
        </div>

        <div className="border-line bg-surface min-h-0 flex-1 overflow-hidden rounded-2xl border shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
          <iframe src={termsUrl} title={title} className="h-full w-full rounded-xl bg-white" />
        </div>
      </div>
    </div>
  );
}

export namespace TermsDetailScreen {
  export type Props = {
    title: string;
    termsUrl: string;
    onBack: () => void;
  };
}
