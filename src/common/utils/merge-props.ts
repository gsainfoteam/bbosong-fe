import type { ComponentPropsWithRef, ElementType } from 'react';

import { mergeEventHandlers } from './merge-event-handlers';
import { mergeObjects } from './merge-objects';
import { mergeRefs } from './merge-refs';
import { cn } from './styles';

const isEventHandler = (key: string, baseValue: unknown, nextValue: unknown) =>
  key.startsWith('on') && (typeof baseValue === 'function' || typeof nextValue === 'function');

export function mergeProps<T extends ElementType>(
  baseProps: ComponentPropsWithRef<T>,
  nextProps: ComponentPropsWithRef<T>,
): ComponentPropsWithRef<T> {
  const mergedProps = {} as ComponentPropsWithRef<T>;
  const keys = new Set([...Object.keys(baseProps), ...Object.keys(nextProps)]) as Set<
    keyof ComponentPropsWithRef<T>
  >;

  // ref는 열거되지 않을 수 있어 별도로 포함
  if ('ref' in baseProps || 'ref' in nextProps) {
    keys.add('ref');
  }

  keys.forEach((key) => {
    if (key === 'className') {
      mergedProps.className = cn(baseProps.className, nextProps.className);
    } else if (key === 'style') {
      mergedProps.style = mergeObjects(
        baseProps.style as object | undefined,
        nextProps.style as object | undefined,
      );
    } else if (key === 'ref') {
      mergedProps.ref = mergeRefs(baseProps.ref, nextProps.ref);
    } else if (typeof key === 'string' && isEventHandler(key, baseProps[key], nextProps[key])) {
      mergedProps[key] = mergeEventHandlers(baseProps[key], nextProps[key]);
    } else {
      mergedProps[key] = nextProps[key] ?? baseProps[key];
    }
  });

  return mergedProps;
}
