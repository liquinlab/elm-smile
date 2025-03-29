import { useHStepper } from './useHStepper'
import useSmileStore from '@/core/stores/smilestore'
import { useRoute } from 'vue-router'

export function useStepper() {
  const smilestore = useSmileStore()
  const route = useRoute()
  const page = route.name

  // Set page_provides_trial_stepper to true for the dev bar
  smilestore.dev.page_provides_trial_stepper = true

  // Initialize the stepper in global smilestore if it doesn't exist
  if (!smilestore.global.steppers?.[page]) {
    if (!smilestore.global.steppers) {
      smilestore.global.steppers = {}
    }
    smilestore.global.steppers[page] = useHStepper()
  }

  // Return the existing stepper instance
  return smilestore.global.steppers[page]
}

export default useStepper
