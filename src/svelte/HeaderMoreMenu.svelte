<script>
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Separator, Item, Label, Text } from '@smui/list';
  import { mdiContentCopy, mdiArrowExpand, mdiDotsVertical, mdiClose } from '@mdi/js';
  import lodashOmit from 'lodash/omit.js';
  import lodashClone from 'lodash/clone.js';
  import { createEventDispatcher } from 'svelte';
  import MdiIcon from './MdiIcon.svelte';
  import ExpandHeaderDialog from './ExpandHeaderDialog.svelte';
  import { AppendMode } from '../js/append-mode.js';

  const dispatch = createEventDispatcher();

  function expandEditor() {
    selectedHeader = lodashClone(selectedHeader);
    dialog.open();
  }

  function dispatchUpdate(header) {
    dispatch('update', { headerIndex: selectedHeaderIndex, header });
    moreHeaderMenu.setOpen(false);
  }

  export let modifierHandler;
  export let selectedHeaderIndex;
  export let selectedHeader;
  let dialog;
  let moreHeaderMenu;
</script>

<ExpandHeaderDialog
  bind:this={dialog}
  nameLabel={modifierHandler.nameLabel}
  on:save={(event) => dispatchUpdate(event.detail)}
  {selectedHeader}
  title={modifierHandler.title}
  valueLabel={modifierHandler.valueLabel}
/>

<div>
  <IconButton
    aria-label="Expand"
    class="small-icon-button data-table-cell flex-fixed-icon"
    dense
    on:click={() => {
      moreHeaderMenu.setOpen(true);
    }}
  >
    <MdiIcon color="#666" icon={mdiDotsVertical} size="24" />
  </IconButton>

  <Menu bind:this={moreHeaderMenu}>
    <List>
      <Item on:SMUI:action={() => expandEditor()}>
        <MdiIcon class="icon-with-text" color="#666" icon={mdiArrowExpand} size="24" />
        <Text>Expand</Text>
      </Item>
      <Item on:SMUI:action={() => dispatch('copy', selectedHeaderIndex)}>
        <MdiIcon class="icon-with-text" color="#666" icon={mdiContentCopy} size="24" />
        <Text>Duplicate</Text>
      </Item>
      <Item on:SMUI:action={() => dispatchUpdate({ ...selectedHeader, value: '' })}>
        <MdiIcon class="icon-with-text" color="#666" icon={mdiClose} size="24" />
        <Text>Clear value</Text>
      </Item>
      {#if modifierHandler.supportAppendMode}
        <Separator nav />
        {#if selectedHeader.appendMode}
          <Item on:SMUI:action={() => dispatchUpdate(lodashOmit(selectedHeader, ['appendMode']))}>
            <Label>Clear append mode</Label>
          </Item>
        {:else}
          <Item
            on:SMUI:action={() =>
              dispatchUpdate({ ...selectedHeader, appendMode: AppendMode.APPEND })}
          >
            <Label>Append instead of override</Label>
          </Item>
        {/if}
      {/if}
    </List>
  </Menu>
</div>

<style module>
  .icon-with-text {
    margin-right: 4px;
  }
</style>
