<script>
  import Menu from '@smui/menu';
  import List, { Subheader, Item, Separator, Label } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import {
    mdiCheckboxBlankOutline,
    mdiCheckboxMarked,
    mdiRadioboxBlank,
    mdiRadioboxMarked,
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
  import { selectedProfileIndex } from '../js/datasource.js';
  import {
    removeProfile,
    cloneProfile,
    selectedProfile,
    updateProfile,
    buttonColor
  } from '../js/profile.js';
  import { showMessage } from '../js/toast.js';
  import { showExportDialog, showImportDialog, showCloudBackupDialog } from '../js/dialog.js';
  import { setPreferredColorScheme } from '../js/color-scheme.js';

  let menu;
  let darkModeMenu;

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

  $: appendMode = ($selectedProfile.appendMode || false).toString();
  $: sendEmptyHeader = ($selectedProfile.sendEmptyHeader || false).toString();
</script>

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
<Menu bind:this={menu}>
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
    <Item on:SMUI:action={() => showExportDialog.set(true)}>
      <MdiIcon class="more-menu-icon" size="24" icon={mdiShare} color="#666" />
      Export / share profile(s)
    </Item>
    <Item on:SMUI:action={() => showImportDialog.set(true)} id="import-profile">
      <MdiIcon class="more-menu-icon" size="24" icon={mdiFileImportOutline} color="#666" />
      Import profile(s)
    </Item>
    <Item on:SMUI:action={() => showCloudBackupDialog.set(true)}>
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
