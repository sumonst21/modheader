<script>
  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
    Scrim
  } from "@smui/drawer";
  import IconButton from "@smui/icon-button";
  import MdiIcon from "./MdiIcon.svelte";
  import List, { Item, Text, Separator, Subheader } from "@smui/list";
  import { createEventDispatcher } from "svelte";
  import H6 from "@smui/common/H6.svelte";
  import {
    mdiHelpCircleOutline,
    mdiThumbUpOutline,
    mdiGiftOutline,
    mdiCircle,
    mdiPlus
  } from "@mdi/js";

  const dispatch = createEventDispatcher();
  export let profiles;
  export let selectedProfile;
  let drawer;
  let drawerOpen = true;
  let expand = false;

  function onMouseenter() {
    expand = true;
  }

  function onMouseleave() {
    expand = false;
  }

  function openLink(url) {
    chrome.tabs.create({ url });
  }

  function addProfile() {
    dispatch("add");
  }

  function selectProfile(profile) {
    dispatch("select", profile);
  }
</script>

<style scoped>
  :global(.main-drawer) {
    display: block;
    position: absolute;
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

  :global(.main-drawer-item-text) {
    font-size: 16px;
    margin-left: 5px;
  }

  .main-drawer-icon-container {
    color: white;
    font-size: 16px;
    border-radius: 25px;
    margin: 6px;
  }

  .main-drawer-profile-icon-text {
    width: 24px;
    height: 24px;
    margin: 10px 7px;
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
  on:mouseenter={onMouseenter}
  on:mouseleave={onMouseleave}
  bind:this={drawer}
  bind:open={drawerOpen}>

  <Content
    class="main-drawer {expand ? 'main-drawer-expand' : 'main-drawer-collapsed'}">
    <List class="main-drawer-list">
      <Item
        class="main-drawer-item"
        on:click={() => openLink('https://bewisse.com/modheader/')}>
        <img src="/images/icon_128.png" width="36px" alt="ModHeader" />
        <Text class="main-drawer-item-text">
          <h1>ModHeader</h1>
        </Text>
      </Item>
      <Separator nav />

      <div class="profiles-list">
        <Item
          class="main-drawer-item"
          on:click={() => {
            addProfile();
            expand = false;
          }}>
          <span class="main-drawer-icon-container">
            <MdiIcon
              size="24"
              class="main-drawer-icon"
              icon={mdiPlus}
              color="#1976d2" />
          </span>
          <Text class="main-drawer-item-text">Add Profile</Text>
        </Item>
        {#each profiles as profile}
          <Item
            class="main-drawer-item"
            selected={selectedProfile === profile}
            on:click={() => {
              selectProfile(profile);
              expand = false;
            }}>
            <span
              class="main-drawer-icon-container"
              style="background: {profile.color}">
              <span class="main-drawer-profile-icon-text">
                {profile.shortTitle}
              </span>
            </span>
            <Text class="main-drawer-item-text">{profile.title}</Text>
          </Item>
        {/each}
      </div>

      <Separator nav />
      <Item
        class="main-drawer-item"
        on:click={() => openLink('https://paypal.me/hao1300')}>
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={mdiGiftOutline}
            color="#1976d2" />
        </span>
        <Text class="main-drawer-item-text">Donate</Text>
      </Item>
      <Item
        class="main-drawer-item"
        on:click={() => openLink('https://chrome.google.com/webstore/detail/idgpnmonknjnojddfkpgkljpfnnfcklj')}>
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={mdiThumbUpOutline}
            color="#1976d2" />
        </span>
        <Text class="main-drawer-item-text">Rate us</Text>
      </Item>
      <Item
        class="main-drawer-item"
        on:click={() => openLink('https://bewisse.com/modheader/help/')}>
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={mdiHelpCircleOutline}
            color="#1976d2" />
        </span>

        <Text class="main-drawer-item-text">Help</Text>
      </Item>
    </List>
  </Content>
</Drawer>
