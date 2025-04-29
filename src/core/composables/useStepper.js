/**
 * @module useStepper
 * @description Manages stepper instances on a per-view basis.
 * Provides functionality for:
 * - Creating or retrieving a stepper instance for the current view
 * - Setting the viewProvidesTrialStepper flag in the dev store
 * - Storing the stepper instance in the global smilestore
 */
import Stepper from '@/core/stepper/Stepper'
import useSmileStore from '@/core/stores/smilestore'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
/**
 * @class StepperAPI
 * @description Wraps a Stepper instance to provide a consistent API for managing multi-step processes
 */

/**
 * Creates or retrieves a stepper instance for the current view
 * @function useStepper
 * @returns {Object} The stepper instance for the current view
 * @description This composable manages stepper instances on a per-view basis.
 * It ensures that:
 * - Each view has its own stepper instance stored in the global smilestore
 * - The dev bar is notified that the view provides a trial stepper
 * - Stepper instances are reused when revisiting a view
 * The stepper provides functionality for managing multi-step processes and
 * tracking state within experiment views.
 */

export function useStepper() {
  const smilestore = useSmileStore()
  const route = useRoute()
  const view = route.name

  // Set viewProvidesTrialStepper to true for the dev bar
  smilestore.dev.viewProvidesTrialStepper = true

  // Check if stepper already exists in global state
  let stepper = smilestore.global.steppers?.[view]

  if (!stepper) {
    // Create new stepper instance if none exists
    const savedState = smilestore.getStepper(view)?.data
    if (savedState) {
      console.log('STEPPER: Loading saved state from smilestore')
      stepper = new Stepper({ serializedState: savedState.stepperState })
    } else {
      console.log('STEPPER: Initializing state machine with SOS and EOS nodes')
      stepper = new Stepper({ id: '/', parent: null, data: { gvars: {} } }) // explicit init
    }

    // Register stepper if not already registered
    smilestore.registerStepper(view, stepper)
  }



  console.log('STEPPER: Setting name', view)
  stepper.name = view
  // Return the StepperAPI instance
  return stepper
}

export default useStepper
