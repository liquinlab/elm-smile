/**
 * @module useStepper
 * @description Manages stepper instances on a per-view basis.
 * Provides functionality for:
 * - Creating or retrieving a stepper instance for the current view
 * - Setting the viewProvidesStepper flag  in the dev store
 * - Storing the stepper instance in the global smilestore
 */
import Stepper from '@/core/stepper/Stepper'
import useSmileStore from '@/core/stores/smilestore'

/**
 * @class StepperAPI
 * @description Wraps a Stepper instance to provide a consistent API for managing multi-step processes
 */

/**
 * Creates or retrieves a stepper instance for the current view
 * @function useStepper
 * @param {string} view - The view name to create/retrieve the stepper for
 * @returns {Object} The stepper instance for the current view
 * @description This composable manages stepper instances on a per-view basis.
 * It ensures that:
 * - Each view has its own stepper instance stored in the global smilestore
 * - The dev bar is notified that the view provides a trial stepper
 * - Stepper instances are reused when revisiting a view
 * The stepper provides functionality for managing multi-step processes and
 * tracking state within experiment views.
 */
export function useStepper(view) {
  const smilestore = useSmileStore()

  // Set viewProvidesStepper to true for the dev bar
  smilestore.dev.viewProvidesStepper = true

  // Check if stepper already exists in global state
  let stepper = smilestore.browserEphemeral.steppers?.[view]

  if (!stepper) {
    // console.log('smilestore', smilestore)
    // console.log('view', view)
    // console.log('steppper', smilestore.getStepper(view))
    // console.log('stepper.data', smilestore.getStepper(view)?.data)
    // Create new stepper instance if none exists
    const savedState = smilestore.getStepper(view)?.data
    if (savedState) {
      console.log('STEPPER: Loading saved state from smilestore for view', view)
      stepper = new Stepper({ serializedState: savedState.stepperState, store: smilestore })
    } else {
      console.log('STEPPER: Initializing state machine with SOS and EOS nodes for view', view)
      stepper = new Stepper({ id: '/', parent: null, data: { gvars: {} }, store: smilestore }) // explicit init
    }
    stepper.name = view
    // Register stepper if not already registered
    console.log('STEPPER: Registering stepper for view', stepper.data)
    if (view) {
      stepper = smilestore.registerStepper(view, stepper)
    }
  }

  // Return the StepperAPI instance
  return stepper
}

export default useStepper
