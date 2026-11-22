import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { createTV } from 'tailwind-variants';

const tokens = [
  'text-display',
  'text-heading',
  'text-section',
  'text-title',
  'text-numeral',
  'text-body-strong',
  'text-body-lg',
  'text-body',
  'text-button-lg',
  'text-label',
  'text-caption',
  'text-badge',
] as const;

const radii = ['chip', 'tile', 'button', 'button-lg', 'banner', 'card', 'sheet', 'seg'] as const;

const twMergeConfig = {
  extend: {
    theme: {
      radius: radii,
    },
    classGroups: {
      'font-size': tokens,
    },
  },
};

const twMerge = extendTailwindMerge(twMergeConfig);

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}

export const cv = createTV({ twMerge: true, twMergeConfig });
