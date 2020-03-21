<script>
  export let profile;
</script>

<style scoped>
  .profile-badge-icon-container {
    color: white;
    font-size: 16px;
    border: 2px solid white;
    border-radius: 25px;
    margin: 10px 6px;
  }

  .profile-badge-icon-text {
    width: 24px;
    height: 24px;
    margin: 10px 7px;
  }
</style>

<span class="profile-badge-icon-container" style="background: {profile.color}">
  <span class="profile-badge-icon-text">{profile.shortTitle}</span>
</span>
