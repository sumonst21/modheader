<script>
  import Button from '@smui/button';
  import MenuSurface from '@smui/menu-surface';
  import { createEventDispatcher } from 'svelte';
  import { Chip } from '@modheader/core';
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

<div class="resource-type-menu-cell data-table-cell flex-grow inline-filter-row">
  {#each resourceType as value}
    <Chip
      fieldName={resourceType}
      trailingAction="close"
      on:close={() => {
        resourceType = lodashWithout(resourceType, value);
        dispatch('change');
      }}
    >
      {KNOWN_RESOURCE_TYPES[value]}
    </Chip>
  {/each}
  <Chip
    fieldName="resource-type"
    on:click={() => resourceTypeMenu.setOpen(true)}
    trailingAction="dropdown"
  >
    Resource type
  </Chip>
  <MenuSurface bind:this={resourceTypeMenu} anchorCorner="BOTTOM_LEFT">
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
  .resource-type-menu-cell {
    min-width: 300px;
    flex-wrap: wrap;
  }
</style>
