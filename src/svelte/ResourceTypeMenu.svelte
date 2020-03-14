<script>
  import Button, { Label } from "@smui/button";
  import Menu from "@smui/menu";
  import List, { Item } from "@smui/list";
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
  let resourceTypeMenu;
  export let resourceType;
</script>

<style scoped>
  :global(.resource-type-menu-button) {
    display: inline;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 240px;
  }
</style>

<Button
  class="resource-type-menu-button"
  on:click={e => {
    resourceTypeMenu.setFixedPosition(true);
    const rect = e.target.getBoundingClientRect();
    resourceTypeMenu.setAbsolutePosition(rect.left + window.scrollX, e.target.offsetParent.offsetTop + rect.top + window.scrollY);
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
        }}
        activated={resourceType.includes(value)}>
        {label}
      </Item>
    {/each}
  </List>
</Menu>
