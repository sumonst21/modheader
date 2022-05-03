<script>
  import App from './App.svelte';
</script>

<App />

<style module>
  body {
    height: 100%;
    width: 100%;
  }

  :root {
    --app-content-width: calc(100% - 40px);
    --top-bar-width: calc(100% - 35px);
    --profiles-list-min-height: inherit;
  }
</style>
