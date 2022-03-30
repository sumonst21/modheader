<script>
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Textfield from '@smui/textfield';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let selectedHeader;
  export let title;
  export let nameLabel;
  export let valueLabel;
  let dialogVisible;

  export function open() {
    dialogVisible = true;
  }

  function saveHeader() {
    dispatch('save', selectedHeader);
  }
</script>

<Dialog
  bind:open={dialogVisible}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  on:MDCDialog:closed={saveHeader}
>
  <Title id="dialog-title">{title}</Title>
  <Content id="dialog-content">
    <div class="expand-header-dialog-content">
      {#if selectedHeader}
        <Textfield
          textarea
          fullwidth
          class="expand-header-dialog-textfield"
          bind:value={selectedHeader.name}
          label={nameLabel}
        />
        <Textfield
          textarea
          fullwidth
          class="expand-header-dialog-textfield"
          bind:value={selectedHeader.value}
          label={valueLabel}
        />
        <Textfield
          textarea
          fullwidth
          class="expand-header-dialog-textfield"
          bind:value={selectedHeader.comment}
          label="Comment"
        />
      {/if}
    </div>
  </Content>
  <Actions>
    <Button>
      <Label>Done</Label>
    </Button>
  </Actions>
</Dialog>

<style module>
  .expand-header-dialog-content {
    padding-top: 5px;
  }

  .expand-header-dialog-textfield {
    margin: 5px;
  }
</style>
