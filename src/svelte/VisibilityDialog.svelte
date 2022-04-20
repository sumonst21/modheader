<script>
  import Select, { Option } from '@smui/select';
  import Textfield from '@smui/textfield';
  import Button, { Label } from '@smui/button';
  import BaseDialog from './BaseDialog.svelte';
  import { mdiContentSave } from '@mdi/js';
  import { PRIMARY_COLOR } from '../js/constants.js';
  import { Visibility } from '../js/visibility.js';
  import MdiIcon from './MdiIcon.svelte';
  import lodashUniq from 'lodash/uniq';
  import { createEventDispatcher } from 'svelte';

  const dispatcher = createEventDispatcher();

  export let visibility = Visibility.restricted.value;

  export function show(allowedEmails) {
    allowedEmailsText = allowedEmails.join('\n');
    open = true;
  }

  let open;
  let allowedEmailsText = '';
</script>

<BaseDialog bind:open title="Change visibility">
  <Select bind:value={visibility} label="Visibility">
    {#each Object.values(Visibility) as visibility}
      <Option value={visibility.value}>{visibility.label}</Option>
    {/each}
    <svelte:fragment slot="helperText">{Visibility[visibility].description}</svelte:fragment>
  </Select>

  <Textfield
    textarea
    disabled={visibility !== Visibility.restricted.value}
    input$rows="4"
    fullwidth
    class="mt-2 export-text-field"
    bind:value={allowedEmailsText}
    label="List of additional allowed emails - one entry per line"
  />

  <svelte:fragment slot="footer">
    <Button on:click={() => (open = false)}>
      <Label class="ml-small">Cancel</Label>
    </Button>
    <Button
      on:click={() => {
        dispatcher('save', {
          visibility,
          allowedEmails: lodashUniq(
            allowedEmailsText
              .split('\n')
              .map((email) => email.toLowerCase())
              .filter((email) => email)
          )
        });
        open = false;
      }}
    >
      <MdiIcon size="24" icon={mdiContentSave} color={PRIMARY_COLOR} />
      <Label class="ml-small">Save</Label>
    </Button>
  </svelte:fragment>
</BaseDialog>
