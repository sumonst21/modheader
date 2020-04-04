export async function createContextMenu(args) {
  return new Promise((resolve, reject) => chrome.contextMenus.create(args, resolve));
}

export async function updateContextMenu(id, args) {
  return new Promise((resolve, reject) => chrome.contextMenus.update(id, args, resolve));
}

export async function clearContextMenu() {
  return new Promise((resolve, reject) => chrome.contextMenus.removeAll(resolve));
}
