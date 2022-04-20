import { jest } from '@jest/globals';

const mockStorageLoader = {
  setProfiles: jest.fn(),
  setSelectedProfileIndex: jest.fn()
};
jest.doMock('./storage-writer.js', () => mockStorageLoader);

const { MessageType, onMessageReceived } = require('./message-handler.js');

describe('message-handler', () => {
  test('onMessageReceived - EXISTS', async () => {
    const chromeLocal = {};
    const request = { type: MessageType.EXISTS };
    await expect(onMessageReceived({ chromeLocal, request })).resolves.toEqual(true);
  });

  test('onMessageReceived - IMPORT', async () => {
    const chromeLocal = { profiles: [] };
    const request = { type: MessageType.IMPORT, profile: JSON.stringify({ title: 'Test' }) };
    await expect(onMessageReceived({ chromeLocal, request })).resolves.toEqual(true);

    expect(mockStorageLoader.setProfiles).toHaveBeenCalledTimes(1);
    expect(mockStorageLoader.setProfiles).toHaveBeenCalledWith([
      expect.objectContaining({ title: 'Test' })
    ]);
  });

  test('onMessageReceived - SWITCH_TO_LATEST', async () => {
    const chromeLocal = { profiles: [{ title: 'Profile 1' }, { title: 'Profile 2' }] };
    const request = { type: MessageType.SWITCH_TO_LATEST };
    await expect(onMessageReceived({ chromeLocal, request })).resolves.toEqual(true);

    expect(mockStorageLoader.setSelectedProfileIndex).toHaveBeenCalledTimes(1);
    expect(mockStorageLoader.setSelectedProfileIndex).toHaveBeenCalledWith(1);
  });

  test('onMessageReceived - Unknown message type', async () => {
    const chromeLocal = {};
    const request = { type: 'UNKNOWN' };
    await expect(onMessageReceived({ chromeLocal, request })).resolves.toEqual(false);
  });
});
