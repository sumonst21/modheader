<script>
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import MdiIcon from "./MdiIcon.svelte";
  import { mdiMenu } from "@mdi/js";

  export let profile;
</script>

<style scoped>
  .profile-title {
    border: none;
    background: none;
    color: #fff;
    margin: 0;
    font-size: 1.5em;
    outline: none;
    padding: 0;
  }
</style>

<TopAppBar variant dense color="primary">
  <Row>
    <Section toolbar>
      <IconButton aria-label="Menu">
        <MdiIcon size="48" icon={mdiMenu} color="white" />
      </IconButton>

      <input
        class="mdc-text-field__input profile-title"
        bind:value={profile.title} />
    </Section>
    <Section align="end" toolbar />
  </Row>
</TopAppBar>
