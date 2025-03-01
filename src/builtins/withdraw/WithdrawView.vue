<script setup>
// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

api.saveData(true) // force a data save
</script>

<template>
  <div class="page prevent-select">
    <div class="withdraw" v-if="api.getRecruitmentService() == 'prolific'">
      <h1 class="title is-3 has-text-danger">You have successfully withdrawn from the study.</h1>
      <article class="message is-danger" v-if="api.store.local.withdrawn">
        <div class="message-header">
          <p>Notice about withdraw from our Prolific study</p>
        </div>
        <div class="message-body has-text-left">
          You have indicated that you withdrew from the study. Please return the task and we will contact you for
          partial payment if you are eligible.
        </div>
      </article>
    </div>

    <div class="withdraw" v-if="api.getRecruitmentService() == 'cloudresearch'">
      <h1 class="title is-3 has-text-danger">You have successfully withdrawn from the study.</h1>
      <article class="message is-danger" v-if="api.store.local.withdrawn">
        <div class="message-header">
          <p>Notice about withdraw from our CloudResearch study</p>
        </div>
        <div class="message-body has-text-left">
          You have indicated that you withdrew from the study. Please return the task and we will contact you for
          partial payment if you are eligible.
        </div>
      </article>
    </div>

    <div class="withdraw" v-if="api.getRecruitmentService() == 'mturk'">
      <h1 class="title is-3 has-text-danger">You have successfully withdrawn from the study.</h1>
      <article class="message is-danger" v-if="api.store.local.withdrawn">
        <div class="message-header">
          <p>Notice about withdraw from our Amazon Mechanical Turk study</p>
        </div>
        <div class="message-body has-text-left">
          You have indicated that you withdrew from the study. Please return the task and we will contact you for
          partial payment if you are eligible.
        </div>
      </article>
    </div>

    <div class="withdraw" v-if="api.getRecruitmentService() == 'citizensci'">
      <h1 class="title is-3 has-text-danger">You have successfully withdrawn from the study.</h1>
      <article class="message is-danger" v-if="api.store.local.withdrawn">
        <div class="message-header">
          <p>Notice about withdraw from our study</p>
        </div>
        <div class="message-body has-text-left">
          You have indicated that you withdrew from the study. Please return the task and we will contact you for
          partial payment if you are eligible.
        </div>
      </article>
    </div>

    <div class="withdraw" v-if="api.getRecruitmentService() == 'web'">
      <h1 class="title is-3 has-text-danger">You have successfully withdrawn from the study.</h1>
      <article class="message is-danger" v-if="api.store.local.withdrawn">
        <div class="message-header">
          <p>Notice about withdraw from our web study</p>
        </div>
        <div class="message-body has-text-left">
          You have indicated that you withdrew from the study. Please return the task and we will contact you for
          partial payment if you are eligible.
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.withdraw {
  width: 60%;
  margin: auto;
}
</style>
