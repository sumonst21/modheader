import { jest } from '@jest/globals';

const mockTabs = {
  getActiveTab: jest.fn()
};
jest.doMock('./tabs.js', () => mockTabs);

const { addUrlRedirect, removeUrlRedirect, optimizeUrlRedirects, redirectUrl } = require(
  './url-redirect.js'
);

describe('url-redirect', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('addUrlRedirect - empty inputs', async () => {
    const actual = await addUrlRedirect([]);

    expect(actual).toEqual([
      {
        enabled: true,
        name: '',
        value: '',
        comment: ''
      }
    ]);
  });

  test('addUrlRedirect - prefill url', async () => {
    mockTabs.getActiveTab.mockResolvedValue({ url: 'https://modheader.com/test' });
    const actual = await addUrlRedirect([]);

    expect(actual).toEqual([
      {
        enabled: true,
        name: '.*://modheader.com/.*',
        value: 'https://modheader.com',
        comment: ''
      }
    ]);
  });

  test('addUrlRedirect - append to existing inputs', async () => {
    const actual = await addUrlRedirect([
      {
        enabled: true,
        name: 'Foo',
        value: 'Bar',
        comment: 'Test'
      }
    ]);

    expect(actual).toEqual([
      {
        enabled: true,
        name: 'Foo',
        value: 'Bar',
        comment: 'Test'
      },
      {
        enabled: true,
        name: '',
        value: '',
        comment: ''
      }
    ]);
  });

  test('removeUrlRedirect - remove at index', async () => {
    const actual = removeUrlRedirect(
      [
        {
          comment: 'Test 1'
        },
        {
          comment: 'Test 2'
        }
      ],
      1
    );

    expect(actual).toEqual([
      {
        comment: 'Test 1'
      }
    ]);
  });

  test('removeUrlRedirect - index not in array', async () => {
    const actual = removeUrlRedirect(
      [
        {
          comment: 'Test 1'
        }
      ],
      1
    );

    expect(actual).toEqual([
      {
        comment: 'Test 1'
      }
    ]);
  });

  test('optimize URLs', async () => {
    const urlRedirects = optimizeUrlRedirects([
      {
        comment: 'Converted to Regex',
        enabled: true,
        name: 'bewisse.com',
        value: 'modheader.com'
      },
      {
        comment: 'Removed',
        enabled: false,
        name: 'bewisse.com',
        value: 'modheader.com'
      }
    ]);
    expect(urlRedirects).toEqual([
      {
        comment: 'Converted to Regex',
        enabled: true,
        name: new RegExp('bewisse.com'),
        value: 'modheader.com'
      }
    ]);
  });

  test('Redirect URL - simple replacement', async () => {
    const urlRedirects = optimizeUrlRedirects([
      {
        enabled: true,
        name: 'bewisse.com',
        value: 'modheader.com'
      }
    ]);
    expect(redirectUrl({ urlRedirects, url: 'https://bewisse.com/' })).toEqual(
      'https://modheader.com/'
    );
  });

  test('Redirect URL - regex replacement', async () => {
    const urlRedirects = optimizeUrlRedirects([
      {
        enabled: true,
        name: 'https://modheader.com/(\\w+)',
        value: 'https://modheader.com/newpath/$1'
      }
    ]);
    expect(redirectUrl({ urlRedirects, url: 'https://modheader.com/test' })).toEqual(
      'https://modheader.com/newpath/test'
    );
  });
});
