<script>
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import Snackbar, { Actions, Label } from "@smui/snackbar";
  import Menu from "@smui/menu";
  import Radio from "@smui/radio";
  import List, { Subheader, Meta, Item, Separator, Text } from "@smui/list";
  import IconButton from "@smui/icon-button";
  import Button from "@smui/button";
  import {
    mdiTrashCan,
    mdiClose,
    mdiPlay,
    mdiPause,
    mdiLockOutline,
    mdiLockOpenOutline,
    mdiDotsVertical,
    mdiContentCopy,
    mdiFileExportOutline,
    mdiFileImportOutline,
    mdiShare,
    mdiCloudDownloadOutline,
    mdiCommentCheckOutline,
    mdiCommentRemoveOutline,
    mdiUndo
  } from "@mdi/js";
  import { get } from "svelte/store";
  import { toRgbString } from "../js/utils";
  import ExportDialog from "./ExportDialog.svelte";
  import ImportDialog from "./ImportDialog.svelte";
  import ProfileBadgeDialog from "./ProfileBadgeDialog.svelte";
  import CloudBackupDialog from "./CloudBackupDialog.svelte";
  import MdiIcon from "./MdiIcon.svelte";
  import {
    selectedProfile,
    changesStack,
    cloneProfile,
    commitChange,
    removeProfile,
    play,
    pause,
    isPaused,
    lockToTab,
    unlockAllTab,
    isLocked,
    undo
  } from "../js/datasource";
  import { DISABLED_COLOR } from "../js/constants";

  let colorPicker;
  let pauseSnackbar;
  let tabLockSnackbar;
  let moreMenu;
  let exportDialog;
  let importDialog;
  let cloudBackupDialog;
  let profileBadgeDialog;

  function togglePause() {
    if ($isPaused) {
      play();
    } else {
      pause();
    }
  }

  function toggleComment() {
    commitChange({
      hideComment: !$selectedProfile.hideComment
    });
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
</script>

<style scoped>
  .profile-title {
    border: none;
    background: none;
    color: #fff;
    margin: 0 10px;
    font-size: 1.5em;
    outline: none;
    padding: 0;
  }

  :global(.top-bar) {
    width: 585px;
  }

  :global(.more-menu) {
    width: 320px;
  }

  :global(.more-menu-icon) {
    margin: 0 8px 0 10px;
  }

  .top-bar-profile-badge {
    border: 2px solid white;
    border-radius: 50%;
    font-size: 20px;
    top: 11px;
    position: absolute;
    left: 11px;
    width: 24px;
    height: 24px;
  }

  .top-bar-profile-badge-text {
    width: 24px;
    display: flex;
    justify-content: center;
  }
</style>

<ProfileBadgeDialog bind:this={profileBadgeDialog} />

<TopAppBar
  variant
  dense
  class="top-bar"
  style="background-color: {$selectedProfile.backgroundColor};">
  <Row>
    <Section>
      <IconButton
        dense
        on:click={() => {
          profileBadgeDialog.show();
        }}
        title="Change profile badge">
        <span
          class="top-bar-profile-badge"
          style="background: {$selectedProfile.backgroundColor}">
          <span class="top-bar-profile-badge-text" style="color: {$selectedProfile.textColor}">{$selectedProfile.shortTitle}</span>
        </span>
      </IconButton>

      <input
        class="mdc-text-field__input profile-title"
        style="color: {$selectedProfile.textColor}"
        value={$selectedProfile.title}
        on:input={event => commitChange({ title: event.target.value })} />
    </Section>
    <Section align="end">
      {#if $changesStack.length > 1}
        <IconButton dense on:click={() => undo()} title="Undo">
          <MdiIcon size="24" icon={mdiUndo} color="white" />
        </IconButton>
      {/if}
      <IconButton
        dense
        on:click={() => togglePause()}
        title={$isPaused ? 'Resume ModHeader' : 'Pause ModHeader'}>
        {#if $isPaused}
          <MdiIcon size="24" icon={mdiPlay} color="white" />
        {:else}
          <MdiIcon size="24" icon={mdiPause} color="white" />
        {/if}
      </IconButton>
      <IconButton
        dense
        on:click={() => exportDialog.show()}
        title="Export / share profile(s)">
        <MdiIcon size="24" icon={mdiShare} color="white" />
      </IconButton>
      <IconButton
        dense
        on:click={() => {
          moreMenu.setOpen(true);
        }}
        title="More">
        <MdiIcon size="24" icon={mdiDotsVertical} color="white" />
      </IconButton>
      <Menu bind:this={moreMenu} class="more-menu" quickOpen>
        <List>
          <Item on:SMUI:action={() => toggleComment()}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={$selectedProfile.hideComment ? mdiCommentCheckOutline : mdiCommentRemoveOutline}
              color="#666" />
            {$selectedProfile.hideComment ? 'Show comment column' : 'Hide comment column'}
          </Item>
          {#if $isLocked}
            <Item on:SMUI:action={() => unlockAllTab()}>
              <MdiIcon
                class="more-menu-icon"
                size="24"
                icon={mdiLockOpenOutline}
                color="#666" />
              Unlock tab
            </Item>
          {:else}
            <Item on:SMUI:action={() => lockToTab()}>
              <MdiIcon
                class="more-menu-icon"
                size="24"
                icon={mdiLockOutline}
                color="#666" />
              Lock to tab
            </Item>
          {/if}
          <Separator nav />
          <Item on:SMUI:action={() => removeProfile($selectedProfile)}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={mdiTrashCan}
              color="#666" />
            Delete profile
          </Item>
          <Item on:SMUI:action={() => cloneProfile($selectedProfile)}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={mdiContentCopy}
              color="#666" />
            Clone profile
          </Item>
          <Item on:SMUI:action={() => exportDialog.show()}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={mdiShare}
              color="#666" />
            Export / share profile(s)
          </Item>
          <Item on:SMUI:action={() => importDialog.show()}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={mdiFileImportOutline}
              color="#666" />
            Import profile(s)
          </Item>
          <Item on:SMUI:action={() => cloudBackupDialog.show()}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={mdiCloudDownloadOutline}
              color="#666" />
            Restore from cloud backup
          </Item>
          <Separator nav />
          <Subheader>Header override mode</Subheader>
          <Item on:SMUI:action={() => commitChange({ appendMode: false })}>
            <Radio bind:group={appendMode} value="false" />
            <Label>Override existing value</Label>
          </Item>
          <Item on:SMUI:action={() => commitChange({ appendMode: true })}>
            <Radio bind:group={appendMode} value="true" />
            <Label>Value concatenation</Label>
          </Item>
          <Item on:SMUI:action={() => commitChange({ appendMode: 'comma' })}>
            <Radio bind:group={appendMode} value="comma" />
            <Label>Comma separated concatenation</Label>
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
    <Button on:click={() => play()}>Resume</Button>
    <IconButton dense on:click={() => pauseSnackbar.close()} title="Dismiss">
      <MdiIcon size="24" icon={mdiClose} color="white" />
    </IconButton>
  </Actions>
</Snackbar>
<Snackbar timeoutMs={10000} bind:this={tabLockSnackbar}>
  <Label>Tab lock is active</Label>
  <Actions>
    <Button on:click={() => unlockAllTab()}>Unlock</Button>
    <IconButton dense on:click={() => tabLockSnackbar.close()} title="Dismiss">
      <MdiIcon size="24" icon={mdiClose} color="white" />
    </IconButton>
  </Actions>
</Snackbar>
