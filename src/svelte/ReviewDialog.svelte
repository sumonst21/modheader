<script>
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import { mdiClose } from "@mdi/js";
  import { PRIMARY_COLOR } from "../js/constants";
  import { setSync } from "../js/storage";
  import MdiIcon from "./MdiIcon.svelte";
  import {
    mdiThumbUpOutline,
    mdiGiftOutline,
  } from "@mdi/js";

  const ONE_MONTH_FROM_NOW = Date.now() + (1000 * 60 * 60 * 24 * 30);
  const MODE = Math.random() < .5 ? 'REVIEW' : 'DONATE';

  let dialog;
  export function show() {
    dialog.open();
  }

  async function openLink(url) {
    await close(Number.MAX_SAFE_INTEGER);
    chrome.tabs.create({ url });
  }

  async function close(reviewPromptTimestamp) {
    dialog.close();
    await setSync({
      reviewPromptTimestamp
    });
  }
</script>

<Dialog
  bind:this={dialog}
  class="export-dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content">
  <Title id="dialog-title">
    Enjoying ModHeader?
    <IconButton
      aria-label="Close"
      class="dialog-close-button"
      on:click={() => close(ONE_MONTH_FROM_NOW)}>
      <MdiIcon size="32" icon={mdiClose} color="#888" />
    </IconButton>
  </Title>
  <Content id="dialog-content">
    {#if MODE === 'REVIEW'}
      <p>If you enjoy using ModHeader, would you mind taking a moment to rate it?
      It won't take more than a minute!</p>
    {:else}
      <p>Free software takes time and efforts to develop and maintain too.
      Would you mind considering a small donation to help us out?
      Your contribution will allow us to continue making bold plans for
      enhancing the product!</p>
    {/if}
    <p>Thank you for your support!</p>
  </Content>
  <div class="mdc-dialog__actions">
    {#if MODE === 'REVIEW'}
      <Button
        on:click={() => openLink('https://r.bewisse.com/modheader/review?browser=' + process.env.BROWSER)}>
        <MdiIcon
          size="24"
          icon={mdiThumbUpOutline}
          color={PRIMARY_COLOR} />
        <Label class="ml-small">Rate us</Label>
      </Button>
    {:else}
      <Button
        on:click={() => openLink('https://r.bewisse.com/modheader/donate')}>
        <MdiIcon
          size="24"
          icon={mdiGiftOutline}
          color={PRIMARY_COLOR} />
        <Label class="ml-small">Donate</Label>
      </Button>
    {/if}
    <Button
      on:click={() => close(ONE_MONTH_FROM_NOW)}>
      <MdiIcon
        size="24"
        icon={mdiClose}
        color={PRIMARY_COLOR} />
      <Label class="ml-small">Not now</Label>
    </Button>
  </div>
</Dialog>
