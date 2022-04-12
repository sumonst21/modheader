import { jest } from '@jest/globals';
import MockDate from 'mockdate';
import flushPromises from 'flush-promises';

const mockStorage = {
  getSync: jest.fn(),
  removeSync: jest.fn(),
  setSync: jest.fn(),
  addStorageChangeListener: jest.fn()
};
jest.doMock('./storage.js', () => mockStorage);

const mockStorageLoader = {
  initStorage: jest.fn()
};
jest.doMock('./storage-loader.js', () => mockStorageLoader);

const mockProfile = {
  fixProfiles: jest.fn(),
  setProfiles: jest.fn()
};
jest.doMock('./profile.js', () => mockProfile);

const { loadProfilesFromStorage } = require('./worker-data-manager.js');

MockDate.set(10000000);

const EMPTY_PROFILE = {
  headers: [],
  respHeaders: [],
  setCookieHeaders: [],
  urlReplacements: [],
  urlFilters: [],
  excludeUrlFilters: [],
  resourceFilters: []
};

describe('worker-data-manager', () => {
  beforeEach(() => {
    mockStorage.getSync.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Load empty profiles from storage', async () => {
    mockStorageLoader.initStorage.mockResolvedValue({
      profiles: []
    });
    const callback = jest.fn();
    await loadProfilesFromStorage(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      chromeLocal: {
        profiles: []
      },
      activeProfiles: []
    });
  });

  test('Load active profiles from storage', async () => {
    mockStorageLoader.initStorage.mockResolvedValue({
      profiles: [
        {
          headers: [
            {
              enabled: true,
              name: 'Foo',
              value: 'Bar'
            }
          ]
        }
      ],
      selectedProfile: 0
    });
    const callback = jest.fn();
    await loadProfilesFromStorage(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      chromeLocal: {
        profiles: [
          {
            headers: [
              {
                enabled: true,
                name: 'Foo',
                value: 'Bar'
              }
            ]
          }
        ],
        selectedProfile: 0
      },
      activeProfiles: [
        {
          ...EMPTY_PROFILE,
          headers: [
            {
              name: 'Foo',
              value: 'Bar'
            }
          ],
        }
      ],
      selectedActiveProfile: {
        ...EMPTY_PROFILE,
        headers: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ],
      }
    });
  });

  test('Load multiple active profiles from storage', async () => {
    // Profile 1 should be dropped because it is not selected and not always on.
    const profile1 = {
      ...EMPTY_PROFILE,
      title: 'Profile 1',
    };
    // Profile 2 should be kept because it is the selected profile.
    const profile2 = {
      ...EMPTY_PROFILE,
      title: 'Profile 2',
    };
    // Profile 3 should be kept because it is always on, but it is not the selected profile.
    const profile3 = {
      ...EMPTY_PROFILE,
      alwaysOn: true,
      title: 'Profile 3',
    };
    mockStorageLoader.initStorage.mockResolvedValue({
      profiles: [profile1, profile2, profile3],
      selectedProfile: 1
    });
    const callback = jest.fn();
    await loadProfilesFromStorage(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      chromeLocal: {
        profiles: [profile1, profile2, profile3],
        selectedProfile: 1
      },
      activeProfiles: [profile2, profile3],
      selectedActiveProfile: profile2
    });
  });

  test('Save to cloud on data change - profiles changed', async () => {
    const profile1 = {
      ...EMPTY_PROFILE,
      title: 'Profile 1',
    };
    const profile2 = {
      ...EMPTY_PROFILE,
      title: 'Profile 2',
    };
    mockStorageLoader.initStorage.mockResolvedValue({
      profiles: [profile1],
      selectedProfile: 0
    });
    mockStorage.addStorageChangeListener.mockImplementation((fn) => {
      fn({
        profiles: {
          newValue: [profile2]
        }
      });
    });
    const callback = jest.fn();
    await loadProfilesFromStorage(callback);
    await flushPromises();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        activeProfiles: [profile1],
        selectedActiveProfile: profile1
      })
    );
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        activeProfiles: [profile2],
        selectedActiveProfile: profile2
      })
    );
    expect(mockStorage.setSync).toHaveBeenCalledTimes(1);
    expect(mockStorage.setSync).toHaveBeenCalledWith({
      10000000: [profile2]
    });
  });

  test('Save to cloud on data change - profiles not saved to cloud if already in sync', async () => {
    const profile1 = {
      ...EMPTY_PROFILE,
      title: 'Profile 1',
    };
    const profile2 = {
      ...EMPTY_PROFILE,
      title: 'Profile 2',
    };
    mockStorageLoader.initStorage.mockResolvedValue({
      profiles: [profile1],
      selectedProfile: 0
    });
    mockStorage.addStorageChangeListener.mockImplementation((fn) => {
      fn({
        profiles: {
          newValue: [profile2]
        }
      });
    });
    const callback = jest.fn();
    mockStorage.getSync.mockResolvedValue({
      200: [profile2]
    });
    await loadProfilesFromStorage(callback);
    await flushPromises();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        activeProfiles: [profile1],
        selectedActiveProfile: profile1
      })
    );
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        activeProfiles: [profile2],
        selectedActiveProfile: profile2
      })
    );
    expect(mockStorage.setSync).toHaveBeenCalledTimes(0);
  });

  test('Save to cloud on data change - selection changed not saved to cloud', async () => {
    const profile1 = {
      ...EMPTY_PROFILE,
      title: 'Profile 1',
    };
    const profile2 = {
      ...EMPTY_PROFILE,
      title: 'Profile 2',
    };
    mockStorageLoader.initStorage.mockResolvedValue({
      profiles: [profile1, profile2],
      selectedProfile: 0
    });
    mockStorage.addStorageChangeListener.mockImplementation((fn) => {
      fn({
        selectedProfile: {
          newValue: 1
        }
      });
    });
    const callback = jest.fn();
    await loadProfilesFromStorage(callback);
    await flushPromises();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        activeProfiles: [profile1],
        selectedActiveProfile: profile1
      })
    );
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        activeProfiles: [profile2],
        selectedActiveProfile: profile2
      })
    );
    expect(mockStorage.setSync).toHaveBeenCalledTimes(0);
  });
});
