<script>
  import Menu from '@smui/menu';
  import List, { Item } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import Button from '@smui/button';
  import ProfilePicture from './ProfilePicture.svelte';
  import { buttonColor } from '../js/profile.js';
  import { signedInUser, signOut } from '../js/identity.js';
  import { CURRENT_BROWSER } from '../js/user-agent.js';

  let accountMenu;

  async function signIn() {
    const url = new URL(`${process.env.URL_BASE}/login`);
    url.searchParams.set('for', CURRENT_BROWSER);
    url.searchParams.set('extension_id', chrome.runtime.id);
    chrome.tabs.create({
      url: url.href
    });
  }
</script>

{#if $signedInUser}
  <div>
    <IconButton dense title="Account" on:click={() => accountMenu.setOpen(true)}>
      <ProfilePicture picture={$signedInUser.picture} />
    </IconButton>

    <Menu bind:this={accountMenu} anchorCorner="TOP_LEFT">
      <List>
        <Item on:SMUI:action={() => signOut()}>Sign out</Item>
      </List>
    </Menu>
  </div>
{:else}
  <Button
    style="min-width: fit-content; color: {$buttonColor}"
    on:click={() => signIn()}
    title="Sign in">Sign in</Button
  >
{/if}
