import { DropDown } from '@/common/components';
import { cn } from '@/common/utils';

export function SelectBuilding({ dropDownProps, className, ...props }: SelectBuilding.Props) {
  return (
    <div className={cn(className, 'flex w-full flex-1 items-center gap-2')} {...props}>
      <DropDown
        items={dropDownProps.items}
        onSelect={dropDownProps.onSelect}
        value={dropDownProps.value}
        placeholder={dropDownProps.placeholder}
        labelContext="long"
        disabled={dropDownProps.disabled}
        className={dropDownProps.className}
      />
      {/*<Map className="text-text-primary" onClick={() => onOpenMap(dropDownProps.value!)} />*/}
    </div>
  );
}

export namespace SelectBuilding {
  export type Props = {
    dropDownProps: DropDown.Props;
    className?: string;
  };
}
