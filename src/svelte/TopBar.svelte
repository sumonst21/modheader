<script>
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import Snackbar, { Actions, Label } from "@smui/snackbar";
  import IconButton from "@smui/icon-button";
  import Button from "@smui/button";
  import {
    mdiTrashCan,
    mdiClose,
    mdiPlay,
    mdiPause,
    mdiLock,
    mdiLockOpen
  } from "@mdi/js";
  import MdiIcon from "./MdiIcon.svelte";
  import {
    selectedProfile,
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

  function togglePause() {
    if ($isPaused) {
      play();
    } else {
      pause();
    }
  }

  function toggleLock() {
    if ($isLocked) {
      unlockAllTab();
    } else {
      lockToTab();
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
    <Section toolbar>
      <input
        class="mdc-text-field__input profile-title"
        bind:value={$selectedProfile.title}
        on:input={() => commitChange({ title: $selectedProfile.title })} />
    </Section>
    <Section align="end" toolbar />
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
      on:click={() => toggleLock()}
      title={$isLocked ? 'Unlock tab' : 'Lock tab'}>
      {#if $isLocked}
        <MdiIcon size="24" icon={mdiLockOpen} color="white" />
      {:else}
        <MdiIcon size="24" icon={mdiLock} color="white" />
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
  </Row>
</TopAppBar>

<Snackbar timeoutMs={10000} bind:this={tabLockSnackbar}>
  <Label>Tab lock is active</Label>
  <Actions>
    <Button on:click={() => toggleLock()}>Unlock</Button>
    <IconButton dense on:click={() => tabLockSnackbar.close()} title="Dismiss">
      <MdiIcon size="24" icon={mdiClose} color="white" />
    </IconButton>
  </Actions>
</Snackbar>
