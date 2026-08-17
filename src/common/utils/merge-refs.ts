import type { RefCallback, RefObject } from 'react';

export function mergeRefs<T>(
  ...refs: (RefObject<T> | RefCallback<T> | null | undefined)[]
): RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        ref.current = value as T;
      }
    });
  };
}
