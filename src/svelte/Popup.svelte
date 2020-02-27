<script>
  import TopBar from "./TopBar.svelte";
  import Filters from "./Filters.svelte";
  import Headers from "./Headers.svelte";
  import UrlReplacements from "./UrlReplacements.svelte";
  import {
    selectedProfile,
    save,
    addHeader,
    removeHeader,
    addUrlReplacement,
    removeUrlReplacement,
    addFilter,
    removeFilter
  } from "../js/datasource";
  import {
    KNOWN_REQUEST_HEADERS,
    KNOWN_RESPONSE_HEADERS
  } from "../js/constants";
  import lodashClone from "lodash/clone";

  window.addEventListener("unload", () => {
    save();
  });

  let requestHeaders = selectedProfile.headers;
  let responseHeaders = selectedProfile.respHeaders;
  let filters = selectedProfile.filters;
  let urlReplacements = selectedProfile.urlReplacements;

  $: selectedProfile.headers = requestHeaders;
  $: selectedProfile.respHeaders = responseHeaders;
  $: selectedProfile.filters = filters;
  $: selectedProfile.urlReplacements = urlReplacements;
</script>

<style lang="scss">
  :global(html),
  :global(body) {
    height: 460px;
    /** Fix FF popup disappearance on long window. */
    width: 600px !important;
    position: relative !important;
    margin: 0;
  }

  :global(.extra-gap) {
    margin: 2px;
  }

  :global(.small-icon-button) {
    width: 32px;
    height: 32px;
    padding: 5px;
  }

  :global(.data-table) {
    border-color: #bbb;
    width: calc(100% - 4px);
  }

  :global(.data-table-row) {
    height: 20px;
    margin: 0;
    padding: 0;
    border-top-color: #eee;
  }

  :global(.data-table-cell) {
    padding-left: 5px;
    padding-right: 5px;
  }

  :global(.autocomplete-input) {
    border: none;
    border-bottom: 1px solid #ddd;
    height: 32px;
    width: 100%;
    background: none;
    margin: 0;
    outline: none;
    padding: 0;
  }

  :global(.hidden) {
    display: none !important;
  }

  .top-app-bar-container {
    height: 48px;
  }
</style>

<div class="top-app-bar-container">
  <TopBar profile={selectedProfile} />
</div>
<Headers
  headers={requestHeaders}
  class="extra-gap"
  title="Request headers"
  autocompleteNames={KNOWN_REQUEST_HEADERS}
  profile={selectedProfile}
  on:add={() => {
    addHeader(requestHeaders);
    requestHeaders = lodashClone(requestHeaders);
  }}
  on:remove={event => {
    removeHeader(requestHeaders, event.detail);
    requestHeaders = lodashClone(requestHeaders);
  }}
  on:refresh={event => (requestHeaders = event.detail)} />
<Headers
  headers={responseHeaders}
  class="extra-gap"
  title="Response headers"
  autocompleteNames={KNOWN_RESPONSE_HEADERS}
  profile={selectedProfile}
  on:add={() => {
    addHeader(responseHeaders);
    responseHeaders = lodashClone(responseHeaders);
  }}
  on:remove={event => {
    removeHeader(responseHeaders, event.detail);
    responseHeaders = lodashClone(responseHeaders);
  }}
  on:refresh={event => (responseHeaders = event.detail)} />
<Headers
  headers={urlReplacements}
  class="extra-gap"
  title="Redirect URLs"
  autocompleteNames={[]}
  profile={selectedProfile}
  on:add={() => {
    addUrlReplacement(urlReplacements);
    urlReplacements = lodashClone(urlReplacements);
  }}
  on:remove={event => {
    removeUrlReplacement(urlReplacements, event.detail);
    urlReplacements = lodashClone(urlReplacements);
  }}
  on:refresh={event => (urlReplacements = event.detail)} />
<Filters
  {filters}
  class="extra-gap"
  profile={selectedProfile}
  on:add={() => {
    addFilter(filters);
    filters = lodashClone(filters);
  }}
  on:remove={event => {
    removeFilter(filters, event.detail);
    filters = lodashClone(filters);
  }}
  on:refresh={event => (filters = event.detail)} />

