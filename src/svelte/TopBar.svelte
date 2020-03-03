<script>
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import MdiIcon from "./MdiIcon.svelte";
  import { createEventDispatcher } from "svelte";
  import { mdiTrashCan } from "@mdi/js";

  const dispatch = createEventDispatcher();
  export let profile;
  let colorPicker;

  function refreshProfile() {
    dispatch("refresh");
  }

  function deleteProfile() {
    dispatch("remove", profile);
  }
</script>

<style scoped>
  .profile-title {
    border: none;
    background: none;
    color: #fff;
    margin: 0 10px;
    font-size: 1.5em;
    outline: none;
    padding: 0;
  }

  .color-picker {
    background: none;
    height: 18px;
    margin: 0;
    padding: 0;
    width: 18px;
    -webkit-appearance: none;
    border: #fff 3px solid;
    border-radius: 5px;
  }

  .color-picker:focus {
    outline: none;
  }

  .color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
    outline: 0;
  }
  .color-picker::-webkit-color-swatch {
    border: none;
  }
</style>

<TopAppBar variant dense style="background-color: {profile.color};">
  <Row>
    <Section toolbar>
      <input
        class="mdc-text-field__input profile-title"
        bind:value={profile.title}
        on:input={() => refreshProfile()} />
    </Section>
    <Section align="end" toolbar />
    <IconButton dense on:click={() => deleteProfile()} title="Delete profile">
      <MdiIcon size="24" icon={mdiTrashCan} color="white" />
    </IconButton>
    <IconButton
      dense
      on:click={() => colorPicker.click()}
      title="Change profile color">
      <input
        bind:this={colorPicker}
        class="color-picker"
        type="color"
        bind:value={profile.color}
        on:change={() => refreshProfile()} />
    </IconButton>
  </Row>
</TopAppBar>
