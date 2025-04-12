/**
 * @module useViewAPI
 * @description Creates a view-specific API instance that combines core API functionality with stepper controls
 * @returns {Object} A reactive object containing:
 * - All methods and properties from the core API
 * - All methods and properties from the stepper
 */
import { reactive } from 'vue'
import useAPI from '@/core/composables/useAPI'
import { useStepper } from '@/core/composables/useStepper'
import { onKeyDown, onKeyPressed, onKeyUp, useMouse, useMousePressed } from '@vueuse/core'

/**
 * Creates a view-specific API instance that combines core API functionality with stepper controls
 * @function useViewAPI
 * @returns {Object} A reactive object containing:
 * - All methods and properties from the core API
 * - All methods and properties from the stepper
 * - Additional view-specific methods like recordStep
 * - Mouse and keyboard event handlers from VueUse
 * @description This composable creates an enhanced API object specifically for view components.
 * It inherits core API functionality and adds stepper controls, data recording capabilities,
 * and input event handlers. The returned object is made reactive to ensure reactivity in templates.
 */
export default function useViewAPI() {
  const api = useAPI()
  const stepper = useStepper()

  // Create a new object that inherits from the API
  const viewAPI = Object.create(api)

  // Merge stepper functionality into viewAPI object
  // This copies over all properties and methods from the stepper instance
  // while maintaining proper 'this' binding and getter/setter behavior
  Object.entries(stepper).forEach(([key, value]) => {
    if (typeof value === 'function') {
      // For methods: Bind them to the stepper instance to preserve correct 'this' context
      // This ensures stepper methods can access stepper state when called from viewAPI
      viewAPI[key] = value.bind(stepper)
    } else {
      // For properties (like computed values, refs, etc):
      // Create property descriptors that delegate to the stepper instance
      // - get: Returns current value from stepper when property is accessed
      // - enumerable: Makes property visible in Object.keys() and for...in loops
      // - configurable: Allows property to be modified/deleted later if needed
      Object.defineProperty(viewAPI, key, {
        get: () => stepper[key],
        enumerable: true,
        configurable: true,
      })
    }
  })

  /**
   * Records the current step data to the experiment data store
   * @method recordStep
   * @memberof ViewAPI
   * @instance
   * @description Logs the current step data and records it to the experiment data store using recordData
   * @returns {void}
   */
  viewAPI.recordStep = function () {
    console.log('recordStep', this.stepData)
    this.recordData(this.stepData)
  }

  // Add keyboard event handlers from VueUse
  /**
   * Event handler for key down events
   * @method onKeyDown
   * @memberof ViewAPI
   * @instance
   * @see {@link https://vueuse.org/core/onKeyDown}
   */
  viewAPI.onKeyDown = onKeyDown

  /**
   * Event handler for key press events
   * @method onKeyPressed
   * @memberof ViewAPI
   * @instance
   * @see {@link https://vueuse.org/core/onKeyPressed}
   */
  viewAPI.onKeyPressed = onKeyPressed

  /**
   * Event handler for key up events
   * @method onKeyUp
   * @memberof ViewAPI
   * @instance
   * @see {@link https://vueuse.org/core/onKeyUp}
   */
  viewAPI.onKeyUp = onKeyUp

  // Add mouse event handlers from VueUse
  /**
   * Hook for tracking mouse position and state
   * @method useMouse
   * @memberof ViewAPI
   * @instance
   * @see {@link https://vueuse.org/core/useMouse}
   */
  viewAPI.useMouse = useMouse

  /**
   * Hook for tracking mouse button press state
   * @method useMousePressed
   * @memberof ViewAPI
   * @instance
   * @see {@link https://vueuse.org/core/useMousePressed}
   */
  viewAPI.useMousePressed = useMousePressed
  // Make the object reactive
  return reactive(viewAPI)
}
