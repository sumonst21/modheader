<script>
  import TopAppBar, { Row, Section } from '@smui/top-app-bar';
  import Snackbar, { Actions, Label } from '@smui/snackbar';
  import Menu from '@smui/menu';
  import List, { Item } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import Button from '@smui/button';
  import { mdiPlus, mdiPlay, mdiPause, mdiShare, mdiUndo } from '@mdi/js';
  import TopBarMoreMenu from './TopBarMoreMenu.svelte';
  import SignInButton from './SignInButton.svelte';
  import ProfileBadgeDialog from './ProfileBadgeDialog.svelte';
  import MdiIcon from './MdiIcon.svelte';
  import { isPaused, isLocked, undo } from '../js/datasource';
  import { selectedProfile, updateProfile, buttonColor } from '../js/profile';
  import { addHeader } from '../js/header';
  import { addFilter } from '../js/filter';
  import { addUrlRedirect } from '../js/url-redirect';
  import { canUndoChange } from '../js/change-stack';
  import { showExportDialog } from '../js/dialog.js';

  let pauseSnackbar;
  let tabLockSnackbar;
  let moreMenu;
  let addMenu;
  let profileBadgeDialog;

  function togglePause() {
    isPaused.set(!$isPaused);
  }

  $: {
    if (pauseSnackbar && tabLockSnackbar) {
      if ($isPaused) {
        tabLockSnackbar.close();
        pauseSnackbar.open();
      } else {
        pauseSnackbar.close();
        if ($isLocked) {
          tabLockSnackbar.open();
        } else {
          tabLockSnackbar.close();
        }
      }
    }
  }
</script>

<ProfileBadgeDialog bind:this={profileBadgeDialog} />

<TopAppBar
  variant
  dense
  class="top-bar"
  style="background-color: {$selectedProfile.backgroundColor};"
>
  <Row>
    <Section>
      <IconButton
        dense
        class="top-bar-profile-badge-icon"
        on:click={() => {
          profileBadgeDialog.show();
        }}
        title="Change profile badge"
      >
        <span class="top-bar-profile-badge" style="background: {$selectedProfile.backgroundColor}">
          <span class="top-bar-profile-badge-text" style="color: {$selectedProfile.textColor}">
            {$selectedProfile.shortTitle}
          </span>
        </span>
      </IconButton>

      <input
        class="mdc-text-field__input profile-title"
        style="color: {$selectedProfile.textColor}"
        value={$selectedProfile.title}
        on:input={(event) => updateProfile({ title: event.target.value })}
      />
    </Section>
    <Section align="end">
      {#if $canUndoChange}
        <IconButton dense on:click={() => undo()} title="Undo">
          <MdiIcon size="24" icon={mdiUndo} color={$buttonColor} />
        </IconButton>
      {/if}
      <IconButton dense on:click={() => addMenu.setOpen(true)} title="Add">
        <MdiIcon size="24" icon={mdiPlus} color={$buttonColor} />
      </IconButton>
      <Menu bind:this={addMenu} class="add-menu">
        <List>
          <Item
            on:SMUI:action={() =>
              updateProfile({
                headers: addHeader($selectedProfile.headers)
              })}
          >
            Request header
          </Item>
          <Item
            on:SMUI:action={() =>
              updateProfile({
                respHeaders: addHeader($selectedProfile.respHeaders)
              })}
          >
            Response header
          </Item>
          <Item
            on:SMUI:action={async () =>
              updateProfile({
                urlReplacements: await addUrlRedirect($selectedProfile.urlReplacements)
              })}
          >
            URL redirect
          </Item>
          <Item
            on:SMUI:action={async () =>
              updateProfile({
                filters: await addFilter($selectedProfile.filters)
              })}>Filter</Item
          >
        </List>
      </Menu>
      <IconButton
        dense
        on:click={() => togglePause()}
        title={$isPaused ? 'Resume ModHeader' : 'Pause ModHeader'}
      >
        {#if $isPaused}
          <MdiIcon size="24" icon={mdiPlay} color={$buttonColor} />
        {:else}
          <MdiIcon size="24" icon={mdiPause} color={$buttonColor} />
        {/if}
      </IconButton>
      {#if $isLocked}
        <Button
          on:click={() => isLocked.set(false)}
          title="Unlock tab"
          style="min-width: fit-content; color: {$buttonColor}"
        >
          Unlock
        </Button>
      {:else}
        <Button
          on:click={() => isLocked.set(true)}
          title="Lock to tab"
          style="min-width: fit-content; color: {$buttonColor}"
        >
          Lock tab
        </Button>
      {/if}
      <IconButton
        dense
        on:click={() => showExportDialog.set(true)}
        title="Export / share profile(s)"
      >
        <MdiIcon size="24" icon={mdiShare} color={$buttonColor} />
      </IconButton>
      <SignInButton />
      <TopBarMoreMenu bind:this={moreMenu} />
    </Section>
  </Row>
</TopAppBar>

<Snackbar timeoutMs={10000} bind:this={pauseSnackbar}>
  <Label>ModHeader is Paused</Label>
  <Actions>
    <Button on:click={() => isPaused.set(false)}>Resume</Button>
  </Actions>
</Snackbar>
<Snackbar timeoutMs={10000} bind:this={tabLockSnackbar}>
  <Label>Tab lock is active</Label>
  <Actions>
    <Button on:click={() => isLocked.set(false)}>Unlock</Button>
  </Actions>
</Snackbar>

<style module>
  .profile-title {
    border: none;
    background: none;
    color: #fff;
    margin: 0 10px;
    font-size: 18px;
    outline: none;
    padding: 0;
  }

  .top-bar {
    width: 585px;
  }

  .top-bar-profile-badge {
    border: 2px solid white;
    border-radius: 50%;
    font-size: 20px;
    top: 10px;
    position: absolute;
    left: 8px;
  }

  .top-bar-profile-badge-text {
    width: 24px;
    display: flex;
    justify-content: center;
  }
</style>
