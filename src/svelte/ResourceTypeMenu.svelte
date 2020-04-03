<script>
  import Button, { Label } from "@smui/button";
  import Menu from "@smui/menu";
  import List, { Item } from "@smui/list";
  import { createEventDispatcher } from "svelte";
  import lodashWithout from "lodash/without";

  const KNOWN_RESOURCE_TYPES = {
    main_frame: "Main Frame",
    sub_frame: "Sub Frame",
    stylesheet: "Stylesheet",
    image: "Image",
    object: "Object",
    xmlhttprequest: "XmlHttpRequest",
    other: "Other"
  };
  const dispatch = createEventDispatcher();
  let resourceTypeMenu;
  export let resourceType;
</script>

<style scoped>
  :global(.resource-type-menu-button) {
    display: inline;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 220px;
    height: 28px;
    margin: 0 2px;
  }

  :global(.resource-type-menu-cell) {
    flex-basis: 200px;
  }
</style>

<div class="resource-type-menu-cell data-table-cell flex-grow">
  <Button
    class="resource-type-menu-button"
    on:click={e => {
      resourceTypeMenu.setOpen(true);
    }}>
    {resourceType && resourceType.length > 0 ? resourceType
          .map(rt => KNOWN_RESOURCE_TYPES[rt])
          .join(', ') : 'Select Resource Type'}
  </Button>
  <Menu bind:this={resourceTypeMenu}>
    <List>
      {#each Object.entries(KNOWN_RESOURCE_TYPES) as [value, label]}
        <Item
          on:SMUI:action={() => {
            if (resourceType.includes(value)) {
              resourceType = lodashWithout(resourceType, value);
            } else {
              resourceType = resourceType.concat([value]);
            }
            dispatch('change');
          }}
          activated={resourceType.includes(value)}>
          {label}
        </Item>
      {/each}
    </List>
  </Menu>
</div>