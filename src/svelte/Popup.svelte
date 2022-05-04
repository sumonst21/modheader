<script>
  import App from './App.svelte';
</script>

<App />

<style module>
  body {
    height: 530px;
    /** Fix FF popup disappearance on long window. */
    width: 620px !important;
  }

  :root {
    --app-content-width: 580px;
    --top-bar-width: 585px;
    --profiles-list-min-height: 390px;
  }
</style>
