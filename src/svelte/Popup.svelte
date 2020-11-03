<script>
  import { AppContent, Scrim } from "@smui/drawer";
  import Snackbar, { Actions, Label as SnackbarLabel } from "@smui/snackbar";
  import Dialog, { Title, Content, Actions as DialogActions } from "@smui/dialog";
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
  import { showMessage, toastMessage, undoable } from "../js/toast";
  import { getSync, setSync, getLocal, setLocal } from "../js/storage";
  import { getActiveTab } from "../js/tabs";
  import {
    KNOWN_REQUEST_HEADERS,
    KNOWN_RESPONSE_HEADERS
  } from "../js/constants";

  let snackbar;
  let snackbarMessage;
  let showConsentMessage;
  let confirmOptOutDialog;

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

  function openLink(link) {
    chrome.tabs.create({ url: link });
  }

  getLocal(['proxyMode']).then(({proxyMode}) => {
    if (!proxyMode) {
      showConsentMessage = true;
    }
  });

  function consent(isConsent) {
    setLocal({ proxyMode: isConsent ? 'enabled' : 'disabled' });
    showConsentMessage = false;
    if (confirmOptOutDialog && confirmOptOutDialog.isOpen()) {
      confirmOptOutDialog.close();
    }
    if (isConsent) {
      showMessage('Thank you for helping us!')
    } else {
      showMessage('OK. We will opt you out of the proxy network.')
    }
  }

  function confirmOptOut() {
    confirmOptOutDialog.open();
  }

  onDestroy(unsubscribeToastMessage);
</script>

<style>
  :global(html, body) {
    font-family: Roboto, Helvetica Neue, sans-serif;
    height: 460px;
    /** Fix FF popup disappearance on long window. */
    width: 620px !important;
    position: relative !important;
    overflow-x: hidden;
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

  :global(.medium-icon-button) {
    width: 36px;
    height: 36px;
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
    margin-bottom: 10px;
    width: calc(100% - 10px);
  }

  :global(.data-table-title) {
    margin: 6px 0;
    font-size: 16px;
  }

  :global(.data-table-row-unchecked) {
    background: #eee;
  }

  :global(.data-table-row) {
    display: flex;
    justify-content: start;
    height: 32px;
  }

  :global(.data-table-title-row) {
    margin-top: 5px;
    height: 40px;
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

  .consent {
    background-color: #eee;
    border-radius: 5px;
    position: fixed;
    bottom: 0;
    padding: 1em;
  }

  .consent-buttons {
    margin-top: 10px;
    float: right;
  }
</style>

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
            commitChange({ headers: addHeader($selectedProfile.headers) });
          }}
          on:remove={event => {
            commitChange({
              headers: removeHeader($selectedProfile.headers, event.detail)
            });
          }}
          on:refresh={event => {
            commitChange({ headers: event.detail });
          }} />
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
            commitChange({
              respHeaders: addHeader($selectedProfile.respHeaders)
            });
          }}
          on:remove={event => {
            commitChange({
              respHeaders: removeHeader(
                $selectedProfile.respHeaders,
                event.detail
              )
            });
          }}
          on:refresh={event => {
            commitChange({ respHeaders: event.detail });
          }} />
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
            commitChange({
              urlReplacements: await addUrlReplacement(
                $selectedProfile.urlReplacements
              )
            });
          }}
          on:remove={event => {
            commitChange({
              urlReplacements: removeUrlReplacement(
                $selectedProfile.urlReplacements,
                event.detail
              )
            });
          }}
          on:refresh={event => {
            commitChange({ urlReplacements: event.detail });
          }} />
      {/if}
      {#if $selectedProfile.filters.length > 0}
        <Filters
          filters={lodashCloneDeep($selectedProfile.filters)}
          class="extra-gap" />
      {/if}
    </div>

    {#if showConsentMessage}
      <div class="consent">
        <SnackbarLabel>ModHeader partners with <a href="#" on:click={() => openLink('https://infatica.io/aff.php?aff=102')}>Infatica</a>
          to provide a large proxy network globally. By allowing us to use your IP as a proxy, we can continue to make
          more improvements to ModHeader while keeping it free. We do NOT collect any personal data.</SnackbarLabel>
        <div class="consent-buttons">
          <Button on:click={() => consent(true)} variant="raised">Accept</Button>
          <Button on:click={() => confirmOptOut()}>Opt-out</Button>
          <Button on:click={() => openLink('https://bewisse.com/modheader/infatica/')}>Learn more</Button>
        </div>
      </div>
    {/if}


    <Dialog
        bind:this={confirmOptOutDialog}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-content">
      <Title id="dialog-title">Confirmation</Title>
      <Content id="dialog-content">
        <div>Are you sure you want to opt-out? It will really help us out if you reconsider and give us your consent.
          We do NOT sell your personal data.</div>
      </Content>
      <div class="mdc-dialog__actions">
        <Button on:click={() => consent(true)} variant="raised">I consent to join the proxy network</Button>
        <Button on:click={() => consent(false)}>Opt me out!</Button>
      </div>
    </Dialog>
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
