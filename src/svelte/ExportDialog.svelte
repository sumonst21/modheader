<script>
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import Checkbox from "@smui/checkbox";
  import List, { Item, Separator, Text } from "@smui/list";
  import { createEventDispatcher } from "svelte";
  import { profiles, selectedProfile, commitChange } from "../js/datasource";

  const dispatch = createEventDispatcher();
  let dialog;
  let selectedProfiles = [];

  export function show() {
    selectedProfiles = [$selectedProfile];
    dialog.open();
  }

  $: exportedText = JSON.stringify(selectedProfiles);
</script>

<Dialog
  bind:this={dialog}
  class="export-dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content">
  <Title id="dialog-title">Export profile</Title>
  <Content id="dialog-content">
    <List checklist>
      {#each $profiles as profile}
        <Item>
          <Checkbox bind:group={selectedProfiles} value={profile} />
          {profile.title}
        </Item>
      {/each}
    </List>
    <textarea
      class="extra-large-textarea"
      rows="40"
      readonly
      value={exportedText} />
  </Content>
  <Actions>
    <Button action="all" on:click={() => (selectedProfiles = $profiles)}>
      <Label>Select all</Label>
    </Button>
    <Button>
      <Label>Close</Label>
    </Button>
  </Actions>
</Dialog>
