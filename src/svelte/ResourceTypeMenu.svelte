<script>
  import Button from '@smui/button';
  import MenuSurface from '@smui/menu-surface';
  import { createEventDispatcher } from 'svelte';
  import Chip from './Chip.svelte';
  import lodashWithout from 'lodash/without.js';

  const KNOWN_RESOURCE_TYPES = {
    main_frame: 'Main Frame',
    sub_frame: 'Sub Frame',
    stylesheet: 'Stylesheet',
    image: 'Image',
    font: 'Font',
    object: 'Object',
    xmlhttprequest: 'XmlHttpRequest',
    ping: 'Ping',
    csp_report: 'CSP Report',
    media: 'Media',
    websocket: 'Web Socket',
    other: 'Other'
  };
  const dispatch = createEventDispatcher();
  let resourceTypeMenu;
  export let resourceType;
</script>

<div class="resource-type-menu-cell data-table-cell flex-grow">
  {#each resourceType as value}
    <Chip
      on:close={() => {
        resourceType = lodashWithout(resourceType, value);
        dispatch('change');
      }}
    >
      {KNOWN_RESOURCE_TYPES[value]}
    </Chip>
  {/each}
  <Button
    name="resource-type"
    class="resource-type-menu-button"
    on:click={() => resourceTypeMenu.setOpen(true)}
  >
    Select resource type
  </Button>
  <MenuSurface bind:this={resourceTypeMenu}>
    <div>
      {#each Object.entries(KNOWN_RESOURCE_TYPES).filter(([value]) => !resourceType.includes(value)) as [value, label]}
        <Button
          data-resource-type={value}
          variant="raised"
          class="chip-button"
          on:click={() => {
            resourceType = resourceType.concat([value]);
            resourceTypeMenu.setOpen(false);
            dispatch('change');
          }}
        >
          {label}
        </Button>
      {/each}
    </div>
  </MenuSurface>
</div>

<style module>
  .resource-type-menu-button {
    display: inline;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 28px;
    margin: 0 2px;
  }

  .resource-type-menu-cell {
    flex-basis: 200px;
  }
</style>
