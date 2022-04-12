<script>
  import Menu from '@smui/menu';
  import List, { Item, Separator } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import { mdiPlus } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import { selectedProfile, updateProfile, buttonColor } from '../js/profile.js';
  import { addHeader } from '../js/header.js';
  import { addUrlFilter, addResourceFilter } from '../js/filter.js';
  import { addUrlRedirect } from '../js/url-redirect.js';

  let addMenu;
</script>

<div>
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
        id="add-set-cookie-modifier"
        on:SMUI:action={() =>
          updateProfile({
            setCookieHeaders: addHeader($selectedProfile.setCookieHeaders)
          })}
      >
        Set Cookie Modifier
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
      <Separator />
      <Item
        id="add-url-filter"
        on:SMUI:action={async () =>
          updateProfile({
            urlFilters: await addUrlFilter($selectedProfile.urlFilters)
          })}>URL Filter</Item
      >
      <Item
        id="add-exclude-url-filter"
        on:SMUI:action={async () =>
          updateProfile({
            excludeUrlFilters: await addUrlFilter($selectedProfile.excludeUrlFilters)
          })}>Exclude URL Filter</Item
      >
      <Item
        id="add-resource-filter"
        on:SMUI:action={async () =>
          updateProfile({
            resourceFilters: await addResourceFilter($selectedProfile.resourceFilters)
          })}>Resource Filter</Item
      >
    </List>
  </Menu>
</div>

<style module>
  .add-menu {
    width: 250px;
  }
</style>
