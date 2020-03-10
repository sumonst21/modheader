<script>
  import { AppContent, Scrim } from "@smui/drawer";
  import TopBar from "./TopBar.svelte";
  import Drawer from "./Drawer.svelte";
  import Filters from "./Filters.svelte";
  import Headers from "./Headers.svelte";
  import {
    selectedProfile,
    isPaused,
    save,
    addHeader,
    removeHeader,
    addUrlReplacement,
    removeUrlReplacement,
    commitChange
  } from "../js/datasource";
  import {
    KNOWN_REQUEST_HEADERS,
    KNOWN_RESPONSE_HEADERS
  } from "../js/constants";
  import lodashClone from "lodash/clone";

  window.addEventListener("unload", () => {
    save();
  });
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

  :global(.data-table-title) {
    height: 20px;
    margin: 0;
    padding: 0;
    width: 120px;
  }

  :global(.data-table-row) {
    height: 20px;
    margin: 0;
    padding: 0;
    border-top-color: #eee;
  }

  :global(.data-table-cell) {
    padding-left: 2px;
    padding-right: 2px;
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

  :global(.app-content) {
    margin-left: 0 !important;
    position: absolute;
    left: 36px;
  }

  :global(.disabled) {
    opacity: 0.5;
    pointer-events: none;
  }

  .top-app-bar-container {
    height: 48px;
  }
</style>

<Drawer />

<AppContent class="app-content">
  <div class="top-app-bar-container">
    <TopBar />
  </div>
  <div class={$isPaused ? 'disabled' : ''}>
    <Headers
      headers={$selectedProfile.headers}
      class="extra-gap"
      title="Request headers"
      autocompleteNames={KNOWN_REQUEST_HEADERS}
      on:add={() => {
        addHeader($selectedProfile.headers);
        commitChange({ headers: $selectedProfile.headers });
      }}
      on:remove={event => {
        removeHeader($selectedProfile.headers, event.detail);
        commitChange({ headers: $selectedProfile.headers });
      }}
      on:refresh={event => {
        commitChange({ headers: event.detail });
      }} />
    <Headers
      headers={$selectedProfile.respHeaders}
      class="extra-gap"
      title="Response headers"
      autocompleteNames={KNOWN_RESPONSE_HEADERS}
      profile={selectedProfile}
      on:add={() => {
        addHeader($selectedProfile.respHeaders);
        commitChange({ respHeaders: $selectedProfile.respHeaders });
      }}
      on:remove={event => {
        removeHeader($selectedProfile.respHeaders, event.detail);
        commitChange({ respHeaders: $selectedProfile.respHeaders });
      }}
      on:refresh={event => {
        commitChange({ respHeaders: event.detail });
      }} />
    <Headers
      headers={$selectedProfile.urlReplacements}
      class="extra-gap"
      title="Redirect URLs"
      autocompleteNames={[]}
      profile={$selectedProfile}
      on:add={() => {
        addHeader($selectedProfile.urlReplacements);
        commitChange({ urlReplacements: $selectedProfile.urlReplacements });
      }}
      on:remove={event => {
        removeHeader($selectedProfile.urlReplacements, event.detail);
        commitChange({ urlReplacements: $selectedProfile.urlReplacements });
      }}
      on:refresh={event => {
        commitChange({ urlReplacements: event.detail });
      }} />
    <Filters class="extra-gap" />
  </div>
</AppContent>
<!-- <md-toolbar class="md-padding">
    <div class="md-toolbar-tools">
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
  </md-toolbar>
  <md-sidenav class="md-sidenav-left md-whiteframe-z2" md-component-id="left">
    <md-list>
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
    </md-list>
  </md-sidenav> -->
