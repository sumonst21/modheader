import { FilterType } from './filter.js';
import { modifyRequestUrls, modifyRequestHeaders, modifyResponseHeaders } from './modifier.js';

describe('modifier', () => {
  describe('Modify request urls', () => {
    test('Nothing changed', () => {
      const chromeLocal = {};
      const activeProfiles = [];
      const details = {};
      const actual = modifyRequestUrls({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual(undefined);
    });

    test('Redirect to new url', () => {
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

    test('Paused profile', () => {
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

    test('Locked profile - Tab mismatch', () => {
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

    test('Filtering matched', () => {
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

    test('Filtering not matched', () => {
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

  describe('Modify request headers', () => {
    test('Nothing changed', () => {
      const chromeLocal = {};
      const activeProfiles = [];
      const details = {};
      const actual = modifyRequestHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual(undefined);
    });

    test('Modify header - Override value, ignore header case', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          headers: [
            {
              name: 'foo',
              value: 'Test bar'
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        requestHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyRequestHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        requestHeaders: [
          {
            name: 'Foo',
            value: 'Test bar'
          }
        ]
      });
    });

    test('Modify header - Append mode', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          appendMode: true,
          headers: [
            {
              name: 'foo',
              value: 'Test bar'
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        requestHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyRequestHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        requestHeaders: [
          {
            name: 'Foo',
            value: 'BarTest bar'
          }
        ]
      });
    });

    test('Modify header - Comma append mode', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          appendMode: 'comma',
          headers: [
            {
              name: 'foo',
              value: 'Test bar'
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        requestHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyRequestHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        requestHeaders: [
          {
            name: 'Foo',
            value: 'Bar,Test bar'
          }
        ]
      });
    });

    test('Modify header - Add new header', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          headers: [
            {
              name: 'foo',
              value: 'Test bar'
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        requestHeaders: []
      };
      const actual = modifyRequestHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        requestHeaders: [
          {
            name: 'foo',
            value: 'Test bar'
          }
        ]
      });
    });

    test('Modify header - Remove header', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          headers: [
            {
              name: 'foo',
              value: ''
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        requestHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyRequestHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        requestHeaders: []
      });
    });

    test('Modify header - Send empty header', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          sendEmptyHeader: true,
          headers: [
            {
              name: 'foo',
              value: ''
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        requestHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyRequestHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        requestHeaders: [
          {
            name: 'Foo',
            value: ''
          }
        ]
      });
    });

    test('Modify header - Multiple profiles', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          headers: [
            {
              name: 'foo',
              value: 'Test Profile 1'
            }
          ]
        },
        {
          appendMode: 'comma',
          headers: [
            {
              name: 'Foo',
              value: 'Test Profile 2'
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        requestHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyRequestHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        requestHeaders: [
          {
            name: 'Foo',
            value: 'Test Profile 1,Test Profile 2'
          }
        ]
      });
    });

    test('Modify header - No modifications', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          headers: []
        },
        {}
      ];
      const details = {
        url: 'https://modheader.com/',
        requestHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyRequestHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        requestHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      });
    });
  });

  describe('Modify response headers', () => {
    test('Nothing changed', () => {
      const chromeLocal = {};
      const activeProfiles = [];
      const details = {};
      const actual = modifyResponseHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual(undefined);
    });

    test('Modify header - Override value, ignore header case', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          respHeaders: [
            {
              name: 'foo',
              value: 'Test bar'
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        responseHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyResponseHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        responseHeaders: [
          {
            name: 'Foo',
            value: 'Test bar'
          }
        ]
      });
    });

    test('Modify header - Append mode', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          appendMode: true,
          respHeaders: [
            {
              name: 'foo',
              value: 'Test bar'
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        responseHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyResponseHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        responseHeaders: [
          {
            name: 'Foo',
            value: 'BarTest bar'
          }
        ]
      });
    });

    test('Modify header - Comma append mode', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          appendMode: 'comma',
          respHeaders: [
            {
              name: 'foo',
              value: 'Test bar'
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        responseHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyResponseHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        responseHeaders: [
          {
            name: 'Foo',
            value: 'Bar,Test bar'
          }
        ]
      });
    });

    test('Modify header - Add new header', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          respHeaders: [
            {
              name: 'foo',
              value: 'Test bar'
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        responseHeaders: []
      };
      const actual = modifyResponseHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        responseHeaders: [
          {
            name: 'foo',
            value: 'Test bar'
          }
        ]
      });
    });

    test('Modify header - Remove header', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          respHeaders: [
            {
              name: 'foo',
              value: ''
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        responseHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyResponseHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        responseHeaders: []
      });
    });

    test('Modify header - Send empty header', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          sendEmptyHeader: true,
          respHeaders: [
            {
              name: 'foo',
              value: ''
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        responseHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyResponseHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        responseHeaders: [
          {
            name: 'Foo',
            value: ''
          }
        ]
      });
    });

    test('Modify header - Multiple profiles', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          respHeaders: [
            {
              name: 'foo',
              value: 'Test Profile 1'
            }
          ]
        },
        {
          appendMode: 'comma',
          respHeaders: [
            {
              name: 'Foo',
              value: 'Test Profile 2'
            }
          ]
        }
      ];
      const details = {
        url: 'https://modheader.com/',
        responseHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyResponseHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual({
        responseHeaders: [
          {
            name: 'Foo',
            value: 'Test Profile 1,Test Profile 2'
          }
        ]
      });
    });

    test('Modify header - No modifications', () => {
      const chromeLocal = {};
      const activeProfiles = [
        {
          respHeaders: []
        },
        {}
      ];
      const details = {
        url: 'https://modheader.com/',
        responseHeaders: [
          {
            name: 'Foo',
            value: 'Bar'
          }
        ]
      };
      const actual = modifyResponseHeaders({ chromeLocal, activeProfiles, details });

      expect(actual).toEqual(undefined);
    });
  });
});
