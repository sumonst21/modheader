<script>
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item, Text } from '@smui/list';
  import { mdiContentCopy, mdiArrowExpand, mdiDotsVertical, mdiClose } from '@mdi/js';
  import lodashClone from 'lodash/clone.js';
  import { createEventDispatcher } from 'svelte';
  import MdiIcon from './MdiIcon.svelte';
  import ExpandHeaderDialog from './ExpandHeaderDialog.svelte';

  const dispatch = createEventDispatcher();

  function expandEditor() {
    selectedHeader = lodashClone(selectedHeader);
    dialog.open();
  }

  export let title;
  export let nameLabel;
  export let valueLabel;
  export let selectedHeaderIndex;
  export let selectedHeader;
  let menuAnchor;
  let dialog;
  let moreHeaderMenu;
</script>

<ExpandHeaderDialog
  bind:this={dialog}
  {nameLabel}
  on:save={(event) => {
    dispatch('update', { headerIndex: selectedHeaderIndex, header: event.detail });
  }}
  {selectedHeader}
  {title}
  {valueLabel}
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
      <Item
        on:SMUI:action={() =>
          dispatch('update', {
            headerIndex: selectedHeaderIndex,
            header: { ...selectedHeader, value: '' }
          })}
      >
        <MdiIcon class="icon-with-text" color="#666" icon={mdiClose} size="24" />
        <Text>Clear value</Text>
      </Item>
    </List>
  </Menu>
</div>

<style module>
  .icon-with-text {
    margin-right: 4px;
  }
</style>
