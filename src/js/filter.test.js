import { jest } from '@jest/globals';

const mockTabs = {
  getActiveTab: jest.fn()
};
jest.unstable_mockModule('./tabs.js', () => mockTabs);

const { FilterType, addFilter, removeFilter, optimizeFilters, passFilters } = await import(
  './filter.js'
);

describe('filter', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('addFilter - empty inputs', async () => {
    const actual = await addFilter([]);

    expect(actual).toEqual([
      {
        comment: '',
        enabled: true,
        resourceType: [],
        type: FilterType.URLS,
        urlRegex: ''
      }
    ]);
  });

  test('addFilter - prefill url', async () => {
    mockTabs.getActiveTab.mockResolvedValue({ url: 'https://modheader.com/test' });
    const actual = await addFilter([]);

    expect(actual).toEqual([
      {
        comment: '',
        enabled: true,
        resourceType: [],
        type: FilterType.URLS,
        urlRegex: '.*://modheader.com/.*'
      }
    ]);
  });

  test('addFilter - append to existing inputs', async () => {
    const actual = await addFilter([
      {
        comment: 'Test 1',
        enabled: true,
        resourceType: [],
        type: FilterType.URLS,
        urlRegex: 'test'
      }
    ]);

    expect(actual).toEqual([
      {
        comment: 'Test 1',
        enabled: true,
        resourceType: [],
        type: FilterType.URLS,
        urlRegex: 'test'
      },
      {
        comment: '',
        enabled: true,
        resourceType: [],
        type: FilterType.URLS,
        urlRegex: ''
      }
    ]);
  });

  test('removeFilter - remove at index', async () => {
    const actual = removeFilter(
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

  test('removeFilter - index not in array', async () => {
    const actual = removeFilter(
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

  test('optimize filters', async () => {
    const filters = optimizeFilters([
      {
        comment: 'Converted to Regex',
        enabled: true,
        type: FilterType.URLS,
        urlRegex: '.*.google.com.*'
      },
      {
        comment: 'Converted to Set',
        enabled: true,
        resourceType: ['main_frame'],
        type: FilterType.URLS,
        urlRegex: '.*.google.com.*'
      },
      {
        comment: 'Removed',
        enabled: false,
        type: FilterType.URLS,
        urlRegex: '.*.google.com.*'
      }
    ]);
    expect(filters).toEqual([
      {
        comment: 'Converted to Regex',
        enabled: true,
        resourceType: new Set(),
        type: FilterType.URLS,
        urlRegex: new RegExp('.*.google.com.*')
      },
      {
        comment: 'Converted to Set',
        enabled: true,
        resourceType: new Set(['main_frame']),
        type: FilterType.URLS,
        urlRegex: new RegExp('.*.google.com.*')
      }
    ]);
  });

  test('pass filters - urls filter', async () => {
    const filters = optimizeFilters([
      {
        enabled: true,
        type: FilterType.URLS,
        urlRegex: '.*.google.com.*'
      }
    ]);
    expect(
      passFilters({
        url: 'https://www.google.com/search',
        type: 'main_frame',
        filters
      })
    ).toEqual(true);
    expect(
      passFilters({
        url: 'https://www.bing.com/search',
        type: 'main_frame',
        filters
      })
    ).toEqual(false);
  });

  test('pass filters - excluded urls filter', async () => {
    const filters = optimizeFilters([
      { enabled: true, type: FilterType.EXCLUDE_URLS, urlRegex: '.*.google.com.*' }
    ]);
    expect(
      passFilters({
        url: 'https://www.google.com/search',
        type: 'main_frame',
        filters
      })
    ).toEqual(false);
    expect(
      passFilters({
        url: 'https://www.bing.com/search',
        type: 'main_frame',
        filters
      })
    ).toEqual(true);
  });

  test('pass filters - urls and excluded urls both match - last filter takes precedent', async () => {
    expect(
      passFilters({
        url: 'https://www.google.com/search',
        type: 'main_frame',
        filters: optimizeFilters([
          { enabled: true, type: FilterType.URLS, urlRegex: '.*.google.com.*' },
          { enabled: true, type: FilterType.EXCLUDE_URLS, urlRegex: '.*.google.com.*' }
        ])
      })
    ).toEqual(false);

    expect(
      passFilters({
        url: 'https://www.google.com/search',
        type: 'main_frame',
        filters: optimizeFilters([
          { enabled: true, type: FilterType.EXCLUDE_URLS, urlRegex: '.*.google.com.*' },
          { enabled: true, type: FilterType.URLS, urlRegex: '.*.google.com.*' }
        ])
      })
    ).toEqual(true);
  });

  test('pass filters - resource filter', async () => {
    const filters = optimizeFilters([
      { enabled: true, type: FilterType.RESOURCE_TYPES, resourceType: ['main_frame'] }
    ]);
    expect(
      passFilters({
        url: 'https://www.google.com/search',
        type: 'main_frame',
        filters
      })
    ).toEqual(true);
    expect(
      passFilters({
        url: 'https://www.google.com/search',
        type: 'sub_frame',
        filters
      })
    ).toEqual(false);
  });
});
