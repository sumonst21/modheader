<script>
  import Button, { Label } from '@smui/button';
  import { mdiArrowUpBold } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import BaseDialog from './BaseDialog.svelte';
  import { PRIMARY_COLOR } from '../js/constants';
  import { requireSignInDialog, requireSignInDialogContent } from '../js/dialog.js';
  import { signIn } from '../js/identity.js';
</script>

{#if $requireSignInDialog}
  <BaseDialog bind:open={$requireSignInDialog} title="Sign in required">
    <div>{$requireSignInDialogContent}</div>

    <svelte:fragment slot="footer">
      <Button on:click={() => signIn()}>
        <MdiIcon size="24" icon={mdiArrowUpBold} color={PRIMARY_COLOR} />
        <Label class="ml-small">SignIn</Label>
      </Button>
    </svelte:fragment>
  </BaseDialog>
{/if}
