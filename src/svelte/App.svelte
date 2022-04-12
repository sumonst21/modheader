<script>
  import { AppContent } from '@smui/drawer';
  import Snackbar, { Actions, Label as SnackbarLabel } from '@smui/snackbar';
  import IconButton from '@smui/icon-button';
  import Button from '@smui/button';
  import { mdiClose } from '@mdi/js';
  import { onDestroy } from 'svelte';
  import lodashCloneDeep from 'lodash/cloneDeep';
  import TopBar from './TopBar.svelte';
  import Drawer from './Drawer.svelte';
  import Filters from './Filters.svelte';
  import Modifiers from './Modifiers.svelte';
  import ExportDialog from './ExportDialog.svelte';
  import ImportDialog from './ImportDialog.svelte';
  import CloudBackupDialog from './CloudBackupDialog.svelte';
  import UpgradeDialog from './UpgradeDialog.svelte';
  import { isPaused, undo, init } from '../js/datasource.js';
  import { FilterType } from '../js/filter.js';
  import { selectedProfile, save } from '../js/profile.js';
  import MdiIcon from './MdiIcon.svelte';
  import { toastMessage, undoable } from '../js/toast.js';
  import { ModifierType } from '../js/modifier-type.js';

  let snackbar;
  let snackbarMessage;

  window.addEventListener('unload', save);

  const unsubscribeToastMessage = toastMessage.subscribe((message) => {
    if (snackbar) {
      snackbarMessage = message;
      if (message.length > 0) {
        snackbar.open();
      } else {
        snackbar.close();
      }
    }
  });

  onDestroy(unsubscribeToastMessage);
</script>

{#await init() then initResult}
  <Drawer />

  <AppContent class="app-content">
    <div class="top-app-bar-container">
      <TopBar />
    </div>
    <div class={$isPaused ? 'disabled' : ''}>
      {#if $selectedProfile.headers.length > 0}
        <Modifiers
          modifierType={ModifierType.REQUEST_HEADER}
          headers={lodashCloneDeep($selectedProfile.headers)}
        />
      {/if}
      {#if $selectedProfile.respHeaders.length > 0}
        <Modifiers
          modifierType={ModifierType.RESPONSE_HEADER}
          headers={lodashCloneDeep($selectedProfile.respHeaders)}
          profile={selectedProfile}
        />
      {/if}
      {#if $selectedProfile.setCookieHeaders.length > 0}
        <Modifiers
          modifierType={ModifierType.SET_COOKIE_MODIFIER}
          headers={lodashCloneDeep($selectedProfile.setCookieHeaders)}
          profile={selectedProfile}
        />
      {/if}
      {#if $selectedProfile.urlReplacements.length > 0}
        <Modifiers
          modifierType={ModifierType.URL_REPLACEMENT}
          headers={lodashCloneDeep($selectedProfile.urlReplacements)}
          profile={$selectedProfile}
        />
      {/if}
      <Filters
        id="url-filter"
        filters={lodashCloneDeep($selectedProfile.urlFilters)}
        filterType={FilterType.URLS}
        class="extra-gap"
      />
      <Filters
        id="exclude-url-filter"
        filters={lodashCloneDeep($selectedProfile.excludeUrlFilters)}
        filterType={FilterType.EXCLUDE_URLS}
        class="extra-gap"
      />
      <Filters
        id="resource-filter"
        filters={lodashCloneDeep($selectedProfile.resourceFilters)}
        filterType={FilterType.RESOURCE_TYPES}
        class="extra-gap"
      />
    </div>
  </AppContent>

  <ExportDialog />
  <ImportDialog />
  <CloudBackupDialog />
  <UpgradeDialog />

  <Snackbar timeoutMs={4000} bind:this={snackbar} labelText={snackbarMessage}>
    <SnackbarLabel />
    <Actions>
      {#if $undoable}
        <Button on:click={() => undo()}>Undo</Button>
      {/if}
      <IconButton dense on:click={() => snackbar.close()} title="Dismiss">
        <MdiIcon size="24" icon={mdiClose} color="white" />
      </IconButton>
    </Actions>
  </Snackbar>
{/await}

<style module>
  .app-content {
    margin-left: 0 !important;
    width: var(--app-content-width);
    position: absolute;
    left: 36px;
  }

  .top-app-bar-container {
    height: 48px;
  }

  .extra-gap {
    margin: 2px;
  }
</style>
