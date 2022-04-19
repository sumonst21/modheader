<script>
  import Dialog, { Title, Content } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import IconButton from '@smui/icon-button';
  import { mdiClose, mdiArrowUpBold } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import { PRIMARY_COLOR } from '../js/constants';
  import { requireSignInDialog, requireSignInDialogContent } from '../js/dialog.js';
  import { signIn } from '../js/identity.js';
</script>

{#if $requireSignInDialog}
  <Dialog bind:open={$requireSignInDialog}>
    <Title>
      Sign in required
      <IconButton
        aria-label="Close"
        class="dialog-close-button"
        on:click={() => requireSignInDialog.set(false)}
      >
        <MdiIcon size="32" icon={mdiClose} color="#888" />
      </IconButton>
    </Title>
    <Content class="dialog-content">
      <div>{$requireSignInDialogContent}</div>
    </Content>
    <div class="mdc-dialog__actions">
      <Button on:click={() => signIn()}>
        <MdiIcon size="24" icon={mdiArrowUpBold} color={PRIMARY_COLOR} />
        <Label class="ml-small">SignIn</Label>
      </Button>
    </div>
  </Dialog>
{/if}
