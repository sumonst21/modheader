import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { generateImage } from 'jsdom-screenshot';
import ProfileBadge from './ProfileBadge.svelte';
import { render } from '@testing-library/svelte';

expect.extend({ toMatchImageSnapshot });

describe('ProfileBadge', () => {
  beforeEach(() => {
    document.body.style.display = 'flex';
    document.body.style.position = 'relative';
    document.body.style.width = '36px';
    document.body.style.height = '36px';
  });

  test('Profile badge rendered - inactive mode', async () => {
    render(ProfileBadge, {
      target: document.body,
      props: { profile: { shortTitle: '1', backgroundColor: '#a0a', textColor: '#000' } }
    });

    expect(await generateImage()).toMatchImageSnapshot();
  });

  test('Profile badge rendered - active mode', async () => {
    render(ProfileBadge, {
      target: document.body,
      props: {
        profile: { shortTitle: '1', backgroundColor: '#a0a', textColor: '#000', alwaysOn: true }
      }
    });

    expect(await generateImage()).toMatchImageSnapshot();
  });
});
