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

  //const index = ref(0)
  const n_trials = trials.length

  function nextStep() {
    log.log('STEPPER: Advancing to next step')
    if (smilestore.getPageTracker(page) < n_trials - 1) {
      //index += 1
      smilestore.incrementPageTracker(page)
    } else {
      smilestore.incrementPageTracker(page)
      //finishedCallback()
    }
  }

  function prevStep() {
    log.warn('TRIAL STEPPER: Rewinding to prev trial')
    if (smilestore.getPageTracker(page) > 0) {
      //index -= 1
      smilestore.decrementPageTracker(page)
    }
  }

  function resetStep() {
    smilestore.resetPageTracker(page)
  }

  const step_index = computed(() => {
    return smilestore.getPageTracker(page)
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

export function useStatelessStepper(trials, index, finishedCallback) {
  //const index = ref(0)
  const n_trials = trials.length

  function nextStep() {
    log.log('STATELESS STEPPER: Advancing to next trial')
    //log.log("i see index", smilestore.getPageTracker(route.name))
    if (index.value < n_trials - 1) {
      index.value += 1
    } else {
      finishedCallback()
      index.value += 1
    }
  }

  function prevStep() {
    log.warn('STATELESSS STEPPER: Rewinding to prev trial')
    if (index.value > 0) {
      index.value -= 1
    }
  }

  return { nextStep, prevStep }
}

/*
export function useTrialStepper(trials, page, finishedCallback) {
  log.log('using trial stepper')
  const smilestore = useSmileStore()
  log.log(smilestore.local)
  const index = smilestore.getPage[page]
  log.log(index)
  log.log(smilestore.getLocal)
  log.log(smilestore.getLocal.pageTracker)
  const n_trials = trials.length
  const trial = ref(trials[index])
  log.log(trial)

  function nextTrial() {
    log.log('next trial please')
    if (index < n_trials - 1) {
      //smilestore.incrementPageTracker(page)
      index += 1
      log.log(trial)
      trial.value = trials[index]
      log.log(trial)
    } else {
      finishedCallback()
    }
  }

  function prevTrial() {
    if (index > 0) {
      //index.value = smilestore.decrementPageTracker(page)
      trial.value = trials[index]
    }
  }
  return { index, trial, nextTrial, prevTrial }
}
*/
//export { useTrialStepper, useStatelessTrialStepper }
export default useStepper
