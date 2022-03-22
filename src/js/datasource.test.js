import { jest } from '@jest/globals';
import { get } from 'svelte/store';
import flushPromises from 'flush-promises';
import { signedInUser } from './identity';
import { __testing__ as changeStackTesting } from './change-stack.js';

const mockStorage = {
  getLocal: jest.fn(),
  setLocal: jest.fn(),
  removeLocal: jest.fn()
};
jest.unstable_mockModule('./storage', () => mockStorage);

const {
  init,
  commitData,
  undo,
  isInitialized,
  profiles,
  selectedProfileIndex,
  isLocked,
  isPaused
} = await import('./datasource');

describe('profile', () => {
  beforeEach(() => {
    profiles.set([]);
    selectedProfileIndex.set(0);
    isLocked.set(false);
    isPaused.set(false);
    isInitialized.set(true);
    changeStackTesting.changes.length = 0;
  });

  afterEach(() => {
    isInitialized.set(false);
  });

  test('Init loads from storage - all data available', async () => {
    mockStorage.getLocal.mockResolvedValue({
      profiles: [
        {
          title: 'Profile 1'
        }
      ],
      selectedProfile: 0,
      lockedTabId: 'tabId',
      isPaused: true,
      signedInUser: {
        email: 'foobar@gmail.com'
      }
    });

    await init();

    expect(get(profiles)).toEqual([
      {
        title: 'Profile 1'
      }
    ]);
    expect(get(selectedProfileIndex)).toEqual(0);
    expect(get(isLocked)).toEqual(true);
    expect(get(isPaused)).toEqual(true);
    expect(get(signedInUser)).toEqual({
      email: 'foobar@gmail.com'
    });
  });

  test('Init loads from storage - fresh data', async () => {
    mockStorage.getLocal.mockResolvedValue({
      profiles: []
    });

    await init();

    expect(get(profiles)).toEqual([]);
    expect(get(selectedProfileIndex)).toEqual(0);
    expect(get(isLocked)).toEqual(false);
    expect(get(isPaused)).toEqual(false);
    expect(get(signedInUser)).toEqual(undefined);
  });

  test('Commit and undo - change profiles and index', () => {
    // First commit
    commitData({
      newProfiles: [
        {
          title: 'Profile 1'
        },
        {
          title: 'Profile 2'
        }
      ],
      newIndex: 1
    });
    expect(changeStackTesting.changes).toEqual([
      expect.objectContaining({
        profiles: [
          {
            title: 'Profile 1'
          },
          {
            title: 'Profile 2'
          }
        ],
        selectedProfileIndex: 1
      })
    ]);
    expect(get(profiles)).toEqual([
      {
        title: 'Profile 1'
      },
      {
        title: 'Profile 2'
      }
    ]);
    expect(get(selectedProfileIndex)).toEqual(1);

    // Second commit
    commitData({
      newProfiles: [
        {
          title: 'Profile 1'
        },
        {
          title: 'Profile 2'
        },
        {
          title: 'Profile 3'
        }
      ],
      newIndex: 2
    });
    expect(changeStackTesting.changes).toEqual([
      expect.objectContaining({
        profiles: [
          {
            title: 'Profile 1'
          },
          {
            title: 'Profile 2'
          }
        ],
        selectedProfileIndex: 1
      }),
      expect.objectContaining({
        profiles: [
          {
            title: 'Profile 1'
          },
          {
            title: 'Profile 2'
          },
          {
            title: 'Profile 3'
          }
        ],
        selectedProfileIndex: 2
      })
    ]);
    expect(get(profiles)).toEqual([
      {
        title: 'Profile 1'
      },
      {
        title: 'Profile 2'
      },
      {
        title: 'Profile 3'
      }
    ]);
    expect(get(selectedProfileIndex)).toEqual(2);

    // Undo second commit to get back to first commit
    undo();
    expect(changeStackTesting.changes).toEqual([
      expect.objectContaining({
        profiles: [
          {
            title: 'Profile 1'
          },
          {
            title: 'Profile 2'
          }
        ],
        selectedProfileIndex: 1
      })
    ]);
    expect(get(profiles)).toEqual([
      {
        title: 'Profile 1'
      },
      {
        title: 'Profile 2'
      }
    ]);
    expect(get(selectedProfileIndex)).toEqual(1);
  });

  test('Commit and undo - change isLocked', async () => {
    mockStorage.getLocal.mockResolvedValue({ activeTabId: 'lockedTab' });
    // First commit
    commitData({
      newIsLocked: true
    });
    expect(changeStackTesting.changes).toEqual([
      expect.objectContaining({
        isLocked: true
      })
    ]);
    expect(get(isLocked)).toEqual(true);
    await flushPromises();
    expect(mockStorage.setLocal).toHaveBeenCalledTimes(1);
    expect(mockStorage.setLocal).toHaveBeenCalledWith({ lockedTabId: 'lockedTab' });

    // Second commit
    jest.clearAllMocks();
    commitData({
      newIsLocked: false
    });
    expect(changeStackTesting.changes).toEqual([
      expect.objectContaining({
        isLocked: true
      }),
      expect.objectContaining({
        isLocked: false
      })
    ]);
    expect(get(isLocked)).toEqual(false);
    await flushPromises();
    expect(mockStorage.removeLocal).toHaveBeenCalledTimes(1);
    expect(mockStorage.removeLocal).toHaveBeenCalledWith('lockedTabId');

    // Undo second commit to get back to first commit
    jest.clearAllMocks();
    undo();
    expect(changeStackTesting.changes).toEqual([
      expect.objectContaining({
        isLocked: true
      })
    ]);
    expect(get(isLocked)).toEqual(true);
    await flushPromises();
    expect(mockStorage.setLocal).toHaveBeenCalledTimes(1);
    expect(mockStorage.setLocal).toHaveBeenCalledWith({ lockedTabId: 'lockedTab' });
  });

  test('Commit data add to change stack - change isPaused', async () => {
    // First commit
    commitData({
      newIsPaused: true
    });
    expect(changeStackTesting.changes).toEqual([
      expect.objectContaining({
        isPaused: true
      })
    ]);
    expect(get(isPaused)).toEqual(true);
    await flushPromises();
    expect(mockStorage.setLocal).toHaveBeenCalledTimes(1);
    expect(mockStorage.setLocal).toHaveBeenCalledWith({ isPaused: true });

    // Second commit
    jest.clearAllMocks();
    commitData({
      newIsPaused: false
    });
    expect(changeStackTesting.changes).toEqual([
      expect.objectContaining({
        isPaused: true
      }),
      expect.objectContaining({
        isPaused: false
      })
    ]);
    expect(get(isPaused)).toEqual(false);
    await flushPromises();
    expect(mockStorage.removeLocal).toHaveBeenCalledTimes(1);
    expect(mockStorage.removeLocal).toHaveBeenCalledWith('isPaused');

    // Undo second commit to get back to first commit
    jest.clearAllMocks();
    undo();
    expect(changeStackTesting.changes).toEqual([
      expect.objectContaining({
        isPaused: true
      })
    ]);
    expect(get(isPaused)).toEqual(true);
    await flushPromises();
    expect(mockStorage.setLocal).toHaveBeenCalledTimes(1);
    expect(mockStorage.setLocal).toHaveBeenCalledWith({ isPaused: true });
  });
});
