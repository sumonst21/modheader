export async function getActiveTab() {
  return new Promise((resolve) => {
    chrome.permissions.request(
      {
        permissions: ['activeTab']
      },
      function (granted) {
        if (granted) {
          chrome.tabs.query(
            {
              active: true,
              currentWindow: true,
              windowType: 'normal'
            },
            (tabs) => {
              if (tabs && tabs.length > 0) {
                resolve(tabs[0]);
              } else {
                resolve(undefined);
              }
            }
          );
        } else {
          resolve(undefined);
        }
      }
    );
  });
}
