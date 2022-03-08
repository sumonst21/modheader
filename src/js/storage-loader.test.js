import { jest } from '@jest/globals';

const mockStorage = {
  getLocal: jest.fn(),
  setLocal: jest.fn(),
  getSync: jest.fn()
};
jest.unstable_mockModule('./storage', () => mockStorage);

const { initStorage } = await import('./storage-loader');

describe('storage-loader', () => {
  test('Setup default profile', async () => {
    mockStorage.getLocal.mockResolvedValue({});
    const local = await initStorage();
    expect(local).toEqual({
      profiles: [
        {
          appendMode: false,
          backgroundColor: expect.any(String),
          filters: [],
          headers: [
            {
              comment: '',
              enabled: true,
              name: '',
              value: ''
            }
          ],
          hideComment: true,
          respHeaders: [],
          shortTitle: '1',
          textColor: expect.any(String),
          title: 'Profile 1',
          urlReplacements: []
        }
      ],
      selectedProfile: 0
    });
  });
});
