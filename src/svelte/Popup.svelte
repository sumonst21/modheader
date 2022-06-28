<script>
  import App from './App.svelte';
</script>

<App />

<style module>
  body {
    height: 500px;
    /** Fix FF popup disappearance on long window. */
    width: 620px !important;
  }

  :root {
    --drawer-width: 36px;
    --app-content-width: 580px;
    --top-bar-width: 585px;
    --profiles-list-min-height: 360px;
  }
</style>
