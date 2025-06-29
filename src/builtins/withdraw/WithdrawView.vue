<script setup>
// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
import { Card, CardHeader, CardContent } from '@/uikit/components/ui/card'
import { computed } from 'vue'

const api = useAPI()

api.saveData(true) // force a data save

// Define card content for each recruitment service
const cardContent = {
  prolific: {
    title: 'Notice about withdraw from our Prolific study',
    message:
      'You have indicated that you withdrew from the study. Please return the task and we will contact you for partial payment if you are eligible.',
  },
  cloudresearch: {
    title: 'Notice about withdraw from our CloudResearch study',
    message:
      'You have indicated that you withdrew from the study. Please return the task and we will contact you for partial payment if you are eligible.',
  },
  mturk: {
    title: 'Notice about withdraw from our Mechanical Turk study',
    message:
      'You have indicated that you withdrew from the study. Please return the task and we will contact you for partial payment if you are eligible.',
  },
  citizensci: {
    title: 'Notice about withdraw from our study',
    message:
      'You have indicated that you withdrew from the study. Please return the task and we will contact you for partial payment if you are eligible.',
  },
  web: {
    title: 'Notice about withdraw from our web study',
    message:
      'You have indicated that you withdrew from the study. Please return the task and we will contact you for partial payment if you are eligible.',
  },
}

const currentService = computed(() => api.getRecruitmentService())
const content = computed(() => cardContent[currentService.value])
</script>

<template>
  <div class="page select-none pt-15">
    <div class="w-4/5 mx-auto">
      <Card v-if="api.store.browserPersisted.withdrawn && content" class="border-red-300 bg-red-50">
        <CardHeader>
          <p class="text-xl font-semibold">
            <i-icon-park-outline-bye class="text-red-500 inline-block text-5xl mr-2" />{{ content.title }}
          </p>
        </CardHeader>
        <CardContent>
          {{ content.message }}
        </CardContent>
      </Card>
    </div>
  </div>
</template>
