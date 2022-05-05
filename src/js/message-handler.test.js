import { jest } from '@jest/globals';

const mockStorageLoader = {
  setProfiles: jest.fn(),
  setSelectedProfileIndex: jest.fn(),
  setProfilesAndIndex: jest.fn()
};
jest.doMock('./storage-writer.js', () => mockStorageLoader);

const { MessageType, onMessageReceived } = require('./message-handler.js');

describe('message-handler', () => {
  test('onMessageReceived - IMPORT', async () => {
    const chromeLocal = { profiles: [] };
    const request = { type: MessageType.IMPORT, profile: JSON.stringify({ title: 'Test' }) };
    await expect(onMessageReceived({ chromeLocal, request })).resolves.toEqual({ success: true });

    expect(mockStorageLoader.setProfilesAndIndex).toHaveBeenCalledTimes(1);
    expect(mockStorageLoader.setProfilesAndIndex).toHaveBeenCalledWith(
      [expect.objectContaining({ title: 'Test' })],
      0
    );
  });

  test('onMessageReceived - SWITCH_TO_LATEST', async () => {
    const chromeLocal = { profiles: [{ title: 'Profile 1' }, { title: 'Profile 2' }] };
    const request = { type: MessageType.SWITCH_TO_LATEST };
    await expect(onMessageReceived({ chromeLocal, request })).resolves.toEqual({ success: true });

    expect(mockStorageLoader.setSelectedProfileIndex).toHaveBeenCalledTimes(1);
    expect(mockStorageLoader.setSelectedProfileIndex).toHaveBeenCalledWith(1);
  });

  test('onMessageReceived - Unknown message type', async () => {
    const chromeLocal = {};
    const request = { type: 'UNKNOWN' };
    await expect(onMessageReceived({ chromeLocal, request })).resolves.toEqual(undefined);
  });
});
