import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { BottomSheet, Button } from '@/common/components';
import {
  isValidRemainingMinutes,
  MAX_REMAINING_MINUTES,
  MIN_REMAINING_MINUTES,
} from '@/features/user/viewmodels';

/** 세탁기 화면에 보이는 남은 시간을 분 단위로 입력받는다. 다시 열어 고칠 수도 있다 */
export function RemainingTimeSheet({
  open,
  initialMinutes,
  isPending = false,
  onSubmit,
  onUnregister,
  onClose,
}: RemainingTimeSheet.Props) {
  const { t } = useTranslation('machineRegister');
  const [value, setValue] = useState(initialMinutes === undefined ? '' : String(initialMinutes));
  const [touched, setTouched] = useState(false);

  const minutes = value.trim() === '' ? Number.NaN : Number(value);
  const isValid = isValidRemainingMinutes(minutes);
  const showError = touched && !isValid;

  return (
    <BottomSheet open={open} onClose={onClose} title={t('remainingTime.title')}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          if (isValid && !isPending) onSubmit(minutes);
        }}
      >
        <p className="text-ink-2 -mt-3 text-sm leading-[1.6]">{t('remainingTime.description')}</p>
        <label className="mt-4 block">
          <span className="sr-only">{t('remainingTime.label')}</span>
          <span
            className={
              'bg-soft flex h-14 items-center gap-2 rounded-[14px] px-4 ' +
              (showError ? 'shadow-[inset_0_0_0_1.5px_var(--color-danger)]' : '')
            }
          >
            <input
              type="number"
              inputMode="numeric"
              min={MIN_REMAINING_MINUTES}
              max={MAX_REMAINING_MINUTES}
              step={1}
              value={value}
              disabled={isPending}
              aria-invalid={showError}
              aria-describedby="remaining-time-hint"
              placeholder={t('remainingTime.placeholder')}
              onChange={(event) => setValue(event.target.value)}
              onBlur={() => setTouched(true)}
              className="font-num min-w-0 flex-1 bg-transparent text-[22px] font-bold outline-none"
            />
            <span className="text-ink-2 text-[15px] font-medium">{t('remainingTime.unit')}</span>
          </span>
        </label>
        <p
          id="remaining-time-hint"
          role={showError ? 'alert' : undefined}
          className={showError ? 'text-danger mt-2 text-[13px]' : 'text-ink-3 mt-2 text-[13px]'}
        >
          {t('remainingTime.hint', {
            min: String(MIN_REMAINING_MINUTES),
            max: String(MAX_REMAINING_MINUTES),
          })}
        </p>
        <Button type="submit" size="l" wide loading={isPending} className="mt-5">
          {t('remainingTime.submit')}
        </Button>
        {onUnregister && (
          <Button
            type="button"
            variant="text"
            size="m"
            wide
            disabled={isPending}
            className="mt-1"
            onClick={onUnregister}
          >
            {t('remainingTime.unregister')}
          </Button>
        )}
      </form>
    </BottomSheet>
  );
}

export namespace RemainingTimeSheet {
  export type Props = {
    open: boolean;
    /** 이미 입력한 값이 있으면 채워서 연다. 시트를 열 때마다 새로 마운트해 쓴다 */
    initialMinutes?: number;
    isPending?: boolean;
    /** 1~180 정수만 넘어온다 */
    onSubmit: (minutes: number) => void;
    /** 있으면 시트 아래에 "등록 해제"를 둔다. 누르면 호출하는 쪽이 해제 확인으로 넘어간다 */
    onUnregister?: () => void;
    onClose: () => void;
  };
}
