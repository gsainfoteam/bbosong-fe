import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { TopBar } from '@/common/components';
import { cn } from '@/common/utils';

const SKELETON = [100, 94, 97, 62, 0, 100, 91, 96, 88, 44, 0, 98, 93, 70, 0, 100, 95, 90, 97, 56];

export function TermsDetailScreen({ title, termsUrl, onBack, className }: TermsDetailScreen.Props) {
  const { t } = useTranslation('auth');
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const isLoading = loadedUrl !== termsUrl;

  return (
    <div className={cn('bg-surface flex h-dvh flex-1 flex-col', className)}>
      <TopBar title={title} onBack={onBack} />
      <div className="relative min-h-0 flex-1 px-5">
        <iframe
          src={termsUrl}
          title={title}
          onLoad={() => setLoadedUrl(termsUrl)}
          className={cn('size-full bg-white transition-opacity', isLoading && 'opacity-0')}
        />
        {isLoading && (
          <div
            role="status"
            aria-label={t('consent.loading')}
            className="absolute inset-0 flex flex-col gap-2.5 px-6 pt-5 motion-safe:animate-pulse"
          >
            <i className="bg-skeleton mb-1.5 block h-4.5 w-[58%] rounded-md" />
            {SKELETON.map((width, i) =>
              width === 0 ? (
                <i key={i} className="bg-skeleton mt-4.5 mb-0.5 block h-3.5 w-[36%] rounded-md" />
              ) : (
                <i
                  key={i}
                  className="bg-skeleton block h-3 rounded-md"
                  style={{ width: `${width}%` }}
                />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export namespace TermsDetailScreen {
  export type Props = {
    title: string;
    termsUrl: string;
    onBack: () => void;
    className?: string;
  };
}
