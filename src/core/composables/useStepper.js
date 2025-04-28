/**
 * @module useStepper
 * @description Manages stepper instances on a per-page basis.
 * Provides functionality for:
 * - Creating or retrieving a stepper instance for the current page
 * - Setting the pageProvidesTrialStepper flag in the dev store
 * - Storing the stepper instance in the global smilestore
 */
import { ref, computed, markRaw, reactive } from 'vue'
import Stepper from '@/core/stepper/Stepper'
import useSmileStore from '@/core/stores/smilestore'
import { useRoute } from 'vue-router'
import { onKeyDown } from '@vueuse/core'

/**
 * @class StepperAPI
 * @description Wraps a Stepper instance to provide a consistent API for managing multi-step processes
 */

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

  // Check if stepper already exists in global state
  let stepper = smilestore.global.steppers?.[page]

  if (!stepper) {
    // Create new stepper instance if none exists
    const savedState = smilestore.getStepper(page)?.data
    if (savedState) {
      console.log('STEPPER: Loading saved state from smilestore')
      stepper = new Stepper({ serializedState: savedState.stepperState })
    } else {
      console.log('STEPPER: Initializing state machine with SOS and EOS nodes')
      stepper = new Stepper({ id: '/', parent: null, data: { gvars: {} } }) // explicit init
    }

    // Register stepper if not already registered
    smilestore.registerStepper(page, stepper)
  }

  // Return the StepperAPI instance
  return stepper
}

export default useStepper
