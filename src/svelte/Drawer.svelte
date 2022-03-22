<script>
  import Drawer, { Content } from '@smui/drawer';
  import Menu from '@smui/menu';
  import List, { Item, Text, Separator } from '@smui/list';
  import {
    mdiCheckboxBlankOutline,
    mdiCheckboxMarked,
    mdiClose,
    mdiHelpCircleOutline,
    mdiThumbUpOutline,
    mdiSortAscending,
    mdiSortDescending,
    mdiChevronLeft,
    mdiMenu,
    mdiFilePlus
  } from '@mdi/js';
  import { fade } from 'svelte/transition';
  import MdiIcon from './MdiIcon.svelte';
  import ProfileBadge from './ProfileBadge.svelte';
  import { showMessage } from '../js/toast';
  import { profiles } from '../js/datasource';
  import {
    addProfile,
    removeProfile,
    selectProfile,
    selectedProfile,
    updateProfile,
    sortProfiles
  } from '../js/profile';
  import { PRIMARY_COLOR } from '../js/constants';

  let drawer;
  let drawerOpen = true;
  let expand = false;
  let sortOrder = 'asc';
  let contextMenu;
  let selectedProfileIndex;

  function showMenu(event, { profileIndex }) {
    contextMenu.setOpen(false);
    setTimeout(() => {
      selectedProfileIndex = profileIndex;
      // TODO(hao): Figure out how to anchor the menu
      // contextMenu.setAnchorElement(event.target);
      contextMenu.setOpen(true);
    }, 0);
    event.preventDefault();
  }

  function openLink(url) {
    chrome.tabs.create({ url });
  }
</script>

<Drawer
  class="main-drawer {expand ? 'main-drawer-expand' : 'main-drawer-collapsed'}"
  variant="dismissible"
  bind:this={drawer}
  bind:open={drawerOpen}
>
  <Content class="main-drawer {expand ? 'main-drawer-expand' : 'main-drawer-collapsed'}">
    <List class="main-drawer-list">
      <Item
        class="main-drawer-item"
        title={expand ? 'Hide navigation' : 'Show navigation'}
        on:click={() => {
          expand = !expand;
        }}
      >
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={expand ? mdiChevronLeft : mdiMenu}
            color={PRIMARY_COLOR}
          />
        </span>
      </Item>
      <Separator nav />

      <div class="profiles-list">
        {#each $profiles as profile, profileIndex}
          <div
            on:contextmenu={(e) => {
              showMenu(e, { profile, profileIndex });
            }}
          >
            <Item
              class="main-drawer-item"
              title={profile.title}
              selected={$selectedProfile === profile}
              on:click={() => {
                selectProfile(profileIndex);
                expand = false;
              }}
            >
              <ProfileBadge {profile} />
              <Text class="main-drawer-item-text">{profile.title}</Text>
            </Item>
          </div>
        {/each}
        <Item
          class="main-drawer-item"
          title="Add profile"
          on:click={() => {
            addProfile();
            expand = false;
          }}
        >
          <span class="main-drawer-icon-container">
            <MdiIcon size="24" class="main-drawer-icon" icon={mdiFilePlus} color={PRIMARY_COLOR} />
          </span>
          <Text class="main-drawer-item-text">Add profile</Text>
        </Item>
        <Item
          class="main-drawer-item"
          title="Sort profiles"
          on:click={() => {
            sortProfiles(sortOrder);
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
          }}
        >
          <span class="main-drawer-icon-container">
            <MdiIcon
              size="24"
              class="main-drawer-icon"
              icon={sortOrder === 'asc' ? mdiSortAscending : mdiSortDescending}
              color={PRIMARY_COLOR}
            />
          </span>
          <Text class="main-drawer-item-text">Sort profiles</Text>
        </Item>
      </div>

      <Separator nav />
      <Item
        class="main-drawer-item"
        title="Rate us"
        on:click={() => openLink('https://modheader.com/review?browser=' + process.env.BROWSER)}
      >
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={mdiThumbUpOutline}
            color={PRIMARY_COLOR}
          />
        </span>
        <Text class="main-drawer-item-text">Rate us</Text>
      </Item>
      <Item
        class="main-drawer-item"
        title="Help"
        on:click={() => openLink('https://modheader.com/guide/')}
      >
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={mdiHelpCircleOutline}
            color={PRIMARY_COLOR}
          />
        </span>

        <Text class="main-drawer-item-text">Help</Text>
      </Item>
    </List>
  </Content>
</Drawer>

<Menu bind:this={contextMenu}>
  <List>
    <Item
      on:SMUI:action={() => {
        const profile = $profiles[selectedProfileIndex];
        const alwaysOn = !profile.alwaysOn;
        updateProfile({ alwaysOn }, selectedProfileIndex);
        if (alwaysOn) {
          showMessage(`${profile.title} will stay active even when it is not selected`);
        } else {
          showMessage(`${profile.title} will only be active when selected.`);
        }
      }}
    >
      <MdiIcon
        class="more-menu-icon"
        size="24"
        icon={($profiles[selectedProfileIndex] || {}).alwaysOn
          ? mdiCheckboxMarked
          : mdiCheckboxBlankOutline}
        color="#666"
      />
      <Text>Always stay on</Text>
    </Item>
    <Item
      on:SMUI:action={() => {
        contextMenu.setOpen(false);
        removeProfile(selectedProfileIndex);
      }}
    >
      <MdiIcon class="more-menu-icon" size="24" icon={mdiClose} color="red" />
      <Text>Delete profile</Text>
    </Item>
  </List>
</Menu>

{#if expand}
  <div class="scrim" transition:fade={{ duration: 200 }} on:click={() => (expand = false)} />
{/if}
