<script>
  import List, { Item, Text } from '@smui/list';
  import Button, { Label } from '@smui/button';
  import IconButton from '@smui/icon-button';
  import lodashOrderBy from 'lodash/orderBy.js';
  import lodashIsNumber from 'lodash/isNumber.js';
  import lodashIsNaN from 'lodash/isNaN.js';
  import { mdiTrashCanOutline, mdiCancel } from '@mdi/js';
  import BaseDialog from './BaseDialog.svelte';
  import { DISABLED_COLOR, PRIMARY_COLOR } from '../js/constants.js';
  import { restoreToProfiles } from '../js/profile.js';
  import { dialog, storage, MdiIcon } from '@modheader/core';

  const { showCloudBackupDialog } = dialog;

  let cloudBackupList = [];

  async function show() {
    const items = (await storage.getSync()) || {};
    let savedData = [];
    for (const key in items) {
      try {
        const timeInMs = Number(key);
        if (!lodashIsNumber(timeInMs) || lodashIsNaN(timeInMs)) {
          continue;
        }
        const profiles = items[key];
        savedData.push({
          key,
          timeInMs,
          profiles
        });
      } catch (e) {
        // skip invalid profile.
      }
    }
    cloudBackupList = lodashOrderBy(savedData, ['timeInMs'], ['desc']);
  }

  showCloudBackupDialog.subscribe(async (open) => {
    if (!open) {
      return;
    }
    await show();
  });

  function formatEntry(entry) {
    let response = new Date(entry.timeInMs).toLocaleString();
    response += ' - ';
    if (entry.profiles.length <= 3) {
      response += entry.profiles.map((p) => p.title).join(', ');
    } else {
      response += entry.profiles
        .slice(0, 2)
        .map((p) => p.title)
        .join(', ');
      response += `, + ${entry.profiles.length - 2} more`;
    }
    return response;
  }

  function restoreEntry(entry) {
    restoreToProfiles(entry.profiles);
    done();
  }

  function done() {
    showCloudBackupDialog.set(false);
  }

  function deleteEntry(entry) {
    chrome.storage.sync.remove(entry.key, show);
  }

  function deleteAllBackup() {
    chrome.storage.sync.remove(
      cloudBackupList.map((entry) => entry.key),
      show
    );
  }
</script>

{#if $showCloudBackupDialog}
  <BaseDialog bind:open={$showCloudBackupDialog} title="Cloud backup">
    {#if cloudBackupList.length > 0}
      <List>
        {#each cloudBackupList as entry}
          <Item on:SMUI:action={() => restoreEntry(entry)}>
            <Text class="entry-label">{formatEntry(entry)}</Text>
            <IconButton
              dense
              aria-label="Delete"
              class="small-icon-button delete-entry-icon"
              on:click={() => deleteEntry(entry)}
            >
              <MdiIcon size="24" icon={mdiTrashCanOutline} color="red" />
            </IconButton>
          </Item>
        {/each}
      </List>
    {:else}
      <div class="missing-backup-info">No cloud backup available</div>
    {/if}
    <svelte:fragment slot="footer">
      <Button disabled={cloudBackupList.length === 0} on:click={() => deleteAllBackup()}>
        <MdiIcon
          size="24"
          icon={mdiTrashCanOutline}
          color={cloudBackupList.length === 0 ? DISABLED_COLOR : 'red'}
        />
        <Label class="ml-small">Delete all backup</Label>
      </Button>
      <Button on:click={() => done()}>
        <MdiIcon size="24" icon={mdiCancel} color={PRIMARY_COLOR} />
        <Label class="ml-small">Cancel</Label>
      </Button>
    </svelte:fragment>
  </BaseDialog>
{/if}

<style module>
  .entry-label {
    width: 390px;
  }

  .delete-entry-icon {
    float: right;
  }

  .missing-backup-info {
    margin: 10px 24px;
  }
</style>
