import { jest } from '@jest/globals';
import { FilterType } from './filter.js';

const { modifyRequestUrls } = await import('./modifier.js');

describe('modifier', () => {
  test('Modify request urls - nothing changed', () => {
    const chromeLocal = {};
    const activeProfiles = [];
    const details = {};
    const actual = modifyRequestUrls({ chromeLocal, activeProfiles, details });

    expect(actual).toEqual(undefined);
  });

  test('Modify request urls - Redirect to new url', () => {
    const chromeLocal = {};
    const activeProfiles = [
      {
        urlReplacements: [
          {
            name: new RegExp('bewisse.com'),
            value: 'modheader.com'
          }
        ]
      }
    ];
    const details = {
      url: 'https://bewisse.com/'
    };
    const actual = modifyRequestUrls({ chromeLocal, activeProfiles, details });

    expect(actual).toEqual({ redirectUrl: 'https://modheader.com/' });
  });

  test('Modify request urls - Paused profile', () => {
    const activeProfiles = [
      {
        urlReplacements: [
          {
            name: new RegExp('bewisse.com'),
            value: 'modheader.com'
          }
        ]
      }
    ];
    const details = {
      url: 'https://bewisse.com/'
    };
    const actualUnchanged = modifyRequestUrls({
      chromeLocal: { isPaused: true },
      activeProfiles,
      details
    });
    expect(actualUnchanged).toEqual(undefined);

    const actualChanged = modifyRequestUrls({
      chromeLocal: { isPaused: false },
      activeProfiles,
      details
    });
    expect(actualChanged).toEqual({ redirectUrl: 'https://modheader.com/' });
  });

  test('Modify request urls - Locked profile - Tab mismatch', () => {
    const activeProfiles = [
      {
        urlReplacements: [
          {
            name: new RegExp('bewisse.com'),
            value: 'modheader.com'
          }
        ]
      }
    ];
    const details = {
      url: 'https://bewisse.com/',
      tabId: '1'
    };
    const actualUnchanged = modifyRequestUrls({
      chromeLocal: { lockedTabId: '2' },
      activeProfiles,
      details
    });
    expect(actualUnchanged).toEqual(undefined);

    const actualChanged = modifyRequestUrls({
      chromeLocal: { lockedTabId: '1' },
      activeProfiles,
      details
    });
    expect(actualChanged).toEqual({ redirectUrl: 'https://modheader.com/' });
  });

  test('Modify request urls - Filtering matched', () => {
    const chromeLocal = {};
    const activeProfiles = [
      {
        urlReplacements: [
          {
            name: new RegExp('bewisse.com'),
            value: 'modheader.com'
          }
        ],
        filters: [
          {
            type: FilterType.URLS,
            urlRegex: new RegExp('bewisse.com')
          }
        ]
      }
    ];
    const details = {
      url: 'https://bewisse.com/'
    };

    const actual = modifyRequestUrls({ chromeLocal, activeProfiles, details });
    expect(actual).toEqual({ redirectUrl: 'https://modheader.com/' });
  });

  test('Modify request urls - Filtering not matched', () => {
    const chromeLocal = {};
    const activeProfiles = [
      {
        urlReplacements: [
          {
            name: new RegExp('bewisse.com'),
            value: 'modheader.com'
          }
        ],
        filters: [
          {
            type: FilterType.URLS,
            urlRegex: new RegExp('modheader.com')
          }
        ]
      }
    ];
    const details = {
      url: 'https://bewisse.com/'
    };

    const actual = modifyRequestUrls({ chromeLocal, activeProfiles, details });
    expect(actual).toEqual(undefined);
  });
});
