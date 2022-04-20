<script>
  import Button, { Label } from '@smui/button';
  import { mdiArrowUpBold } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import BaseDialog from './BaseDialog.svelte';
  import { PRIMARY_COLOR } from '../js/constants';
  import { showUpgradeDialog } from '../js/dialog.js';
  import { upgrade } from '../js/identity.js';
</script>

{#if $showUpgradeDialog}
  <BaseDialog bind:open={$showUpgradeDialog} title="Upgrade required">
    <div>Upgrade to Pro to use this feature.</div>
    <svelte:fragment slot="footer">
      <Button on:click={() => upgrade()}>
        <MdiIcon size="24" icon={mdiArrowUpBold} color={PRIMARY_COLOR} />
        <Label class="ml-small">Upgrade</Label>
      </Button>
    </svelte:fragment>
  </BaseDialog>
{/if}
