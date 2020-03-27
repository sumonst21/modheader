<script>
  export let profile;
</script>

<style scoped>
  .profile-badge-icon-container {
    color: white;
    font-size: 16px;
    border: 2px solid white;
    border-radius: 50%;
    margin: 10px 6px;
    width: 24px;
    min-width: 24px;
    height: 24px;
  }

  .profile-badge-icon-text {
    margin-top: 1px;
    width: 24px;
    display: flex;
    justify-content: center;
  }
</style>

<span class="profile-badge-icon-container" style="background: {profile.backgroundColor}">
  <span class="profile-badge-icon-text" style="color: {profile.textColor}">{profile.shortTitle}</span>
</span>
