import { jest } from '@jest/globals';
import { get } from 'svelte/store';

global.fetch = jest.fn();
const mockStorage = {
  removeLocal: jest.fn(),
  setLocal: jest.fn()
};
jest.unstable_mockModule('./storage.js', () => mockStorage);

const { loadSignedInUser, signedInUser, signOut } = await import('./identity.js');

describe('identity', () => {
  test('Load signed in user', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        email: 'foobar@gmail.com'
      })
    });
    await loadSignedInUser();

    expect(mockStorage.setLocal).toHaveBeenCalledTimes(1);
    expect(mockStorage.setLocal).toHaveBeenCalledWith({
      signedInUser: { email: 'foobar@gmail.com' }
    });
    expect(get(signedInUser)).toEqual({ email: 'foobar@gmail.com' });
  });

  test('Sign out remove signed in user', async () => {
    signedInUser.set({ email: 'foobar@gmail.com' });

    await signOut();

    expect(mockStorage.removeLocal).toHaveBeenCalledTimes(1);
    expect(mockStorage.removeLocal).toHaveBeenCalledWith(['signedInUser']);
    expect(get(signedInUser)).toEqual(undefined);
  });
});
