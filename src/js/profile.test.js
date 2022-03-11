import { jest } from '@jest/globals';

const { fixProfiles } = await import('./profile');

describe('profile', () => {
  test('Fix profiles - initialize empty profile', () => {
    const profiles = [];
    const isMutated = fixProfiles(profiles);

    expect(profiles).toEqual([
      {
        appendMode: false,
        backgroundColor: expect.any(String),
        filters: [],
        headers: [
          {
            comment: '',
            enabled: true,
            name: '',
            value: ''
          }
        ],
        hideComment: true,
        respHeaders: [],
        shortTitle: '1',
        textColor: expect.any(String),
        title: 'Profile 1',
        urlReplacements: []
      }
    ]);
    expect(isMutated).toEqual(true);
  });

  test('Fix profiles - Do not mutate good profile', () => {
    const profiles = [
      {
        appendMode: false,
        backgroundColor: '#000000',
        filters: [],
        headers: [
          {
            comment: '',
            enabled: true,
            name: '',
            value: ''
          }
        ],
        hideComment: true,
        respHeaders: [],
        shortTitle: '1',
        textColor: '#ffffff',
        title: 'Profile 1',
        urlReplacements: []
      }
    ];
    const isMutated = fixProfiles(profiles);

    expect(profiles).toEqual([
      {
        appendMode: false,
        backgroundColor: '#000000',
        filters: [],
        headers: [
          {
            comment: '',
            enabled: true,
            name: '',
            value: ''
          }
        ],
        hideComment: true,
        respHeaders: [],
        shortTitle: '1',
        textColor: '#ffffff',
        title: 'Profile 1',
        urlReplacements: []
      }
    ]);
    expect(isMutated).toEqual(false);
  });

  test('Fix profiles - populate missing properties', () => {
    const profiles = [{}];
    const isMutated = fixProfiles(profiles);

    expect(profiles).toEqual([
      {
        appendMode: false,
        backgroundColor: expect.any(String),
        filters: [],
        headers: [
          {
            comment: '',
            enabled: true,
            name: '',
            value: ''
          }
        ],
        hideComment: true,
        respHeaders: [],
        shortTitle: '1',
        textColor: expect.any(String),
        title: 'Profile 1',
        urlReplacements: []
      }
    ]);
    expect(isMutated).toEqual(true);
  });
});
