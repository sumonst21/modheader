<script>
  import MenuSurface from '@smui/menu-surface';
  import List, { Item } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import { mdiPlus } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import LockIcon from './LockIcon.svelte';
  import { selectedProfile, updateProfile, buttonColor } from '../js/profile.js';
  import { isProUser } from '../js/identity.js';
  import { showUpgradeDialog } from '../js/dialog.js';
  import { addHeader } from '../js/header.js';
  import { addUrlRedirect } from '../js/url-redirect.js';
  import {
    addUrlFilter,
    addResourceFilter,
    addTabFilter,
    addTabGroupFilter,
    addWindowFilter
  } from '../js/filter.js';

  async function updateProfileAndClose(profile) {
    await updateProfile(profile);
    addMenu.setOpen(false);
  }

  let addMenu;
</script>

<div>
  <IconButton dense on:click={() => addMenu.setOpen(true)} title="Add" id="add-button">
    <MdiIcon size="24" icon={mdiPlus} color={$buttonColor} />
  </IconButton>
  <MenuSurface
    bind:this={addMenu}
    class="add-menu"
    quickOpen={true}
    anchor={false}
    anchorMargin={{ top: 48, right: 0, bottom: 0, left: 100 }}
  >
    <div class="add-menu-container">
      <List>
        <Item
          id="add-request-header"
          on:SMUI:action={() =>
            updateProfileAndClose({
              headers: addHeader($selectedProfile.headers)
            })}
        >
          Request header
        </Item>
        <Item
          id="add-response-header"
          on:SMUI:action={() =>
            updateProfileAndClose({
              respHeaders: addHeader($selectedProfile.respHeaders)
            })}
        >
          Response header
        </Item>
        <Item
          id="add-cookie-modifier"
          on:SMUI:action={() => {
            if ($isProUser) {
              updateProfileAndClose({
                cookieHeaders: addHeader($selectedProfile.cookieHeaders)
              });
            } else {
              showUpgradeDialog.set(true);
            }
          }}
        >
          Cookie request
          <LockIcon />
        </Item>
        <Item
          id="add-set-cookie-modifier"
          on:SMUI:action={() => {
            if ($isProUser) {
              updateProfileAndClose({
                setCookieHeaders: addHeader($selectedProfile.setCookieHeaders)
              });
            } else {
              showUpgradeDialog.set(true);
            }
          }}
        >
          Set-Cookie response
          <LockIcon />
        </Item>
        <Item
          id="add-url-replacement"
          on:SMUI:action={async () =>
            updateProfileAndClose({
              urlReplacements: await addUrlRedirect($selectedProfile.urlReplacements)
            })}
        >
          Redirect URL
        </Item>
      </List>
      <div class="grid-border" />
      <List>
        <Item
          id="add-tab-filter"
          on:SMUI:action={async () =>
            updateProfileAndClose({
              tabFilters: await addTabFilter($selectedProfile.tabFilters)
            })}>Tab filter</Item
        >
        <Item
          id="add-tab-group-filter"
          on:SMUI:action={async () => {
            if ($isProUser) {
              await updateProfileAndClose({
                tabGroupFilters: await addTabGroupFilter($selectedProfile.tabGroupFilters)
              });
            } else {
              showUpgradeDialog.set(true);
            }
          }}
        >
          Tab group filter
          <LockIcon />
        </Item>

        <Item
          id="add-window-filter"
          on:SMUI:action={async () => {
            if ($isProUser) {
              await updateProfileAndClose({
                windowFilters: await addWindowFilter($selectedProfile.windowFilters)
              });
            } else {
              showUpgradeDialog.set(true);
            }
          }}
        >
          Window filter
          <LockIcon />
        </Item>
        <Item
          id="add-url-filter"
          on:SMUI:action={async () =>
            updateProfileAndClose({
              urlFilters: await addUrlFilter($selectedProfile.urlFilters)
            })}>URL filter</Item
        >
        <Item
          id="add-exclude-url-filter"
          on:SMUI:action={async () =>
            updateProfileAndClose({
              excludeUrlFilters: await addUrlFilter($selectedProfile.excludeUrlFilters)
            })}>Exclude URL filter</Item
        >
        <Item
          id="add-resource-filter"
          on:SMUI:action={async () =>
            updateProfileAndClose({
              resourceFilters: await addResourceFilter($selectedProfile.resourceFilters)
            })}>Resource filter</Item
        >
      </List>
    </div>
  </MenuSurface>
</div>

<style module>
  .add-menu {
    width: 450px;
  }

  .add-menu-container {
    display: grid;
    grid-template-columns: auto 1px auto;
  }

  .grid-border {
    border-left: 1px solid #888;
  }
</style>
