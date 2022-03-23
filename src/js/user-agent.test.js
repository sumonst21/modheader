import { getChromeVersion } from './user-agent';

describe('user-agent', () => {
  test('getChromeVersion - Chrome browser', () => {
    const chromeVersion = getChromeVersion(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36'
    );

    expect(chromeVersion).toEqual({
      major: 99,
      minor: 0,
      build: 4844,
      patch: 82
    });
  });

  test('getChromeVersion - Firefox browser', () => {
    const chromeVersion = getChromeVersion(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0'
    );

    expect(chromeVersion).toEqual({});
  });

  test('getChromeVersion - Edge browser', () => {
    const chromeVersion = getChromeVersion(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36 Edg/99.0.1150.36'
    );

    expect(chromeVersion).toEqual({
      major: 99,
      minor: 0,
      build: 4844,
      patch: 82
    });
  });

  test('getChromeVersion - Opera browser', () => {
    const chromeVersion = getChromeVersion(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36 OPR/84.0.4316.21'
    );

    expect(chromeVersion).toEqual({
      major: 99,
      minor: 0,
      build: 4844,
      patch: 82
    });
  });

  test('getChromeVersion - Safari browser', () => {
    const chromeVersion = getChromeVersion(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15'
    );

    expect(chromeVersion).toEqual({});
  });
});
