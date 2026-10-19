import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRegisterMachine } from './use-register-machine';

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  error: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@/common/lib', () => ({ $api: { useMutation: mocks.useMutation } }));
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('sonner', () => ({ toast: { error: mocks.error } }));
vi.mock('../models', () => ({
  ApiPaths: { MachineController_registerMachineUsage: '/machine/{uuid}/register' },
}));

describe('machine registration error messages', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    [{ statusCode: 409, errorCode: 'MACHINE_ALREADY_REGISTERED' }, 'error.alreadyUsing'],
    [{ statusCode: 409 }, 'error.alreadyUsing'],
    [{ statusCode: 404, errorCode: 'MACHINE_NOT_RUNNING' }, 'error.notRunning'],
    [{ statusCode: 404, message: 'Machine not found.' }, 'error:notFound'],
    [{ statusCode: 401 }, 'error:unauthorized'],
    [
      { statusCode: 403, message: 'Machine gender does not match user gender.' },
      'error:genderMismatch',
    ],
    [{ statusCode: 500 }, 'error:internalServerError'],
  ])('shows the appropriate message for %j', (error, expectedMessage) => {
    useRegisterMachine();
    const options = mocks.useMutation.mock.calls[0][2] as {
      onError: (error: unknown) => void;
    };
    options.onError(error);
    expect(mocks.error).toHaveBeenCalledExactlyOnceWith(expectedMessage);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
