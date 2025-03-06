import { shuffle } from '@/core/randomization'
import { ref, computed } from 'vue'
import useSmileStore from '@/core/stores/smilestore'
import useLog from '@/core/stores/log'
import { useRoute } from 'vue-router'

export function useStepper(trials) {
  const smilestore = useSmileStore()
  const log = useLog()
  const route = useRoute()
  const page = route.name
  smilestore.dev.page_provides_trial_stepper = true

  const n_trials = trials.length

  function nextStep() {
    log.log('STEPPER: Advancing to next step')
    if (smilestore.getPageTrackerIndex(page) < n_trials - 1) {
      smilestore.incrementPageTracker(page)
    } else {
      smilestore.incrementPageTracker(page)
    }
  }

  function prevStep() {
    log.warn('TRIAL STEPPER: Rewinding to prev trial')
    if (smilestore.getPageTrackerIndex(page) > 0) {
      smilestore.decrementPageTracker(page)
    }
  }

  function resetStep() {
    smilestore.resetPageTracker(page)
  }

  const step_index = computed(() => {
    return smilestore.getPageTrackerIndex(page)
  })

  const step = computed(() => {
    return trials[step_index.value]
  })

  return {
    next: nextStep,
    prev: prevStep,
    reset: resetStep,
    // Simple getters for reactive versions
    index: () => step_index.value,
    current: () => step.value,
  }
}

export default useStepper
