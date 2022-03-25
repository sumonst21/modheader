import { setProfiles, setSelectedProfileIndex } from './storage-loader.js';

export const MessageType = {
  EXISTS: 'EXISTS',
  IMPORT: 'IMPORT',
  SWITCH_TO_LATEST: 'SWITCH_TO_LATEST'
};

export async function onMessageReceived({ chromeLocal, request }) {
  switch (request.type) {
    case MessageType.EXISTS:
      return true;
    case MessageType.IMPORT:
      chromeLocal.profiles.push(JSON.parse(request.profile));
      await setProfiles(chromeLocal.profiles);
      return true;
    case MessageType.SWITCH_TO_LATEST:
      await setSelectedProfileIndex(chromeLocal.profiles.length - 1);
      return true;
    default:
      return false;
  }
}
