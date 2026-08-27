import { useParams } from '@tanstack/react-router';

import { MachineRegisterScreen } from '@/features/user';
import { useFindMachineByUuid, useRegisterMachine } from '@/features/user/viewmodels';

export function MachineRegisterFrame() {
  const { machineUuid } = useParams({
    from: '/_auth-required/_user/machine-register/$machineUuid',
  });

  const { machine, isNotFound } = useFindMachineByUuid(machineUuid);
  const { mutate: registerMachine } = useRegisterMachine();

  if (isNotFound || !machine) return null;

  const machineData = {
    type: machine.type.toLowerCase() as 'washer' | 'dryer',
    id: machine.index,
  };

  const location = machine.location.toLowerCase() as 'a' | 'b';

  const register = () => {
    registerMachine({ params: { path: { uuid: machineUuid } } });
  };

  return <MachineRegisterScreen machine={machineData} location={location} onRegister={register} />;
}
