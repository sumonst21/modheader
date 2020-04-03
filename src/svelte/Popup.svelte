<script>
  import { AppContent, Scrim } from "@smui/drawer";
  import Snackbar, { Actions, Label as SnackbarLabel } from "@smui/snackbar";
  import IconButton from "@smui/icon-button";
  import Button from "@smui/button";
  import { mdiClose } from "@mdi/js";
  import { onDestroy } from "svelte";
  import TopBar from "./TopBar.svelte";
  import Drawer from "./Drawer.svelte";
  import Filters from "./Filters.svelte";
  import Headers from "./Headers.svelte";
  import {
    selectedProfile,
    isPaused,
    addHeader,
    removeHeader,
    addUrlReplacement,
    removeUrlReplacement,
    commitChange,
    undo,
    save,
    init
  } from "../js/datasource";
  import MdiIcon from "./MdiIcon.svelte";
  import { toastMessage, undoable } from "../js/toast";
  import {
    KNOWN_REQUEST_HEADERS,
    KNOWN_RESPONSE_HEADERS
  } from "../js/constants";
  import lodashClone from "lodash/clone";

  let snackbar;
  let snackbarMessage;

  window.addEventListener("unload", save);

  const unsubscribeToastMessage = toastMessage.subscribe(message => {
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

<style scoped>
  .top-app-bar-container {
    height: 48px;
  }
</style>

{#await init() then initResult}
  <Drawer />

  <AppContent class="app-content">
    <div class="top-app-bar-container">
      <TopBar />
    </div>
    <div class={$isPaused ? 'disabled' : ''}>
      <Headers
        headers={$selectedProfile.headers}
        class="extra-gap"
        title="Request headers"
        autocompleteNames={KNOWN_REQUEST_HEADERS}
        on:add={() => {
          commitChange({ headers: addHeader($selectedProfile.headers) });
        }}
        on:remove={event => {
          commitChange({ headers: removeHeader($selectedProfile.headers, event.detail) });
        }}
        on:refresh={event => {
          commitChange({ headers: event.detail });
        }} />
      <Headers
        headers={$selectedProfile.respHeaders}
        class="extra-gap"
        title="Response headers"
        autocompleteNames={KNOWN_RESPONSE_HEADERS}
        profile={selectedProfile}
        on:add={() => {
          commitChange({ respHeaders: addHeader($selectedProfile.respHeaders) });
        }}
        on:remove={event => {
          commitChange({ respHeaders: removeHeader($selectedProfile.respHeaders, event.detail) });
        }}
        on:refresh={event => {
          commitChange({ respHeaders: event.detail });
        }} />
      <Headers
        headers={$selectedProfile.urlReplacements}
        class="extra-gap"
        title="Redirect URLs"
        autocompleteNames={[]}
        nameLabel="Original URL"
        valueLabel="Redirect URL"
        profile={$selectedProfile}
        on:add={async () => {
          commitChange({ urlReplacements: await addUrlReplacement($selectedProfile.urlReplacements) });
        }}
        on:remove={event => {
          commitChange({ urlReplacements: removeUrlReplacement($selectedProfile.urlReplacements, event.detail) });
        }}
        on:refresh={event => {
          commitChange({ urlReplacements: event.detail });
        }} />
      <Filters class="extra-gap" />
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
