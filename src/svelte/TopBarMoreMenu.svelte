<script>
  import MenuSurface from '@smui/menu-surface';
  import List, { Item, Separator } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import {
    mdiCheckboxBlankOutline,
    mdiCheckboxMarked,
    mdiFullscreen,
    mdiTrashCan,
    mdiContentCopy,
    mdiFileImportOutline,
    mdiDotsVertical,
    mdiShare,
    mdiCloudDownloadOutline,
    mdiCommentCheckOutline,
    mdiCommentRemoveOutline,
    mdiThemeLightDark
  } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import LockIcon from './LockIcon.svelte';
  import { profiles, selectedProfileIndex } from '../js/datasource.js';
  import {
    removeProfile,
    cloneProfile,
    selectedProfile,
    updateProfile,
    buttonColor
  } from '../js/profile.js';
  import { showMessage } from '../js/toast.js';
  import {
    showExportDialog,
    showUpgradeRequired,
    showImportDialog,
    showCloudBackupDialog
  } from '../js/dialog.js';
  import {
    ColorSchemes,
    getPreferredColorScheme,
    setPreferredColorScheme
  } from '../js/color-scheme.js';
  import { isProUser, requireSignInForExport } from '../js/identity.js';

  const COLOR_SCHEME_LABEL = {
    [ColorSchemes.SYSTEM_DEFAULT]: 'Default',
    [ColorSchemes.LIGHT]: 'Light',
    [ColorSchemes.DARK]: 'Dark'
  };

  let menu;
  let selectedColorScheme = getPreferredColorScheme();

  function openInTab() {
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL('app.html')
      },
      () => {
        window.close();
      }
    );
  }

  function toggleComment() {
    updateProfile({
      hideComment: !$selectedProfile.hideComment
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

  function getNextColorScheme(colorScheme) {
    switch (colorScheme) {
      case ColorSchemes.SYSTEM_DEFAULT:
        return ColorSchemes.LIGHT;
      case ColorSchemes.LIGHT:
        return ColorSchemes.DARK;
      default:
        return ColorSchemes.SYSTEM_DEFAULT;
    }
  }

  function toggleColorScheme() {
    selectedColorScheme = getNextColorScheme(selectedColorScheme);
    setPreferredColorScheme(selectedColorScheme);
  }

  $: appendMode = ($selectedProfile.appendMode || false).toString();
</script>

<div>
  <IconButton
    dense
    id="more-menu"
    on:click={() => {
      menu.setOpen(true);
    }}
    title="More"
  >
    <MdiIcon size="24" icon={mdiDotsVertical} color={$buttonColor} />
  </IconButton>
  <MenuSurface bind:this={menu} class="more-menu">
    <List>
      <Item on:SMUI:action={() => openInTab()}>
        <MdiIcon class="more-menu-icon" size="24" icon={mdiFullscreen} color="#666" />
        Open in tab
      </Item>
      <Item
        on:SMUI:action={() => {
          toggleComment();
          menu.setOpen(false);
        }}
      >
        <MdiIcon
          class="more-menu-icon"
          size="24"
          icon={$selectedProfile.hideComment ? mdiCommentCheckOutline : mdiCommentRemoveOutline}
          color="#666"
        />
        {$selectedProfile.hideComment ? 'Show comment' : 'Hide comment'}
      </Item>
      <Item
        on:SMUI:action={() => {
          toggleAlwaysOn();
          menu.setOpen(false);
        }}
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
      <Item on:SMUI:action={() => toggleColorScheme()} title={`Dark mode`}>
        <MdiIcon class="more-menu-icon" size="24" icon={mdiThemeLightDark} color="#666" />
        Dark mode: {COLOR_SCHEME_LABEL[selectedColorScheme]}
      </Item>
      <Separator nav />
      <Item
        on:SMUI:action={() => {
          removeProfile($selectedProfileIndex);
          menu.setOpen(false);
        }}
      >
        <MdiIcon class="more-menu-icon" size="24" icon={mdiTrashCan} color="#666" />
        Delete profile
      </Item>
      <Item
        on:SMUI:action={() => {
          cloneProfile($selectedProfile);
          menu.setOpen(false);
        }}
      >
        <MdiIcon class="more-menu-icon" size="24" icon={mdiContentCopy} color="#666" />
        Clone profile
      </Item>
      <Item
        on:SMUI:action={() => {
          if (requireSignInForExport()) {
            showExportDialog.set(true);
            menu.setOpen(false);
          }
        }}
      >
        <MdiIcon class="more-menu-icon" size="24" icon={mdiShare} color="#666" />
        Export / share profile
      </Item>
      <Item
        on:SMUI:action={() => {
          if ($profiles.length < 3 || $isProUser) {
            showImportDialog.set(true);
          } else {
            showUpgradeRequired('Upgrade to Pro to import more than 3 profiles!');
          }
          menu.setOpen(false);
        }}
        id="import-profile"
      >
        <MdiIcon class="more-menu-icon" size="24" icon={mdiFileImportOutline} color="#666" />
        Import profile
        {#if $profiles.length >= 3}
          <LockIcon />
        {/if}
      </Item>
      <Item
        on:SMUI:action={() => {
          showCloudBackupDialog.set(true);
          menu.setOpen(false);
        }}
      >
        <MdiIcon class="more-menu-icon" size="24" icon={mdiCloudDownloadOutline} color="#666" />
        Restore cloud backup
      </Item>
    </List>
  </MenuSurface>
</div>

<style module>
  .more-menu {
    width: 300px;
  }
</style>
