<script>
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item, Text, Separator } from '@smui/list';
  import {
    mdiCommentCheckOutline,
    mdiCommentRemoveOutline,
    mdiContentCopy,
    mdiDotsVertical,
    mdiArrowUp,
    mdiArrowDown
  } from '@mdi/js';
  import { selectedProfile, updateProfile } from '../js/profile';
  import { createEventDispatcher } from 'svelte';
  import { MdiIcon } from '@modheader/core';

  const dispatch = createEventDispatcher();

  function dispatchSwap({ index1, index2 }) {
    dispatch('swap', { index1, index2 });
    moreMenu.setOpen(false);
  }

  export let selecteFilterIndex;
  export let filters;
  let moreMenu;
</script>

<div>
  <IconButton
    aria-label="Expand"
    class="small-icon-button data-table-cell flex-fixed-icon"
    dense
    on:click={() => {
      moreMenu.setOpen(true);
    }}
  >
    <MdiIcon color="#666" icon={mdiDotsVertical} size="24" />
  </IconButton>

  <Menu bind:this={moreMenu}>
    <List>
      <Item on:SMUI:action={() => dispatch('copy', selecteFilterIndex)}>
        <MdiIcon class="icon-with-text" color="#666" icon={mdiContentCopy} size="24" />
        <Text>Duplicate</Text>
      </Item>
      <Item
        on:SMUI:action={() => {
          updateProfile({
            hideComment: !$selectedProfile.hideComment
          });
        }}
      >
        <MdiIcon
          class="icon-with-text"
          size="24"
          icon={$selectedProfile.hideComment ? mdiCommentCheckOutline : mdiCommentRemoveOutline}
          color="#666"
        />
        {$selectedProfile.hideComment ? 'Show comment' : 'Hide comment'}
      </Item>
      <Separator nav />
      <Item
        on:SMUI:action={() =>
          dispatchSwap({ index1: selecteFilterIndex, index2: selecteFilterIndex + 1 })}
        disabled={filters.length === 0 || selecteFilterIndex >= filters.length - 1}
      >
        <MdiIcon class="icon-with-text" color="#666" icon={mdiArrowDown} size="24" />
        <Text>Move down</Text>
      </Item>
      <Item
        on:SMUI:action={() =>
          dispatchSwap({ index1: selecteFilterIndex, index2: selecteFilterIndex - 1 })}
        disabled={filters.length === 0 || selecteFilterIndex === 0}
      >
        <MdiIcon class="icon-with-text" color="#666" icon={mdiArrowUp} size="24" />
        <Text>Move up</Text>
      </Item>
    </List>
  </Menu>
</div>

<style module>
  .icon-with-text {
    margin-right: 4px;
  }
</style>
