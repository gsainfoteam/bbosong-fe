import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';

import { mergeProps, mergeRefs } from '@/common/utils';

export const Slot = forwardRef<HTMLElement, PropsWithChildren<HTMLAttributes<HTMLElement>>>(
  ({ children, ...props }, ref) => {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      throw new Error(`Slot child must be a valid React element, but got: ${child}`);
    }

    const merged = mergeProps(child.props, props);
    const mergedRef = mergeRefs(merged.ref, ref);
    return cloneElement(child, {
      ...merged,
      ref: mergedRef,
    });
  },
);

Slot.displayName = 'Slot';
