import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { createTV } from 'tailwind-variants';

// tailwind-merge는 @theme에 새로 정의한 이름을 모른다. 여기 없으면 text-label을 색으로 보고 text-ink와 함께 남기지 못한다.
const tokens = [
  'text-display',
  'text-heading',
  'text-body-lg',
  'text-body-strong',
  'text-body',
  'text-label',
  'text-caption',
  'text-badge',
] as const;

const radii = ['chip', 'tile', 'button', 'cta', 'banner', 'card', 'sheet'] as const;

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
