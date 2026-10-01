import { UsingMachineList } from '@/features/user';
import { useMyMachine } from '../../viewmodels/use-mymachine';


export function MyMachineFrame() {
  const { mappedMachineList, isLoading } = useMyMachine();

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-4">
        <p>Loading...</p>
      </div>
    );
  }

  return <UsingMachineList machineList={mappedMachineList} />;
}