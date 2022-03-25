import { clearContextMenu, createContextMenu, updateContextMenu } from './context-menu.js';
import { removeLocal, setLocal } from './storage.js';

const PAUSE_MENU_ID = 'pause';
const LOCK_MENU_ID = 'lock';
const BROWSER_ACTION_CONTEXT = ['browser_action'];

export async function initContextMenu() {
  await clearContextMenu();
  await createContextMenu({
    id: PAUSE_MENU_ID,
    title: 'Pause',
    contexts: BROWSER_ACTION_CONTEXT
  });
  await createContextMenu({
    id: LOCK_MENU_ID,
    title: 'Lock',
    contexts: BROWSER_ACTION_CONTEXT
  });
}

export async function resetContextMenu(chromeLocal) {
  if (chromeLocal.isPaused) {
    await updateContextMenu(PAUSE_MENU_ID, {
      title: 'Unpause ModHeader',
      contexts: BROWSER_ACTION_CONTEXT,
      onclick: () => removeLocal('isPaused')
    });
  } else {
    await updateContextMenu(PAUSE_MENU_ID, {
      title: 'Pause ModHeader',
      contexts: BROWSER_ACTION_CONTEXT,
      onclick: () => setLocal({ isPaused: true })
    });
  }
  if (chromeLocal.lockedTabId) {
    await updateContextMenu(LOCK_MENU_ID, {
      title: 'Unlock to all tabs',
      contexts: BROWSER_ACTION_CONTEXT,
      onclick: () => removeLocal('lockedTabId')
    });
  } else {
    await updateContextMenu(LOCK_MENU_ID, {
      title: 'Lock to this tab',
      contexts: BROWSER_ACTION_CONTEXT,
      onclick: () => setLocal({ lockedTabId: chromeLocal.activeTabId })
    });
  }
}
