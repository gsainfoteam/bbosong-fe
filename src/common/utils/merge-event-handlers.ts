import type { SyntheticEvent } from 'react';

export const mergeEventHandlers =
  <E extends SyntheticEvent>(
    handler1: ((event: E) => void) | undefined,
    handler2: ((event: E) => void) | undefined,
  ) =>
  (event: E) => {
    handler1?.(event);
    if (event.defaultPrevented) return;
    handler2?.(event);
  };
