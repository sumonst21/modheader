<script>
  import { AppContent, Scrim } from "@smui/drawer";
  import Snackbar, { Actions, Label as SnackbarLabel } from "@smui/snackbar";
  import IconButton from "@smui/icon-button";
  import Button from "@smui/button";
  import { mdiClose } from "@mdi/js";
  import { onMount, onDestroy } from "svelte";
  import lodashCloneDeep from "lodash/cloneDeep";
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
  import ReviewDialog from './ReviewDialog.svelte';
  import { toastMessage, undoable } from "../js/toast";
  import { getSync, setSync } from "../js/storage";
  import {
    KNOWN_REQUEST_HEADERS,
    KNOWN_RESPONSE_HEADERS
  } from "../js/constants";

  let reviewDialog;
  let snackbar;
  let snackbarMessage;

  window.addEventListener("unload", save);

  async function promptForReviewsIfNeeded() {
    const { reviewPromptTimestamp } = await getSync('reviewPromptTimestamp');
    if (!reviewPromptTimestamp) {
      await setSync({
        reviewPromptTimestamp: Date.now() + (1000 * 60 * 60 * 24 * 7) // 7 days
      });
    } else if (Date.now() > reviewPromptTimestamp) {
      reviewDialog.show();
    }
  }

  onMount(() => {
    promptForReviewsIfNeeded();
  });

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

<style>
  :global(html, body) {
    font-family: "Segoe UI", Tahoma, sans-serif;
    height: 460px;
    /** Fix FF popup disappearance on long window. */
    width: 620px !important;
    position: relative !important;
    margin: 0;
  }

  :global(button::-moz-focus-inner) {
    border: 0;
  }

  :global(.mdc-dialog__content) {
    overflow-x: hidden !important;
  }

  :global(.extra-gap) {
    margin: 2px;
  }

  :global(.small-icon-button) {
    width: 28px;
    height: 28px;
    padding: 0;
    margin: 0;
  }

  :global(.small-text-button) {
    height: 28px;
    margin: 0 2px;
  }

  :global(.hidden) {
    display: none !important;
  }

  :global(.app-content) {
    margin-left: 0 !important;
    width: 580px;
    position: absolute;
    left: 36px;
  }

  :global(.disabled) {
    opacity: 0.5;
    pointer-events: none;
  }

  :global(.large-textarea) {
    width: 100%;
    height: 50px;
  }

  :global(.ml-small) {
    margin-left: 5px;
  }

  :global(.dialog-close-button) {
    float: right;
    top: 4px;
  }

  :global(.data-table) {
    border-bottom: 1px solid #ddd;
    width: 100%;
  }

  :global(.data-table-title) {
    margin: 4px 0;
  }

  :global(.data-table-row-unchecked) {
    background: #eee;
  }

  :global(.data-table-row) {
    display: flex;
    justify-content: start;
    height: 30px;
  }

  :global(.data-table-cell) {
    padding: 0 2px;
  }

  :global(.data-table .mdc-checkbox) {
    padding: 2px;
    margin-top: 4px;
  }

  :global(.data-table .mdc-checkbox .mdc-checkbox__background) {
    top: 2px;
    left: 8px;
  }

  :global(.flex-grow) {
    flex-grow: 1;
  }

  :global(.flex-fixed-icon) {
    flex-basis: 30px;
    flex-shrink: 0;
    --mdc-ripple-top: 2px !important;
  }

  .top-app-bar-container {
    height: 48px;
  }
</style>

<ReviewDialog bind:this={reviewDialog} />

{#await init() then initResult}
  <Drawer />

  <AppContent class="app-content">
    <div class="top-app-bar-container">
      <TopBar />
    </div>
    <div class={$isPaused ? 'disabled' : ''}>
      <Headers
        headers={lodashCloneDeep($selectedProfile.headers)}
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
        headers={lodashCloneDeep($selectedProfile.respHeaders)}
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
        headers={lodashCloneDeep($selectedProfile.urlReplacements)}
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
      <Filters
        filters={lodashCloneDeep($selectedProfile.filters)}
        class="extra-gap" />
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
