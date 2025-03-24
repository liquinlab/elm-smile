<script setup>
import useAPI from '@/core/composables/useAPI'
import StateTreeViewer from '@/dev/developer_mode/StateTreeViewer.vue'
import { computed } from 'vue'

const api = useAPI()

const stepper = api.useHStepper()

const trials = stepper
  .t()
  .append([
    { type: 'trial', id: 1 },
    { type: 'trial', id: 2 },
  ])
  .forEach((trial) => {
    let index = 0
    trial
      .append([
        { type: 'step', id: index++ },
        { type: 'step', id: index++ },
      ])
      .forEach((step) => {
        for (let i = 0; i < 5; i++) {
          step.append([{ type: 'step', id: i }])
        }
      })
  })
  .push()

//stepper.push(trials)
stepper.reset()

function next() {
  if (this.stepper.next() == null) {
    api.goNextView()
  }
}

function adddata() {
  const trials = stepper.t().append([{ type: 'added', id: 100 }])
  stepper.push(trials, true)
}
</script>

<template>
  <div>
    <h1 class="title">Stepper Test</h1>
    <div class="tree-diagram-text">
      <b>Path String</b>: {{ stepper.paths }}<br />
      <b>Path</b>: {{ stepper.path }}<br />
      <b>Current</b>: {{ stepper.current }}<br />
    </div>
    <button @click="stepper.prev()" class="button is-primary m-2">Prev</button>
    <button @click="stepper.reset()" class="button is-danger m-2">Reset</button>
    <button @click="next()" class="button is-primary m-2">Next</button>
    <button @click="adddata()" class="button is-warning m-2">Add Data</button>
    <br />
    <StateTreeViewer :state-machine="stepper.sm" :path="stepper.path" @node-click="stepper.resetTo" />
  </div>
</template>

<style scoped>
.tree-diagram-text {
  text-align: left;
  width: 400px;
  margin: 0 auto;
  font-family: monospace;
}
</style>
