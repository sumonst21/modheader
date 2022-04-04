<script>
  import Dialog, { Title, Content } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import IconButton from '@smui/icon-button';
  import { mdiClose, mdiArrowUpBold } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import { PRIMARY_COLOR } from '../js/constants';
  import { showUpgradeDialog } from '../js/dialog.js';
  import { upgrade } from '../js/identity.js';
</script>

<Dialog
  bind:open={$showUpgradeDialog}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
>
  <Title id="dialog-title">
    Upgrade required
    <IconButton
      aria-label="Close"
      class="dialog-close-button"
      on:click={() => showUpgradeDialog.set(false)}
    >
      <MdiIcon size="32" icon={mdiClose} color="#888" />
    </IconButton>
  </Title>
  <Content id="dialog-content" class="upgrade-dialog-content">
    <div>Upgrade to Pro to use this feature.</div>
  </Content>
  <div class="mdc-dialog__actions">
    <Button on:click={() => upgrade()}>
      <MdiIcon size="24" icon={mdiArrowUpBold} color={PRIMARY_COLOR} />
      <Label class="ml-small">Upgrade</Label>
    </Button>
  </div>
</Dialog>

<style module>
  .upgrade-dialog-content {
    margin: 0;
    padding: 0;
  }
</style>
