<script>
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item, Text } from '@smui/list';
  import {
    mdiCommentCheckOutline,
    mdiCommentRemoveOutline,
    mdiContentCopy,
    mdiDotsVertical
  } from '@mdi/js';
  import { selectedProfile, updateProfile } from '../js/profile';
  import { createEventDispatcher } from 'svelte';
  import MdiIcon from './MdiIcon.svelte';

  const dispatch = createEventDispatcher();

  export let selecteFilterIndex;
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
    </List>
  </Menu>
</div>

<style module>
  .icon-with-text {
    margin-right: 4px;
  }
</style>
