<script>
  import Button from '@smui/button';
  import Menu from '@smui/menu';
  import List, { Item } from '@smui/list';
  import { createEventDispatcher } from 'svelte';
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
  <Button
    name="resource-type"
    class="resource-type-menu-button"
    on:click={() => resourceTypeMenu.setOpen(true)}
  >
    {resourceType && resourceType.length > 0
      ? resourceType.map((rt) => KNOWN_RESOURCE_TYPES[rt]).join(', ')
      : 'Select resource'}
  </Button>
  <Menu bind:this={resourceTypeMenu}>
    <List>
      {#each Object.entries(KNOWN_RESOURCE_TYPES) as [value, label]}
        <Item
          data-resource-type={value}
          on:SMUI:action={() => {
            if (resourceType.includes(value)) {
              resourceType = lodashWithout(resourceType, value);
            } else {
              resourceType = resourceType.concat([value]);
            }
            dispatch('change');
          }}
          activated={resourceType.includes(value)}
        >
          {label}
        </Item>
      {/each}
    </List>
  </Menu>
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
