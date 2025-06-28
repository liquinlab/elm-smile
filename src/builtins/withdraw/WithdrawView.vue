<script setup>
// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

api.saveData(true) // force a data save
</script>

<template>
  <div class="page select-none">
    <div class="w-3/5 mx-auto" v-if="api.getRecruitmentService() == 'prolific'">
      <h1 class="text-2xl font-bold text-red-600 mb-4">You have successfully withdrawn from the study.</h1>
      <article class="border border-red-300 rounded bg-red-50" v-if="api.store.browserPersisted.withdrawn">
        <div class="bg-red-500 text-white px-3 py-2 text-sm font-medium border-b border-red-300">
          <p>Notice about withdraw from our Prolific study</p>
        </div>
        <div class="p-3 text-left text-red-800">
          You have indicated that you withdrew from the study. Please return the task and we will contact you for
          partial payment if you are eligible.
        </div>
      </article>
    </div>

    <div class="w-3/5 mx-auto" v-if="api.getRecruitmentService() == 'cloudresearch'">
      <h1 class="text-2xl font-bold text-red-600 mb-4">You have successfully withdrawn from the study.</h1>
      <article class="border border-red-300 rounded bg-red-50" v-if="api.store.browserPersisted.withdrawn">
        <div class="bg-red-500 text-white px-3 py-2 text-sm font-medium border-b border-red-300">
          <p>Notice about withdraw from our CloudResearch study</p>
        </div>
        <div class="p-3 text-left text-red-800">
          You have indicated that you withdrew from the study. Please return the task and we will contact you for
          partial payment if you are eligible.
        </div>
      </article>
    </div>

    <div class="w-3/5 mx-auto" v-if="api.getRecruitmentService() == 'mturk'">
      <h1 class="text-2xl font-bold text-red-600 mb-4">You have successfully withdrawn from the study.</h1>
      <article class="border border-red-300 rounded bg-red-50" v-if="api.store.browserPersisted.withdrawn">
        <div class="bg-red-500 text-white px-3 py-2 text-sm font-medium border-b border-red-300">
          <p>Notice about withdraw from our Amazon Mechanical Turk study</p>
        </div>
        <div class="p-3 text-left text-red-800">
          You have indicated that you withdrew from the study. Please return the task and we will contact you for
          partial payment if you are eligible.
        </div>
      </article>
    </div>

    <div class="w-3/5 mx-auto" v-if="api.getRecruitmentService() == 'citizensci'">
      <h1 class="text-2xl font-bold text-red-600 mb-4">You have successfully withdrawn from the study.</h1>
      <article class="border border-red-300 rounded bg-red-50" v-if="api.store.browserPersisted.withdrawn">
        <div class="bg-red-500 text-white px-3 py-2 text-sm font-medium border-b border-red-300">
          <p>Notice about withdraw from our study</p>
        </div>
        <div class="p-3 text-left text-red-800">
          You have indicated that you withdrew from the study. Please return the task and we will contact you for
          partial payment if you are eligible.
        </div>
      </article>
    </div>

    <div class="w-3/5 mx-auto" v-if="api.getRecruitmentService() == 'web'">
      <h1 class="text-2xl font-bold text-red-600 mb-4">You have successfully withdrawn from the study.</h1>
      <article class="border border-red-300 rounded bg-red-50" v-if="api.store.browserPersisted.withdrawn">
        <div class="bg-red-500 text-white px-3 py-2 text-sm font-medium border-b border-red-300">
          <p>Notice about withdraw from our web study</p>
        </div>
        <div class="p-3 text-left text-red-800">
          You have indicated that you withdrew from the study. Please return the task and we will contact you for
          partial payment if you are eligible.
        </div>
      </article>
    </div>
  </div>
</template>
