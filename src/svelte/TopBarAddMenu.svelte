<script>
  import Menu from '@smui/menu';
  import List, { Item } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import { mdiPlus } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import { selectedProfile, updateProfile, buttonColor } from '../js/profile.js';
  import { addHeader } from '../js/header.js';
  import { addFilter } from '../js/filter.js';
  import { addUrlRedirect } from '../js/url-redirect.js';

  let addMenu;
</script>

<IconButton dense on:click={() => addMenu.setOpen(true)} title="Add" id="add-button">
  <MdiIcon size="24" icon={mdiPlus} color={$buttonColor} />
</IconButton>
<Menu bind:this={addMenu} class="add-menu">
  <List>
    <Item
      id="add-request-header"
      on:SMUI:action={() =>
        updateProfile({
          headers: addHeader($selectedProfile.headers)
        })}
    >
      Request header
    </Item>
    <Item
      id="add-response-header"
      on:SMUI:action={() =>
        updateProfile({
          respHeaders: addHeader($selectedProfile.respHeaders)
        })}
    >
      Response header
    </Item>
    <Item
      id="add-url-replacement"
      on:SMUI:action={async () =>
        updateProfile({
          urlReplacements: await addUrlRedirect($selectedProfile.urlReplacements)
        })}
    >
      URL redirect
    </Item>
    <Item
      id="add-filter"
      on:SMUI:action={async () =>
        updateProfile({
          filters: await addFilter($selectedProfile.filters)
        })}>Filter</Item
    >
  </List>
</Menu>
