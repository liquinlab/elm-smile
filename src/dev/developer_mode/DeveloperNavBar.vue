<script setup>
import { onMounted, watch, ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import DocsDropDown from '@/dev/developer_mode/DocsDropDown.vue'
import Stepper from '@/dev/developer_mode/Stepper.vue'
import RouteInfoDropDrop from '@/dev/developer_mode/RouteInfoDropDown.vue'
import ResetButton from '@/dev/developer_mode/ResetButton.vue'
import DataBarButton from '@/dev/developer_mode/DataBarButton.vue'
import ViewButton from '@/dev/developer_mode/ViewButton.vue'

import useAPI from '@/core/composables/useAPI'
const api = useAPI()
</script>

<template>
  <nav class="devbar">
    <div class="devbar-brand">
      <div class="devbar-title">
        <div class="devbar-fulltitle">👩‍💻&nbsp;<b>DEVELOPER MODE</b></div>
        <div class="devbar-subtitle">👩‍💻&nbsp;<b>DEV MODE</b></div>
      </div>
    </div>

    <div class="devbar-menu">
      <div class="devbar-start">
        <div class="devmode">
          <DocsDropDown></DocsDropDown>
        </div>
      </div>

      <div class="devbar-end">
        <div class="devbar-item devbar-buttonpanel">
          <div class="buttons">
            <!-- reset button -->
            <div class="devbar-resetbutton">
              <ResetButton></ResetButton>
            </div>

            <!-- database info button -->
            <DataBarButton></DataBarButton>
            <!-- responsive hides this if the page is too small-->
            <div class="devbar-stepper">
              <Stepper></Stepper>
            </div>
            <!-- route info buttons -->
            <div class="devbar-routeinfodropdown">
              <RouteInfoDropDrop></RouteInfoDropDrop>
            </div>

            <!-- view button -->
            <ViewButton></ViewButton>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style>
.devbar {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  position: relative;
  z-index: 1000;
}
.devbar-fulltitle {
  padding-top: 0px;
  font-size: 0.92em;
}

.devbar-subtitle {
  padding-top: 0px;
  padding-right: 20px;
  display: none;
  white-space: nowrap;
  font-size: 0.92em;
}

.devbar-menu {
  flex-grow: 1;
  flex-shrink: 0;
  align-items: stretch;
  display: flex;
  z-index: 999;
}

.devbar {
  font-size: 13px;
  background: var(--dev-bar-light-grey); /*rgb(63, 160, 149);*/
  color: var(--dev-bar-text);
  border-bottom: var(--dev-bar-lines);
  min-height: 32px;
  max-height: 32px;
}

.devbar-start {
  justify-content: flex-start;
  margin-inline-end: auto;
  display: flex;
  align-items: stretch;
  flex-shrink: 3;
}

@media screen and (max-width: 830px) {
  .devbar-start {
    display: none;
  }
}

.devbar-title {
  padding-top: 8px;
  font-weight: 500;
  padding-left: 10px;
}

.devbar-end {
  justify-content: flex-end;
  margin-inline-start: auto;
  display: flex;
  align-items: stretch;
}

.devbar-item {
  align-items: center;
  display: flex;
}

.devbar-buttonpanel {
  padding-top: 0px;
  padding-left: 10px;
  padding-right: 10px;
  border-left: var(--dev-bar-lines);
  background-color: var(--dev-bar-mild-grey); /*rgb(63, 160, 149);*/
}

.devbar-button {
  font-size: 0.65rem;
  height: 2em;
}

@media screen and (max-width: 725px) {
  .devbar-fulltitle {
    display: none;
  }
  .devbar-buttonpanel {
    border-left: none;
    background-color: #eeeeee; /*rgb(63, 160, 149);*/
  }
  .devbar {
    border-left: 0.01em solid #b5b5b5;
    background-color: #eeeeee; /*rgb(63, 160, 149);*/
  }
  .devbar-subtitle {
    display: inline;
  }
  .devbar-stepper {
    display: none;
  }
}

@media screen and (max-width: 520px) {
  .devbar-randomizationdropdown {
    display: none;
  }
}

@media screen and (max-width: 474px) {
  .devbar-routeinfodropdown {
    display: none;
  }
}
</style>

<style scoped>
a:hover {
  color: #10dffa;
}

.jumper {
  padding-top: 4px;
  background-color: #dddddd;
}

.navbar {
  font-size: 13px;
  background: #f7f7f7; /*rgb(63, 160, 149);*/
  color: #000;
  border-bottom: 0.01em solid #b5b5b5;
  height: 0px;
  padding: 0px;
  padding-left: 10px;
  margin: 0px;
  min-height: 32px;
  text-align: center;
}

.field {
  margin: 0px;
  margin-top: 3px;
}
.is-jump-bar {
  font-size: 0.65rem;
  height: 2em;
  margin: 0px;
}

.devmode-title {
  padding-top: 8px;
  font-weight: 500;
  padding-left: 10px;
}

.devmode {
  padding-top: 8px;
  font-weight: 400;
  padding-left: 10px;
}

.mainstate {
  padding-top: 8px;
  border-left: 0.01em solid #b5b5b5;
  background-color: #eeeeee; /*rgb(63, 160, 149);*/
}
</style>
