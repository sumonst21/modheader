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
  import Headers from './Headers.svelte';
  import { isPaused, undo, init } from '../js/datasource';
  import { selectedProfile, save, updateProfile } from '../js/profile';
  import { addUrlRedirect, removeUrlRedirect } from '../js/url-redirect';
  import { addHeader, removeHeader } from '../js/header';
  import MdiIcon from './MdiIcon.svelte';
  import { toastMessage, undoable } from '../js/toast';
  import { KNOWN_REQUEST_HEADERS, KNOWN_RESPONSE_HEADERS } from '../js/constants';

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
        <Headers
          headers={lodashCloneDeep($selectedProfile.headers)}
          class="extra-gap"
          title="Request headers"
          autocompleteListId="request-autocomplete"
          autocompleteNames={KNOWN_REQUEST_HEADERS}
          on:add={() => {
            updateProfile({ headers: addHeader($selectedProfile.headers) });
          }}
          on:remove={(event) => {
            updateProfile({
              headers: removeHeader($selectedProfile.headers, event.detail)
            });
          }}
          on:refresh={(event) => {
            updateProfile({ headers: event.detail });
          }}
        />
      {/if}
      {#if $selectedProfile.respHeaders.length > 0}
        <Headers
          headers={lodashCloneDeep($selectedProfile.respHeaders)}
          class="extra-gap"
          title="Response headers"
          autocompleteListId="response-autocomplete"
          autocompleteNames={KNOWN_RESPONSE_HEADERS}
          profile={selectedProfile}
          on:add={() => {
            updateProfile({
              respHeaders: addHeader($selectedProfile.respHeaders)
            });
          }}
          on:remove={(event) => {
            updateProfile({
              respHeaders: removeHeader($selectedProfile.respHeaders, event.detail)
            });
          }}
          on:refresh={(event) => {
            updateProfile({ respHeaders: event.detail });
          }}
        />
      {/if}
      {#if $selectedProfile.urlReplacements.length > 0}
        <Headers
          headers={lodashCloneDeep($selectedProfile.urlReplacements)}
          class="extra-gap"
          title="Redirect URLs"
          nameLabel="Original URL"
          valueLabel="Redirect URL"
          profile={$selectedProfile}
          on:add={async () => {
            updateProfile({
              urlReplacements: await addUrlRedirect($selectedProfile.urlReplacements)
            });
          }}
          on:remove={(event) => {
            updateProfile({
              urlReplacements: removeUrlRedirect($selectedProfile.urlReplacements, event.detail)
            });
          }}
          on:refresh={(event) => {
            updateProfile({ urlReplacements: event.detail });
          }}
        />
      {/if}
      {#if $selectedProfile.filters.length > 0}
        <Filters filters={lodashCloneDeep($selectedProfile.filters)} class="extra-gap" />
      {/if}
    </div>
  </AppContent>

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
