<script>
  import TopAppBar, { Row, Section } from '@smui/top-app-bar';
  import Snackbar, { Actions, Label } from '@smui/snackbar';
  import Menu from '@smui/menu';
  import List, { Subheader, Item, Separator } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import Button from '@smui/button';
  import {
    mdiCheckboxBlankOutline,
    mdiCheckboxMarked,
    mdiRadioboxBlank,
    mdiRadioboxMarked,
    mdiPlus,
    mdiTrashCan,
    mdiPlay,
    mdiPause,
    mdiDotsVertical,
    mdiContentCopy,
    mdiFileImportOutline,
    mdiShare,
    mdiCloudDownloadOutline,
    mdiCommentCheckOutline,
    mdiCommentRemoveOutline,
    mdiUndo,
    mdiThemeLightDark
  } from '@mdi/js';
  import { lightOrDark } from '../js/color';
  import ExportDialog from './ExportDialog.svelte';
  import ImportDialog from './ImportDialog.svelte';
  import ProfileBadgeDialog from './ProfileBadgeDialog.svelte';
  import CloudBackupDialog from './CloudBackupDialog.svelte';
  import MdiIcon from './MdiIcon.svelte';
  import ProfilePicture from './ProfilePicture.svelte';
  import { selectedProfileIndex, isPaused, isLocked, undo } from '../js/datasource';
  import { removeProfile, cloneProfile, selectedProfile, updateProfile } from '../js/profile';
  import { addHeader } from '../js/header';
  import { addFilter } from '../js/filter';
  import { addUrlRedirect } from '../js/url-redirect';
  import { canUndoChange } from '../js/change-stack';
  import { signedInUser, signOut } from '../js/identity';
  import { showMessage } from '../js/toast';
  import { setPreferredColorScheme } from '../js/color-scheme';
  import { CURRENT_BROWSER } from '../js/user-agent.js';

  let pauseSnackbar;
  let tabLockSnackbar;
  let moreMenu;
  let addMenu;
  let exportDialog;
  let importDialog;
  let cloudBackupDialog;
  let profileBadgeDialog;
  let darkModeMenu;
  let accountMenu;

  function togglePause() {
    isPaused.set(!$isPaused);
  }

  function toggleComment() {
    updateProfile({
      hideComment: !$selectedProfile.hideComment
    });
  }

  async function signIn() {
    const url = new URL(`${process.env.URL_BASE}/login`);
    url.searchParams.set('for', CURRENT_BROWSER);
    url.searchParams.set('extension_id', chrome.runtime.id);
    chrome.tabs.create({
      url: url.href
    });
  }

  function toggleAlwaysOn() {
    const alwaysOn = !$selectedProfile.alwaysOn;
    updateProfile({ alwaysOn });
    if (alwaysOn) {
      showMessage('This profile will stay active even when it is not selected');
    } else {
      showMessage('This profile will only be active when selected.');
    }
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

  $: appendMode = ($selectedProfile.appendMode || false).toString();
  $: sendEmptyHeader = ($selectedProfile.sendEmptyHeader || false).toString();
  $: color = lightOrDark($selectedProfile.backgroundColor) === 'light' ? 'black' : 'white';
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
          <MdiIcon size="24" icon={mdiUndo} {color} />
        </IconButton>
      {/if}
      <IconButton dense on:click={() => addMenu.setOpen(true)} title="Add">
        <MdiIcon size="24" icon={mdiPlus} {color} />
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
          <MdiIcon size="24" icon={mdiPlay} {color} />
        {:else}
          <MdiIcon size="24" icon={mdiPause} {color} />
        {/if}
      </IconButton>
      {#if $isLocked}
        <Button
          on:click={() => isLocked.set(false)}
          title="Unlock tab"
          style="min-width: fit-content; color: {color}"
        >
          Unlock
        </Button>
      {:else}
        <Button
          on:click={() => isLocked.set(true)}
          title="Lock to tab"
          style="min-width: fit-content; color: {color}"
        >
          Lock tab
        </Button>
      {/if}
      <IconButton dense on:click={() => exportDialog.show()} title="Export / share profile(s)">
        <MdiIcon size="24" icon={mdiShare} {color} />
      </IconButton>
      {#if $signedInUser}
        <IconButton dense title="Account" on:click={() => accountMenu.setOpen(true)}>
          <ProfilePicture picture={$signedInUser.picture} />
        </IconButton>

        <Menu bind:this={accountMenu} anchorCorner="TOP_LEFT">
          <List>
            <Item on:SMUI:action={() => signOut()}>Sign out</Item>
          </List>
        </Menu>
      {:else}
        <Button
          style="min-width: fit-content; color: {color}"
          on:click={() => signIn()}
          title="Sign in">Sign in</Button
        >
      {/if}
      <IconButton
        dense
        on:click={() => {
          moreMenu.setOpen(true);
        }}
        title="More"
      >
        <MdiIcon size="24" icon={mdiDotsVertical} {color} />
      </IconButton>
      <Menu bind:this={moreMenu}>
        <List>
          <Item on:SMUI:action={() => toggleComment()}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={$selectedProfile.hideComment ? mdiCommentCheckOutline : mdiCommentRemoveOutline}
              color="#666"
            />
            {$selectedProfile.hideComment ? 'Show comment' : 'Hide comment'}
          </Item>
          <Item
            on:SMUI:action={() => toggleAlwaysOn()}
            title={$selectedProfile.alwaysOn
              ? `This profile will stay active even when it is not selected.`
              : `This profile will only be active when selected.`}
          >
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={$selectedProfile.alwaysOn ? mdiCheckboxMarked : mdiCheckboxBlankOutline}
              color="#666"
            />
            Always stay enabled
          </Item>
          <Item on:SMUI:action={() => darkModeMenu.setOpen(true)} title={`Dark mode`}>
            <MdiIcon class="more-menu-icon" size="24" icon={mdiThemeLightDark} color="#666" />
            Dark mode
          </Item>
          <Menu bind:this={darkModeMenu}>
            <List>
              <Item on:SMUI:action={() => setPreferredColorScheme(undefined)}>System default</Item>
              <Item on:SMUI:action={() => setPreferredColorScheme('dark')}>Dark mode</Item>
              <Item on:SMUI:action={() => setPreferredColorScheme('light')}>Light mode</Item>
            </List>
          </Menu>
          <Separator nav />
          <Item on:SMUI:action={() => removeProfile($selectedProfileIndex)}>
            <MdiIcon class="more-menu-icon" size="24" icon={mdiTrashCan} color="#666" />
            Delete profile
          </Item>
          <Item on:SMUI:action={() => cloneProfile($selectedProfile)}>
            <MdiIcon class="more-menu-icon" size="24" icon={mdiContentCopy} color="#666" />
            Clone profile
          </Item>
          <Item on:SMUI:action={() => exportDialog.show()}>
            <MdiIcon class="more-menu-icon" size="24" icon={mdiShare} color="#666" />
            Export / share profile(s)
          </Item>
          <Item on:SMUI:action={() => importDialog.show()}>
            <MdiIcon class="more-menu-icon" size="24" icon={mdiFileImportOutline} color="#666" />
            Import profile(s)
          </Item>
          <Item on:SMUI:action={() => cloudBackupDialog.show()}>
            <MdiIcon class="more-menu-icon" size="24" icon={mdiCloudDownloadOutline} color="#666" />
            Restore cloud backup
          </Item>
          <Separator nav />
          <Subheader>Header override mode</Subheader>
          <Item on:SMUI:action={() => updateProfile({ appendMode: false })}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={appendMode === 'false' ? mdiRadioboxMarked : mdiRadioboxBlank}
              color="#666"
            />
            <Label>Override existing value</Label>
          </Item>
          <Item on:SMUI:action={() => updateProfile({ appendMode: true })}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={appendMode === 'true' ? mdiRadioboxMarked : mdiRadioboxBlank}
              color="#666"
            />
            <Label>Value concatenation</Label>
          </Item>
          <Item on:SMUI:action={() => updateProfile({ appendMode: 'comma' })}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={appendMode === 'comma' ? mdiRadioboxMarked : mdiRadioboxBlank}
              color="#666"
            />
            <Label>Comma separated</Label>
          </Item>

          <Separator nav />
          <Subheader>Empty header mode</Subheader>
          <Item on:SMUI:action={() => updateProfile({ sendEmptyHeader: false })}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={sendEmptyHeader === 'false' ? mdiRadioboxMarked : mdiRadioboxBlank}
              color="#666"
            />
            <Label>Remove empty header</Label>
          </Item>
          <Item on:SMUI:action={() => updateProfile({ sendEmptyHeader: true })}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={sendEmptyHeader === 'true' ? mdiRadioboxMarked : mdiRadioboxBlank}
              color="#666"
            />
            <Label>Send empty header</Label>
          </Item>
        </List>
      </Menu>
    </Section>
  </Row>
</TopAppBar>

<ExportDialog bind:this={exportDialog} />
<ImportDialog bind:this={importDialog} />
<CloudBackupDialog bind:this={cloudBackupDialog} />

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
