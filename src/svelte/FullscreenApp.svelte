<script>
  import App from './App.svelte';
</script>

<App isFullscreen={true} />

<style module>
  body {
    height: 100%;
    width: 100%;
  }

  :root {
    --drawer-width: 256px;
    --app-content-width: calc(100% - 260px);
    --top-bar-width: calc(100% - 255px);
    --profiles-list-min-height: inherit;
  }
</style>
