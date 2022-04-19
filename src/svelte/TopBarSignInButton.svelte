<script>
  import Menu from '@smui/menu';
  import List, { Item } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import Button from '@smui/button';
  import ProfilePicture from './ProfilePicture.svelte';
  import { buttonColor } from '../js/profile.js';
  import { signedInUser, signIn, signOut } from '../js/identity.js';

  let accountMenu;
</script>

{#if $signedInUser}
  <div>
    <IconButton dense title="Account" on:click={() => accountMenu.setOpen(true)}>
      <ProfilePicture picture={$signedInUser.picture} />
    </IconButton>

    <Menu bind:this={accountMenu} anchorCorner="TOP_LEFT">
      <List>
        <Item on:SMUI:action={() => signOut()}>Log out</Item>
      </List>
    </Menu>
  </div>
{:else}
  <Button
    style="min-width: fit-content; color: {$buttonColor}"
    on:click={() => signIn()}
    title="Login">Login</Button
  >
{/if}
