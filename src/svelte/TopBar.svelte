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
    mdiFileImportOutline
  } from "@mdi/js";
  import { get } from "svelte/store";
  import MdiIcon from "./MdiIcon.svelte";
  import {
    selectedProfile,
    cloneProfile,
    commitChange,
    removeProfile,
    play,
    pause,
    isPaused,
    lockToTab,
    unlockAllTab,
    isLocked
  } from "../js/datasource";

  let colorPicker;
  let tabLockSnackbar;
  let moreMenuLocation;
  let moreMenu;

  function togglePause() {
    if ($isPaused) {
      play();
    } else {
      pause();
    }
  }

  $: {
    if (tabLockSnackbar) {
      if ($isLocked) {
        tabLockSnackbar.open();
      } else {
        tabLockSnackbar.close();
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

  :global(.more-menu) {
    width: 320px;
    overflow: hidden;
  }

  :global(.more-menu-icon) {
    margin: 0 8px 0 10px;
  }

  .color-picker {
    height: 18px;
    margin: 0;
    padding: 0;
    width: 18px;
    -webkit-appearance: none;
    border: #fff 3px solid;
    border-radius: 5px;
  }

  .color-picker:focus {
    outline: none;
  }

  .color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
    outline: 0;
  }
  .color-picker::-webkit-color-swatch {
    border: none;
  }
</style>

<TopAppBar variant dense style="background-color: {$selectedProfile.color};">
  <Row>
    <Section>
      <input
        class="mdc-text-field__input profile-title"
        value={$selectedProfile.title}
        on:input={event => commitChange({ title: event.target.value })} />
    </Section>
    <Section align="end" />
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
      on:click={() => removeProfile($selectedProfile)}
      title="Delete profile">
      <MdiIcon size="24" icon={mdiTrashCan} color="white" />
    </IconButton>
    <IconButton
      dense
      on:click={() => colorPicker.click()}
      title="Change profile color">
      <input
        bind:this={colorPicker}
        class="color-picker"
        type="color"
        bind:value={$selectedProfile.color}
        on:change={() => commitChange({ color: $selectedProfile.color })} />
    </IconButton>
    <IconButton
      dense
      on:click={() => {
        moreMenu.hoistMenuToBody();
        moreMenu.setAnchorElement(moreMenuLocation);
        moreMenu.setOpen(true);
      }}
      title="More">
      <MdiIcon size="24" icon={mdiDotsVertical} color="white" />
    </IconButton>
    <div bind:this={moreMenuLocation} />
  </Row>
</TopAppBar>

<Menu bind:this={moreMenu} class="more-menu">
  <List>
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
    <Item on:SMUI:action={() => cloneProfile($selectedProfile)}>
      <MdiIcon
        class="more-menu-icon"
        size="24"
        icon={mdiContentCopy}
        color="#666" />
      Clone profile
    </Item>
    <Item on:SMUI:action={() => cloneProfile($selectedProfile)}>
      <MdiIcon
        class="more-menu-icon"
        size="24"
        icon={mdiFileExportOutline}
        color="#666" />
      Export profile
    </Item>
    <Item on:SMUI:action={() => cloneProfile($selectedProfile)}>
      <MdiIcon
        class="more-menu-icon"
        size="24"
        icon={mdiFileImportOutline}
        color="#666" />
      Import profile
    </Item>
  </List>
  <Separator />
  <List radiolist>
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

<Snackbar timeoutMs={10000} bind:this={tabLockSnackbar}>
  <Label>Tab lock is active</Label>
  <Actions>
    <Button on:click={() => unlockAllTab()}>Unlock</Button>
    <IconButton dense on:click={() => tabLockSnackbar.close()} title="Dismiss">
      <MdiIcon size="24" icon={mdiClose} color="white" />
    </IconButton>
  </Actions>
</Snackbar>
