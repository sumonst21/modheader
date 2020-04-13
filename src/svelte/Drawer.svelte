<script>
  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
    Scrim
  } from "@smui/drawer";
  import List, { Item, Text, Separator, Subheader } from "@smui/list";
  import H6 from "@smui/common/H6.svelte";
  import {
    mdiHelpCircleOutline,
    mdiThumbUpOutline,
    mdiGiftOutline,
    mdiCircle,
    mdiSortAscending,
    mdiSortDescending,
    mdiChevronRight,
    mdiChevronLeft,
    mdiPlus
  } from "@mdi/js";
  import MdiIcon from "./MdiIcon.svelte";
  import ProfileBadge from "./ProfileBadge.svelte";
  import {
    addProfile,
    sortProfiles,
    selectProfile,
    selectedProfile,
    profiles
  } from "../js/datasource";
  import { PRIMARY_COLOR } from "../js/constants";

  let drawer;
  let drawerOpen = true;
  let expand = false;
  let sortOrder = "asc";

  function openLink(url) {
    chrome.tabs.create({ url });
  }
</script>

<style scoped>
  :global(.main-drawer) {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    overflow-x: hidden;
    transition: width 0.2s ease-out;
  }

  :global(.main-drawer)::-webkit-scrollbar {
    display: none;
  }

  :global(.main-drawer-expand) {
    width: 256px;
  }

  :global(.main-drawer-collapsed) {
    width: 36px;
  }

  :global(.main-drawer-item) {
    padding: 0 !important;
    margin: 0 !important;
  }

  :global(.main-drawer-logo) {
    min-width: 36px;
  }

  :global(.main-drawer-item-text) {
    font-size: 16px;
    margin-left: 5px;
  }

  .main-drawer-icon-container {
    color: white;
    font-size: 16px;
    border-radius: 25px;
    margin: 10px 6px;
  }

  :global(.main-drawer-icon) {
    padding-top: 4px;
  }

  :global(.main-drawer-list) {
    margin: 2px 0;
    padding: 0;
  }

  .profiles-list {
    min-height: 280px;
  }
</style>

<Drawer
  class="main-drawer {expand ? 'main-drawer-expand' : 'main-drawer-collapsed'}"
  variant="dismissible"
  bind:this={drawer}
  bind:open={drawerOpen}>

  <Content
    class="main-drawer {expand ? 'main-drawer-expand' : 'main-drawer-collapsed'}">
    <List class="main-drawer-list">
      <Item
        class="main-drawer-item"
        title="Visit ModHeader"
        on:click={() => openLink('https://bewisse.com/modheader/')}>
        <img
          src="/images/icon_128.png"
          class="main-drawer-logo"
          width="36"
          height="36"
          alt="ModHeader" />
        <Text class="main-drawer-item-text">
          <h1>ModHeader</h1>
        </Text>
      </Item>
      <Separator nav />

      <div class="profiles-list">
        <Item
          class="main-drawer-item"
          title={expand ? 'Hide navigation' : 'Show navigation'}
          on:click={() => {
            expand = !expand;
          }}>
          <span class="main-drawer-icon-container">
            <MdiIcon
              size="24"
              class="main-drawer-icon"
              icon={expand ? mdiChevronLeft: mdiChevronRight}
              color={PRIMARY_COLOR} />
          </span>
          <Text class="main-drawer-item-text">{expand ? 'Hide navigation' : 'Show navigation'}</Text>
        </Item>
        <Item
          class="main-drawer-item"
          title="Add profile"
          on:click={() => {
            addProfile();
            expand = false;
          }}>
          <span class="main-drawer-icon-container">
            <MdiIcon
              size="24"
              class="main-drawer-icon"
              icon={mdiPlus}
              color={PRIMARY_COLOR} />
          </span>
          <Text class="main-drawer-item-text">Add profile</Text>
        </Item>
        {#each $profiles as profile, profileIndex}
          <Item
            class="main-drawer-item"
            title={profile.title}
            selected={$selectedProfile === profile}
            on:click={() => {
              selectProfile(profileIndex);
              expand = false;
            }}>
            <ProfileBadge {profile} />
            <Text class="main-drawer-item-text">{profile.title}</Text>
          </Item>
        {/each}
        <Item
          class="main-drawer-item"
          title="Sort profiles"
          on:click={() => {
            sortProfiles(sortOrder);
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
          }}>
          <span class="main-drawer-icon-container">
            <MdiIcon
              size="24"
              class="main-drawer-icon"
              icon={sortOrder === 'asc' ? mdiSortAscending : mdiSortDescending}
              color={PRIMARY_COLOR} />
          </span>
          <Text class="main-drawer-item-text">Sort profiles</Text>
        </Item>
      </div>

      <Separator nav />
      <Item
        class="main-drawer-item"
        title="Donate"
        on:click={() => openLink('https://r.bewisse.com/modheader/donate')}>
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={mdiGiftOutline}
            color={PRIMARY_COLOR} />
        </span>
        <Text class="main-drawer-item-text">Donate</Text>
      </Item>
      <Item
        class="main-drawer-item"
        title="Rate us"
        on:click={() => openLink('https://r.bewisse.com/modheader/review?browser=' + process.env.BROWSER)}>
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={mdiThumbUpOutline}
            color={PRIMARY_COLOR} />
        </span>
        <Text class="main-drawer-item-text">Rate us</Text>
      </Item>
      <Item
        class="main-drawer-item"
        title="Help"
        on:click={() => openLink('https://bewisse.com/modheader/help/')}>
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={mdiHelpCircleOutline}
            color={PRIMARY_COLOR} />
        </span>

        <Text class="main-drawer-item-text">Help</Text>
      </Item>
    </List>
  </Content>
</Drawer>
