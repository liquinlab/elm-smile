import { useHStepper } from './useHStepper'
import useSmileStore from '@/core/stores/smilestore'
import { useRoute } from 'vue-router'

/**
 * Creates or retrieves a stepper instance for the current page
 * @function useStepper
 * @returns {Object} The stepper instance for the current page
 * @description This composable manages stepper instances on a per-page basis.
 * It ensures that:
 * - Each page has its own stepper instance stored in the global smilestore
 * - The dev bar is notified that the page provides a trial stepper
 * - Stepper instances are reused when revisiting a page
 * The stepper provides functionality for managing multi-step processes and
 * tracking state within experiment views.
 */
export function useStepper() {
  const smilestore = useSmileStore()
  const route = useRoute()
  const page = route.name

  // Set pageProvidesTrialStepper to true for the dev bar
  smilestore.dev.pageProvidesTrialStepper = true

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
