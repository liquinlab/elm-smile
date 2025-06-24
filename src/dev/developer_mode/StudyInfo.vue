<script setup>
import { computed } from 'vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const studyinfo = computed(() => {
  return `<b>Study:</b> ${api.store.config.codeName}<br /><b>Version:</b> ${api.store.config.github.lastCommitHash}${
    api.store.config.mode === 'testing' ||
    api.store.config.mode === 'development' ||
    api.store.config.mode === 'presentation'
      ? '-' + api.store.config.mode
      : ''
  }<br />${api.store.getShortId != 'N/A' ? `<b>User ID:</b> ${api.store.getShortId}` : ''}`
})
</script>

<template>
  <p class="text-xs text-muted-foreground font-mono py-2 px-3" v-html="studyinfo"></p>
</template>
