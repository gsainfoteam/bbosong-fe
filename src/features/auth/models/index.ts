import { type components, PathsMachineSummaryGetParametersQueryGender } from '@/@types/api-schema';

export * from './gender';
export { ApiPaths } from '@/@types/api-schema';
export type RequiredConsents = components['schemas']['RequiredConsents'];
export type ConsentRequiredErrorDto = components['schemas']['ConsentRequiredErrorDto'];
export type GenderRequiredErrorDto = components['schemas']['GenderRequiredErrorDto'];
export type ApiGender = PathsMachineSummaryGetParametersQueryGender;
export const ApiGender = PathsMachineSummaryGetParametersQueryGender;
