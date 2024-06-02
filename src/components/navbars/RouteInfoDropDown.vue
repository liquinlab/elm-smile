<script setup>
import { computed } from 'vue'
import useSmileAPI from '@/core/composables/useSmileAPI'
import RouteJumper from '@/components/navbars/RouteJumper.vue'

const api = useSmileAPI()

const buttonstyle = computed(() => {
  let base = 'button is-small is-route is-jump-bar has-tooltip-arrow has-tooltip-bottom'
  if (api.dev.route_panel.visible) {
    return base + ' is-selected'
  } else {
    return base
  }
})
</script>

<template>
  <div class="field has-addons">
    <p class="control">
      <button
        class="button is-small is-jump-bar has-tooltip-arrow has-tooltip-bottom"
        data-tooltip="Current trial counter"
        :disabled="api.dev.page_provides_trial_stepper == false"
      >
        <span class="counter">{{ api.getPageTracker(api.currentRouteName()) }}</span>
      </button>
    </p>

    <p class="control" v-if="api.hasAutofill()">
      <button
        class="button is-small is-jump-bar has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.autofill()"
        data-tooltip="Autofill Form"
      >
        <span>
          <FAIcon icon="fa-solid fa-pen-to-square" />
        </span>
      </button>
    </p>
    <div class="dropdown is-hoverable is-right" :class="{ 'is-active': api.dev.route_panel.visible }">
      <div class="dropdown-trigger">
        <p class="control is-route">
          <button :class="buttonstyle" @click="api.dev.route_panel.visible = !api.dev.route_panel.visible">
            <div class="routelabel">/{{ api.currentRouteName() }}</div>
          </button>
        </p>
      </div>
      <div class="dropdown-menu pt-0 mt-0" id="dropdown-menu" role="menu">
        <RouteJumper :routeName="api.currentRouteName()"></RouteJumper>
      </div>
    </div>
  </div>
</template>

<style scoped>
.is-route {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.counter {
  font-size: 0.9em;
  padding-top: 2px;
}
.dropdown {
  margin-top: 0;
}
.is-selected {
  background-color: rgb(211, 251, 222);
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
