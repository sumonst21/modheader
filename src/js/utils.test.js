import { takeRight, filterEnabledMods } from './utils';

describe('utils', () => {
  test('takeRight', () => {
    expect(takeRight('Profile 1')).toEqual('1');
    expect(takeRight(1)).toEqual('1');
    expect(takeRight('')).toEqual('0');
  });

  test('filterEnabledMods', () => {
    const actual = filterEnabledMods([
      { enabled: true, name: 'Test 1' },
      { name: 'Test 2' },
      { enabled: true, value: 'Test 3' }
    ]);

    expect(actual).toEqual([{ name: 'Test 1' }]);
  });
});
