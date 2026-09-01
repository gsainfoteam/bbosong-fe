import { useTranslation } from 'react-i18next';

export function MachineRegisterMessage({ lang, machine, location }: MachineRegisterMessage.Props) {
  const { t } = useTranslation();

  // t('machine.washer')
  // t('machine.dryer')
  // t('location.a')
  // t('location.b')

  if (lang === 'ko')
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-row items-baseline gap-1">
          <h1>{t(`location.${location}`)}</h1>
          <p>{t('location.laundryRoom')}</p>
          <h1>{machine.id}</h1>
          <p>번</p>
          <h1>{t(`machine.${machine.type}`)}</h1>
          <p>를</p>
        </div>
        <div>
          <p>{t('user.registerMachine.message')}</p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-row items-baseline gap-1">
        <p>Register</p>
        <h1>{t(`machine.${machine.type}`)}</h1>
        <p>No.</p>
        <h1>{machine.id}</h1>
      </div>
      <div className="flex flex-row items-baseline gap-1">
        <p>in laundry room </p>
        <h1>{location.toUpperCase()}</h1>
        <p>as in use.</p>
      </div>
    </div>
  );
}

export namespace MachineRegisterMessage {
  export type Props = {
    lang: string;
    machine: { type: 'washer' | 'dryer'; id: number };
    location: 'a' | 'b';
  };
}