<!-- <md-toolbar class="md-padding">
    <div class="md-toolbar-tools">
      <md-button
        class="md-icon-button"
        aria-label="Settings"
        ng-click="toggleSidenav()"
      >
        <md-icon md-svg-src="images/ic_menu_18px.svg"></md-icon>
      </md-button>
      <h2>
        <span>
          <md-input-container md-no-float>
            <input
              ng-model="dataSource.selectedProfile.title"
              type="text"
              placeholder="Profile name"
              class="profile-title"
            />
          </md-input-container>
        </span>
      </h2>
      <span flex></span>

      <md-button
        aria-label="Tab"
        ng-if="!dataSource.lockedTabId"
        ng-click="dataSource.lockToTab()"
      >
        <md-icon md-svg-src="images/ic_lock_18px.svg"></md-icon>
        Tab lock
      </md-button>

      <md-button
        aria-label="Tab"
        ng-if="dataSource.lockedTabId"
        ng-click="dataSource.unlockAllTab()"
      >
        <md-icon md-svg-src="images/ic_lock_open_18px.svg"></md-icon>
        Unlock
      </md-button>

      <md-button
        class="md-icon-button"
        aria-label="Pause"
        ng-if="!dataSource.isPaused"
        ng-click="dataSource.pause()"
      >
        <md-icon md-svg-src="images/ic_pause_18px.svg"></md-icon>
      </md-button>

      <md-button
        class="md-icon-button"
        aria-label="Play"
        ng-if="dataSource.isPaused"
        ng-click="dataSource.play()"
      >
        <md-icon md-svg-src="images/ic_play_arrow_18px.svg"></md-icon>
      </md-button>

      <md-menu>
        <md-button
          class="md-icon-button"
          aria-label="Add"
          ng-click="$mdMenu.open($event)"
        >
          <md-icon md-svg-src="images/ic_add_18px.svg"></md-icon>
        </md-button>
        <md-menu-content width="4">
          <md-menu-item>
            <md-button
              ng-click="dataSource.addHeader(dataSource.selectedProfile.headers)"
            >
              Request header
            </md-button>
          </md-menu-item>
          <md-menu-item>
            <md-button
              ng-click="dataSource.addHeader(dataSource.selectedProfile.respHeaders)"
            >
              Response header
            </md-button>
          </md-menu-item>
          <md-menu-item>
            <md-button
              ng-click="dataSource.addUrlReplacement(dataSource.selectedProfile.urlReplacements)"
            >
              Replace URL
            </md-button>
          </md-menu-item>
          <md-menu-item>
            <md-button
              ng-click="dataSource.addFilter(dataSource.selectedProfile.filters)"
            >
              Filter
            </md-button>
          </md-menu-item>
        </md-menu-content>
      </md-menu>

      <md-menu>
        <md-button
          class="md-icon-button"
          aria-label="More"
          ng-click="$mdMenu.open($event)"
        >
          <md-icon md-svg-src="images/ic_more_vert_18px.svg"></md-icon>
        </md-button>
        <md-menu-content width="4">
          <md-menu-item>
            <md-button
              ng-click="profileService.toggleComment(dataSource.selectedProfile)"
            >
              <md-icon
                md-svg-src="{{ dataSource.selectedProfile.hideComment ?
                  'images/ic_checkbox-blank-outline_24px.svg' : 'images/ic_check-box-outline_24px.svg' }}"
              ></md-icon>
              Toggle comment column
            </md-button>
          </md-menu-item>

          <md-menu-divider></md-menu-divider>
          <md-menu-item>
            <md-button
              ng-click="profileService.deleteProfile(dataSource.selectedProfile)"
            >
              <md-icon
                md-svg-src="images/ic_delete_black_24px.svg"
                md-menu-align-target
              ></md-icon>
              Delete profile
            </md-button>
          </md-menu-item>
          <md-menu-item>
            <md-button
              ng-click="profileService.cloneProfile(dataSource.selectedProfile)"
            >
              <md-icon
                md-svg-src="images/ic_content_copy_black_24px.svg"
              ></md-icon>
              Clone profile
            </md-button>
          </md-menu-item>
          <md-menu-item>
            <md-button
              ng-click="profileService.exportProfile($event, dataSource.selectedProfile)"
            >
              <md-icon md-svg-src="images/ic_file_download_24px.svg"></md-icon>
              Export profile
            </md-button>
          </md-menu-item>
          <md-menu-item>
            <md-button
              ng-click="profileService.importProfile($event, dataSource.selectedProfile)"
            >
              <md-icon md-svg-src="images/ic_file_upload_24px.svg"></md-icon>
              Import profile
            </md-button>
          </md-menu-item>

          <md-menu-divider></md-menu-divider>
          <md-subheader>Header override mode</md-subheader>
          <md-menu-item>
            <md-button
              ng-click="profileService.setAppendMode(dataSource.selectedProfile, false)"
            >
              <md-icon
                md-svg-src="{{ !dataSource.selectedProfile.appendMode || dataSource.selectedProfile.appendMode.length === 0 ?
                  'images/ic_radiobox-marked_24px.svg' : 'images/ic_radiobox-blank_24px.svg' }}"
              ></md-icon>
              Override existing value
            </md-button>
          </md-menu-item>
          <md-menu-item>
            <md-button
              ng-click="profileService.setAppendMode(dataSource.selectedProfile, true)"
            >
              <md-icon
                md-svg-src="{{ dataSource.selectedProfile.appendMode && dataSource.selectedProfile.appendMode !== 'comma' ?
                   'images/ic_radiobox-marked_24px.svg' : 'images/ic_radiobox-blank_24px.svg' }}"
              ></md-icon>
              Value concatenation
            </md-button>
          </md-menu-item>
          <md-menu-item>
            <md-button
              ng-click="profileService.setAppendMode(dataSource.selectedProfile, 'comma')"
            >
              <md-icon
                md-svg-src="{{ dataSource.selectedProfile.appendMode === 'comma' ?
                    'images/ic_radiobox-marked_24px.svg' : 'images/ic_radiobox-blank_24px.svg' }}"
              ></md-icon>
              Comma separated concatenation
            </md-button>
          </md-menu-item>
        </md-menu-content>
      </md-menu>
    </div>
    <div class="info-section" ng-if="dataSource.isPaused">
      ModHeader is paused
      <md-button aria-label="Play" ng-click="dataSource.play()">
        <md-icon md-svg-src="images/ic_play_arrow_18px.svg"></md-icon>
        Click to unpause
      </md-button>
    </div>
    <div
      class="info-section"
      ng-if="dataSource.lockedTabId && !dataSource.isPaused"
    >
      Tab lock is active
      <md-button aria-label="Tab" ng-click="dataSource.unlockAllTab()">
        <md-icon md-svg-src="images/ic_lock_open_18px.svg"></md-icon>
        Click to unlock tab
      </md-button>
    </div>
  </md-toolbar>
  <md-sidenav class="md-sidenav-left md-whiteframe-z2" md-component-id="left">
    <md-toolbar class="md-theme-indigo">
      <div class="md-toolbar-tools">
        <md-button
          class="md-icon-button"
          aria-label="Settings"
          ng-click="toggleSidenav()"
        >
          <md-icon md-svg-src="images/ic_arrow_back_18px.svg"></md-icon>
        </md-button>
      </div>
    </md-toolbar>
    <md-list>
      <md-list-item
        ng-repeat="profile in dataSource.profiles"
        ng-click="profileService.selectProfile(profile)"
      >
        <md-checkbox
          aria-label="{{profile.title}}"
          ng-checked="profile === dataSource.selectedProfile"
        >
        </md-checkbox>
        <p>{{profile.title}}</p>
      </md-list-item>
      <md-list-item ng-click="profileService.addProfile()">
        <md-icon md-svg-src="images/ic_add_18px.svg"></md-icon>
        <p>Add Profile</p>
      </md-list-item>
      <md-list-item ng-click="profileService.sortProfiles()">
        <md-icon md-svg-src="images/ic_sort_24px.svg"></md-icon>
        <p>Sort Profiles</p>
      </md-list-item>
      <md-list-item ng-click="profileService.importProfiles($event)">
        <md-icon md-svg-src="images/ic_file_upload_24px.svg"></md-icon>
        <p>Import Multiple Profiles</p>
      </md-list-item>
      <md-list-item ng-click="profileService.exportProfiles($event)">
        <md-icon md-svg-src="images/ic_file_download_24px.svg"></md-icon>
        <p>Export All Profiles</p>
      </md-list-item>
      <md-list-item ng-click="profileService.openCloudBackup($event)">
        <md-icon md-svg-src="images/ic_cloud_download_18px.svg"></md-icon>
        <p>Cloud backup</p>
      </md-list-item>
      <md-divider></md-divider>
      <md-list-item
        ng-click="openLink('https://www.paypal.com/pools/c/84aPpFIA0Z')"
      >
        <md-icon md-svg-src="images/ic_attach_money_18px.svg"></md-icon>
        <p>Donate</p>
      </md-list-item>
      <md-list-item ng-click="openLink('https://github.com/bewisse/modheader')">
        <md-icon md-svg-src="images/ic_code_18px.svg"></md-icon>
        <p>Source code</p>
      </md-list-item>
      <md-list-item ng-click="openLink('https://bewisse.com/modheader/help/')">
        <md-icon md-svg-src="images/ic_help_24px.svg"></md-icon>
        <p>Help</p>
      </md-list-item>
    </md-list>
  </md-sidenav>
  <md-content class="main-content" ng-class="{disabled: dataSource.isPaused}">

  </md-content> -->
