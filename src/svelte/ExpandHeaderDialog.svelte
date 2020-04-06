<script>
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  export let selectedHeader;
  export let title;
  export let nameLabel;
  export let valueLabel;
  let dialog;

  export function open() {
    dialog.open();
  }

  function saveHeader() {
    dispatch('save', selectedHeader);
  }
</script>

<Dialog
  bind:this={dialog}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  on:MDCDialog:closed={saveHeader}>
  <Title id="dialog-title">{title}</Title>
  <Content id="dialog-content">
    {#if selectedHeader}
      <div class="mdc-text-field mdc-text-field--textarea">
        <label>{nameLabel}</label>
        <textarea
          class="mdc-text-field__input large-textarea"
          bind:value={selectedHeader.name}
          placeholder={nameLabel} />
      </div>
      <div class="mdc-text-field mdc-text-field--textarea">
        <label>{valueLabel}</label>
        <textarea
          class="mdc-text-field__input large-textarea"
          bind:value={selectedHeader.value}
          placeholder={valueLabel} />
      </div>
      <div class="mdc-text-field mdc-text-field--textarea">
        <label>Comment</label>
        <textarea
          class="mdc-text-field__input large-textarea"
          bind:value={selectedHeader.comment}
          placeholder="Comment" />
      </div>
    {/if}
  </Content>
  <Actions>
    <Button>
      <Label>Done</Label>
    </Button>
  </Actions>
</Dialog>