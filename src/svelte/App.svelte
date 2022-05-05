<script>
  import { AppContent } from '@smui/drawer';
  import Snackbar, { Actions, Label as SnackbarLabel } from '@smui/snackbar';
  import IconButton from '@smui/icon-button';
  import Button from '@smui/button';
  import { mdiClose } from '@mdi/js';
  import { onDestroy, onMount } from 'svelte';
  import lodashCloneDeep from 'lodash/cloneDeep';
  import TopBar from './TopBar.svelte';
  import Drawer from './Drawer.svelte';
  import Filters from './Filters.svelte';
  import Modifiers from './Modifiers.svelte';
  import ExportDialog from './ExportDialog.svelte';
  import ImportDialog from './ImportDialog.svelte';
  import CloudBackupDialog from './CloudBackupDialog.svelte';
  import SignInRequiredDialog from './SignInRequiredDialog.svelte';
  import UpgradeDialog from './UpgradeDialog.svelte';
  import { isPaused, undo, init } from '../js/datasource.js';
  import { FilterType } from '../js/filter.js';
  import { selectedProfile, save } from '../js/profile.js';
  import MdiIcon from './MdiIcon.svelte';
  import { toastMessage, undoable } from '../js/toast.js';
  import { ModifierType } from '../js/modifier-type.js';
  import { reloadColorScheme } from '../js/color-scheme.js';

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

  onMount(() => {
    reloadColorScheme();
  });

  onDestroy(unsubscribeToastMessage);
</script>

{#await init() then initResult}
  <Drawer />

  <AppContent class="app-content" style="--separator-color: {$selectedProfile.backgroundColor};">
    <div class:disabled={$isPaused} class="main-content">
      {#if $selectedProfile.headers.length > 0}
        <Modifiers
          modifierType={ModifierType.REQUEST_HEADER}
          modifiers={lodashCloneDeep($selectedProfile.headers)}
        />
      {/if}
      {#if $selectedProfile.respHeaders.length > 0}
        <Modifiers
          modifierType={ModifierType.RESPONSE_HEADER}
          modifiers={lodashCloneDeep($selectedProfile.respHeaders)}
        />
      {/if}
      {#if $selectedProfile.cookieHeaders.length > 0}
        <Modifiers
          modifierType={ModifierType.COOKIE_MODIFIER}
          modifiers={lodashCloneDeep($selectedProfile.cookieHeaders)}
        />
      {/if}
      {#if $selectedProfile.setCookieHeaders.length > 0}
        <Modifiers
          modifierType={ModifierType.SET_COOKIE_MODIFIER}
          modifiers={lodashCloneDeep($selectedProfile.setCookieHeaders)}
        />
      {/if}
      {#if $selectedProfile.urlReplacements.length > 0}
        <Modifiers
          modifierType={ModifierType.URL_REPLACEMENT}
          modifiers={lodashCloneDeep($selectedProfile.urlReplacements)}
        />
      {/if}
      {#if $selectedProfile.tabFilters.length || $selectedProfile.tabGroupFilters.length || $selectedProfile.windowFilters.length || $selectedProfile.urlFilters.length || $selectedProfile.excludeUrlFilters.length || $selectedProfile.resourceFilters.length}
        <div class="filter-background">
          <Filters
            id="tab-filter"
            filters={lodashCloneDeep($selectedProfile.tabFilters)}
            filterType={FilterType.TABS}
            class="extra-gap"
          />
          <Filters
            id="tab-group-filter"
            filters={lodashCloneDeep($selectedProfile.tabGroupFilters)}
            filterType={FilterType.TAB_GROUPS}
            class="extra-gap"
          />
          <Filters
            id="window-filter"
            filters={lodashCloneDeep($selectedProfile.windowFilters)}
            filterType={FilterType.WINDOWS}
            class="extra-gap"
          />
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
      {/if}
    </div>
    <TopBar />
  </AppContent>

  <ExportDialog />
  <ImportDialog />
  <CloudBackupDialog />
  <UpgradeDialog />
  <SignInRequiredDialog />

  <Snackbar timeoutMs={4000} bind:this={snackbar} labelText={snackbarMessage}>
    <SnackbarLabel />
    <Actions>
      {#if $undoable}
        <Button on:click={() => undo()}>Undo</Button>
      {/if}
      <IconButton dense on:click={() => snackbar.close()} title="Dismiss">
        <MdiIcon size="24" icon={mdiClose} color="#888" />
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

  .main-content {
    position: absolute;
    top: 48px;
    left: 0;
    right: 0;
  }

  .filter-background {
    background-color: var(--filter-background);
  }

  .extra-gap {
    margin: 2px;
  }
</style>
