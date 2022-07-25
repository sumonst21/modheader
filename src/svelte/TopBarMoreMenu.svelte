<script>
  import MenuSurface from '@smui/menu-surface';
  import List, { Item, Separator } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import {
    mdiTestTube,
    mdiCheckboxBlankOutline,
    mdiCheckboxMarked,
    mdiFullscreen,
    mdiTrashCan,
    mdiContentCopy,
    mdiFileImportOutline,
    mdiKeyboard,
    mdiDotsVertical,
    mdiShare,
    mdiCloudDownloadOutline,
    mdiCommentCheckOutline,
    mdiCommentRemoveOutline,
    mdiThemeLightDark
  } from '@mdi/js';
  import {
    colorScheme,
    datasource,
    dialog,
    identity,
    userAgent,
    tabs,
    toast,
    LockIcon,
    MdiIcon,
    profile
  } from '@modheader/core';

  const { removeProfile, cloneProfile, selectedProfile, updateProfile, buttonColor } = profile;
  const { showExportDialog, showUpgradeRequired, showImportDialog, showCloudBackupDialog } = dialog;
  const { isProUser, requireSignInForExport } = identity;
  const { profiles, selectedProfileIndex } = datasource;

  const COLOR_SCHEME_LABEL = {
    [colorScheme.ColorSchemes.SYSTEM_DEFAULT]: 'Default',
    [colorScheme.ColorSchemes.LIGHT]: 'Light',
    [colorScheme.ColorSchemes.DARK]: 'Dark'
  };

  let menu;
  let selectedColorScheme = colorScheme.getPreferredColorScheme();

  function toggleComment() {
    updateProfile({
      hideComment: !$selectedProfile.hideComment
    });
  }

  function toggleAlwaysOn() {
    const alwaysOn = !$selectedProfile.alwaysOn;
    updateProfile({ alwaysOn });
    if (alwaysOn) {
      toast.showMessage('This profile will stay active even when it is not selected');
    } else {
      toast.showMessage('This profile will only be active when selected.');
    }
  }

  function getNextColorScheme(selectedColorScheme) {
    switch (selectedColorScheme) {
      case colorScheme.ColorSchemes.SYSTEM_DEFAULT:
        return colorScheme.ColorSchemes.LIGHT;
      case colorScheme.ColorSchemes.LIGHT:
        return colorScheme.ColorSchemes.DARK;
      default:
        return colorScheme.ColorSchemes.SYSTEM_DEFAULT;
    }
  }

  function toggleColorScheme() {
    selectedColorScheme = getNextColorScheme(selectedColorScheme);
    colorScheme.setPreferredColorScheme(selectedColorScheme);
  }

  function openFullscreen() {
    tabs.openUrl({
      url: chrome.runtime.getURL('app.html')
    });
  }
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
      <Item on:SMUI:action={() => openFullscreen()}>
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
      <Item on:SMUI:action={() => toggleColorScheme()}>
        <MdiIcon class="more-menu-icon" size="24" icon={mdiThemeLightDark} color="#666" />
        Dark mode: {COLOR_SCHEME_LABEL[selectedColorScheme]}
      </Item>
      <Item on:SMUI:action={() => tabs.openUrl({ path: '/headers' })}>
        <MdiIcon class="more-menu-icon" size="24" icon={mdiTestTube} color="#666" />
        Test my headers
      </Item>
      {#if userAgent.isChromiumBasedBrowser()}
        <Item on:SMUI:action={() => tabs.openUrl({ url: 'chrome://extensions/shortcuts' })}>
          <MdiIcon class="more-menu-icon" size="24" icon={mdiKeyboard} color="#666" />
          Keyboard shortcuts
        </Item>
      {/if}
      <Separator nav />
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
      <Item
        on:SMUI:action={async () => {
          await removeProfile($selectedProfileIndex);
          menu.setOpen(false);
        }}
      >
        <MdiIcon class="more-menu-icon" size="24" icon={mdiTrashCan} color="#666" />
        Delete profile
      </Item>
      <Item
        on:SMUI:action={async () => {
          await cloneProfile($selectedProfile);
          menu.setOpen(false);
        }}
      >
        <MdiIcon class="more-menu-icon" size="24" icon={mdiContentCopy} color="#666" />
        Clone profile
      </Item>
      <Item
        on:SMUI:action={() => {
          if ($profiles.length < 3 || $isProUser) {
            showImportDialog.set(true);
          } else {
            showUpgradeRequired(
              `You already have ${$profiles.length} profiles. Upgrade to Pro to import more profiles!`
            );
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
