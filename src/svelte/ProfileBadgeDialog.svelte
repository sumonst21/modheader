<script>
  import ColorPicker from './svelte-picker';
  import Dialog, { Title, Content } from '@smui/dialog';
  import Tab, { Label as TabLabel } from '@smui/tab';
  import Button, { Label } from '@smui/button';
  import TabBar from '@smui/tab-bar';
  import IconButton from '@smui/icon-button';
  import { mdiContentSave, mdiClose } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import { PRIMARY_COLOR } from '../js/constants';
  import { selectedProfile, commitChange } from '../js/datasource';

  const TABS = [
    { label: 'Background', value: 'backgroundColor' },
    { label: 'Text Color', value: 'textColor' }
  ];
  let dialogVisible;
  let shortTitle;
  let backgroundColor;
  let textColor;
  let shortTitleTextfield;
  let activeTab = TABS[0];

  export function show() {
    backgroundColor = $selectedProfile.backgroundColor;
    textColor = $selectedProfile.textColor;
    shortTitle = $selectedProfile.shortTitle;
    dialogVisible = true;
    shortTitleTextfield.focus();
  }
</script>

<Dialog
  bind:open={dialogVisible}
  class="profile-badge-dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
>
  <Title id="dialog-title">
    Profile badge
    <IconButton
      aria-label="Close"
      class="dialog-close-button"
      on:click={() => (dialogVisible = false)}
    >
      <MdiIcon size="32" icon={mdiClose} color="#888" />
    </IconButton>
  </Title>
  <Content id="dialog-content">
    <div>
      Change badge text:
      <span class="profile-badge-preview" style="background: {backgroundColor}">
        <input
          class="profile-badge-preview-text"
          bind:this={shortTitleTextfield}
          bind:value={shortTitle}
          style="color: {textColor}"
          type="text"
          maxlength="1"
        />
      </span>
    </div>

    <TabBar tabs={TABS} let:tab bind:active={activeTab}>
      <Tab {tab}>
        <TabLabel>{tab.label}</TabLabel>
      </Tab>
    </TabBar>
    <div class="color-picker-container">
      {#if activeTab.value === 'backgroundColor'}
        <ColorPicker
          startColor={$selectedProfile.backgroundColor}
          on:colorchange={(event) => {
            const rgbString = event.detail.hex;
            if (rgbString !== backgroundColor) {
              backgroundColor = rgbString;
            }
          }}
        />
      {:else}
        <ColorPicker
          startColor={$selectedProfile.textColor}
          on:colorchange={(event) => {
            const rgbString = event.detail.hex;
            if (rgbString !== textColor) {
              textColor = rgbString;
            }
          }}
        />
      {/if}
    </div>
  </Content>
  <div class="mdc-dialog__actions">
    <Button on:click={() => (dialogVisible = false)}>
      <MdiIcon size="24" icon={mdiClose} color={PRIMARY_COLOR} />
      <Label class="ml-small">Cancel</Label>
    </Button>
    <Button
      on:click={() => {
        commitChange({
          shortTitle,
          backgroundColor,
          textColor
        });
        dialogVisible = false;
      }}
    >
      <MdiIcon size="24" icon={mdiContentSave} color={PRIMARY_COLOR} />
      <Label class="ml-small">Save</Label>
    </Button>
  </div>
</Dialog>

