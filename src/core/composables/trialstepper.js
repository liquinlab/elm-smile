import { shuffle } from '@/core/randomization'
import { ref } from 'vue'
import useSmileStore from '@/core/stores/smiledata'
import useLog from '@/core/stores/log'

export function useTrialStepper(trials, page, finishedCallback) {
  const smilestore = useSmileStore()
  const log = useLog()
  //const index = ref(0)
  const n_trials = trials.length

  function nextTrial() {
    log.log('TRIAL STEPPER: Advancing to next trial')
    if (smilestore.getPageTracker(page) < n_trials - 1) {
      //index += 1
      smilestore.incrementPageTracker(page)
    } else {
      finishedCallback()
      smilestore.incrementPageTracker(page)
    }
  }

  function prevTrial() {
    log.warn('TRIAL STEPPER: Rewinding to prev trial')
    if (smilestore.getPageTracker(page) > 0) {
      //index -= 1
      smilestore.decrementPageTracker(page)
    }
  }

  return { nextTrial, prevTrial }
}

export function useStatelessTrialStepper(trials, index, finishedCallback) {
  //const index = ref(0)
  const n_trials = trials.length

  function nextTrial() {
    log.log('TRIAL STEPPER: Advancing to next trial')
    //log.log("i see index", smilestore.getPageTracker(route.name))
    if (index.value < n_trials - 1) {
      index.value += 1
    } else {
      finishedCallback()
      index.value += 1
    }
  }

  function prevTrial() {
    log.warn('TRIAL STEPPER: Rewinding to prev trial')
    if (index.value > 0) {
      index.value -= 1
    }
  }

  return { nextTrial, prevTrial }
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
export default useTrialStepper
