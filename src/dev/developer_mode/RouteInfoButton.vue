<script setup>
import { computed } from 'vue'
import useAPI from '@/core/composables/useAPI'
import RouteJumper from '@/dev/developer_mode/RouteJumper.vue'

const api = useAPI()

const buttonstyle = computed(() => {
  let base = 'button is-small is-route is-jump-bar has-tooltip-arrow has-tooltip-bottom'
  if (api.store.dev.routePanel.visible) {
    return base + ' is-selected'
  } else if (api.store.dev.pinnedRoute !== null) {
    return base + ' pinned'
  } else {
    return base
  }
})

const toggleRoutePanel = () => {
  if (api.store.dev.pinnedRoute == null) {
    api.store.dev.routePanel.visible = !api.store.dev.routePanel.visible
  }
}

const togglePin = () => {
  api.store.dev.pinnedRoute = api.store.dev.pinnedRoute === null ? api.currentRouteName() : null
  api.store.dev.routePanel.visible = false
}
</script>

<template>
  <div class="field has-addons">
    <p class="control">
      <button
        class="button is-small is-jump-bar has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.autofill()"
        :data-tooltip="api.hasAutofill() ? 'Autofill Form' : 'No form to autofill'"
        :disabled="!api.hasAutofill()"
      >
        <span>
          <FAIcon icon="fa-solid fa-pen-to-square" />
        </span>
      </button>
    </p>

    <p class="control" v-if="api.hasPrevView()">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.goToView(api.route?.meta?.prev)"
        data-tooltip="Previous page"
      >
        <span>
          <FAIcon icon="fa-solid fa-angles-left" />
        </span>
      </button>
    </p>
    <p class="control" v-else>
      <button class="button is-small devbar-button" disabled>
        <span>
          <FAIcon icon="fa-solid fa-angles-left" />
        </span>
      </button>
    </p>

    <p class="control" v-if="api.hasNextView()">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.goNextView()"
        data-tooltip="Step page forward"
      >
        <span>
          <FAIcon icon="fa-solid fa-angles-right" />
        </span>
      </button>
    </p>
    <p class="control" v-else>
      <button class="button is-small devbar-button" disabled>
        <span>
          <FAIcon icon="fa-solid fa-angles-right" />
        </span>
      </button>
    </p>
    <p class="control" v-if="api.store.config.mode === 'development'">
      <button
        class="button is-small is-jump-bar has-tooltip-arrow has-tooltip-bottom"
        :class="{ pinned: api.store.dev.pinnedRoute !== null }"
        v-on:click="togglePin()"
        data-tooltip="Pin current route"
      >
        <span>
          <FAIcon icon="fa-solid fa-thumbtack" />
        </span>
      </button>
    </p>
    <div class="dropdown is-hoverable is-right" :class="{ 'is-active': api.store.dev.routePanel.visible }">
      <div class="dropdown-trigger">
        <p class="control is-route">
          <button :class="buttonstyle" @click="toggleRoutePanel()">
            <div class="routelabel">/{{ api.currentRouteName() }}</div>
          </button>
        </p>
      </div>
      <div class="dropdown-menu pt-0 mt-0" id="dropdown-menu" role="menu" v-if="api.store.dev.pinnedRoute === null">
        <RouteJumper :routeName="api.currentRouteName()"></RouteJumper>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pinned {
  background-color: #ffdd57;
}
.is-route {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.dropdown {
  margin-top: 0;
}
.is-selected {
  background-color: rgb(219, 219, 219);
}
.is-jump-bar {
  font-size: 0.65rem;
  height: 2em;
  margin: 0px;
}
.routelabel {
  min-width: 100px;
  font-weight: 1000;
  font-family: 'Courier New', Courier, monospace;
}
</style>
