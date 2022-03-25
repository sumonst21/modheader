import { jest } from '@jest/globals';

const mockStorage = {
  setBrowserAction: jest.fn()
};
jest.unstable_mockModule('./browser-action.js', () => mockStorage);

const { resetBrowserActions, __testing__ } = await import('./browser-action-manager.js');

describe('browser-action-manager', () => {
  afterEach(() => {
    __testing__.currentSetting = undefined;
  });

  test('Show paused', async () => {
    const chromeLocal = { isPaused: true };
    const activeProfiles = [];
    const selectedActiveProfile = {};
    await resetBrowserActions({ chromeLocal, activeProfiles, selectedActiveProfile });

    expect(mockStorage.setBrowserAction).toHaveBeenCalledTimes(1);
    expect(mockStorage.setBrowserAction).toHaveBeenCalledWith({
      icon: __testing__.DISABLED_ICON,
      text: __testing__.PAUSED_TEXT,
      color: '#666'
    });
  });

  test('Show no modifications', async () => {
    const chromeLocal = {};
    const activeProfiles = [];
    const selectedActiveProfile = {};
    await resetBrowserActions({ chromeLocal, activeProfiles, selectedActiveProfile });

    expect(mockStorage.setBrowserAction).toHaveBeenCalledTimes(1);
    expect(mockStorage.setBrowserAction).toHaveBeenCalledWith({
      icon: __testing__.DISABLED_ICON,
      text: '',
      color: '#fff'
    });
  });

  test('Show locked mode', async () => {
    const chromeLocal = { lockedTabId: '1', activeTabId: '2' };
    const activeProfiles = [
      { headers: [{ name: 'foo', value: 'bar' }], respHeaders: [], urlReplacements: [] }
    ];
    const selectedActiveProfile = {};
    await resetBrowserActions({ chromeLocal, activeProfiles, selectedActiveProfile });

    expect(mockStorage.setBrowserAction).toHaveBeenCalledTimes(1);
    expect(mockStorage.setBrowserAction).toHaveBeenCalledWith({
      icon: __testing__.DISABLED_ICON,
      text: __testing__.LOCKED_TEXT,
      color: '#ff8e8e'
    });
  });

  test('Show number of modifications', async () => {
    const chromeLocal = {};
    const activeProfiles = [
      { headers: [{ name: 'foo', value: 'bar' }], respHeaders: [], urlReplacements: [] }
    ];
    const selectedActiveProfile = {
      backgroundColor: '#123456'
    };
    await resetBrowserActions({ chromeLocal, activeProfiles, selectedActiveProfile });

    expect(mockStorage.setBrowserAction).toHaveBeenCalledTimes(1);
    expect(mockStorage.setBrowserAction).toHaveBeenCalledWith({
      icon: __testing__.REGULAR_ICON,
      text: '1',
      color: '#123456'
    });
  });
});
