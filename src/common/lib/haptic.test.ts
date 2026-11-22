import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { haptic } from './haptic';

vi.mock('@capacitor/haptics', () => ({
  Haptics: { impact: vi.fn(), notification: vi.fn() },
  ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' },
  NotificationType: { Success: 'SUCCESS', Warning: 'WARNING', Error: 'ERROR' },
}));

afterEach(() => vi.clearAllMocks());

describe('haptic', () => {
  it('maps each feedback to the matching plugin call', () => {
    vi.mocked(Haptics.impact).mockResolvedValue();
    vi.mocked(Haptics.notification).mockResolvedValue();

    haptic.light();
    haptic.medium();
    haptic.success();
    haptic.warning();
    haptic.error();

    expect(Haptics.impact).toHaveBeenNthCalledWith(1, { style: ImpactStyle.Light });
    expect(Haptics.impact).toHaveBeenNthCalledWith(2, { style: ImpactStyle.Medium });
    expect(Haptics.notification).toHaveBeenNthCalledWith(1, { type: NotificationType.Success });
    expect(Haptics.notification).toHaveBeenNthCalledWith(2, { type: NotificationType.Warning });
    expect(Haptics.notification).toHaveBeenNthCalledWith(3, { type: NotificationType.Error });
  });

  it('swallows plugin errors such as unsupported browsers', async () => {
    vi.mocked(Haptics.impact).mockRejectedValue(new Error('unavailable'));
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);

    expect(() => haptic.light()).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(unhandled).not.toHaveBeenCalled();
    process.off('unhandledRejection', unhandled);
  });
});
