/**
 * @module useViewAPI
 * @description Creates a view-specific API instance that combines core API functionality with stepper controls
 * @returns {Object} A reactive object containing:
 * - All methods and properties from the core API
 * - All methods and properties from the stepper
 */
import { ref, reactive, computed, watch } from 'vue'
import { SmileAPI } from '@/core/composables/useAPI'
import useSmileStore from '@/core/stores/smilestore'
import { useStepper } from '@/core/composables/useStepper'
import { onKeyDown, onKeyPressed, onKeyUp, useMouse, useMousePressed } from '@vueuse/core'
import useTimeline from '@/core/composables/useTimeline'
import { useRoute, useRouter } from 'vue-router'
import useLog from '@/core/stores/log'
import config from '@/core/config'

// Singleton instance
let viewAPIInstance = null

/**
 * ViewAPI class extends SmileAPI with view-specific functionality
 * @class
 * @extends SmileAPI
 * @description Extends the core SmileAPI with additional view-specific functionality including:
 * - Stepper controls and state management
 * - Data recording capabilities
 * - Mouse and keyboard event handlers
 */
class ViewAPI extends SmileAPI {
  constructor(store, logStore, route, router, timeline) {
    super(store, logStore, route, router, timeline)

    // Store route as a class property
    this._route = route

    // Make page reactive using computed
    this._page = computed(() => this._route.name)
    this._stepper = computed(() => {
      const stepper = useStepper(this._route.name, this.update)
      stepper.setOnModify(() => this.updateStepper())
      return stepper
    })

    // Internal reactive refs
    this._pathData = ref(null)
    this._path = ref(null)
    this._pathString = ref('')
    this._index = ref(null)
    this._stateMachine = ref(null)
    this._gvars = ref({})

    // Component registry
    this.componentRegistry = new Map()

    // Watch for stepper changes and update internal state
    watch(
      this._stepper,
      (newStepper) => {
        this._updateStepperState(newStepper, false) // don't save because it will trigger recursive updates
      },
      { immediate: true, deep: true }
    )

    // Add keyboard event handlers from VueUse
    this.onKeyDown = onKeyDown
    this.onKeyPressed = onKeyPressed
    this.onKeyUp = onKeyUp

    // Add mouse event handlers from VueUse
    this.useMouse = useMouse
    this.useMousePressed = useMousePressed
  }

  _updateStepperState(data, save = true) {
    this._pathData.value = data.pathData
    this._pathString.value = data.currentPathString
    this._path.value = data.currentPath
    this._index.value = data.index
    this._gvars.value = reactive(data.data?.gvars || {})
    this._stateMachine.value = this._visualizeStateMachine()
    if (save) {
      this._saveStepperState()
    }
  }

  /**
   * The underlying state machine instance
   * @name steps
   * @memberof ViewAPI
   * @instance
   * @type {Stepper}
   * @description Provides direct access to the underlying Stepper state machine instance.
   * This allows advanced manipulation of the state machine when needed.
   */
  get steps() {
    if (!this._stepper.value) return null
    return this._stepper.value
  }

  updateStepper() {
    this._updateStepperState(this._stepper.value)
  }

  _visualizeStateMachine() {
    const processState = (state, level = 0) => {
      const cleanState = {
        data: state.data,
        pathdata: state.pathData,
        path: state.pathString,
        index: state.index,
        isLeaf: state.isLeaf,
        isFirstLeaf: state.isFirstLeaf,
        rows: [],
      }

      if (state.rows) {
        state.rows.forEach((childState) => {
          cleanState.rows.push(processState(childState, level + 1))
        })
      }

      return cleanState
    }

    return processState(this._stepper.value)
  }

  _saveStepperState() {
    if (this._stepper.value) {
      this._stepper.value.save(this._page.value)
    }
  }

  hasNextStep() {
    return this._stepper.value.hasNext()
  }

  /**
   * Checks if there is a previous step available in the stepper.
   * @returns {boolean} True if there is a previous step available, false otherwise.
   * @memberof ViewAPI
   * @instance
   */
  hasPrevStep() {
    return this._stepper.value.hasPrev()
  }

  /**
   * Checks if there are any steps in the stepper.
   * Calls on the root stepper to check for steps, avoiding leaf node checks if none exist.
   * @returns {boolean} True if there are steps in the stepper, false otherwise.
   * @memberof ViewAPI
   * @instance
   */
  hasSteps() {
    // has steps calls on the root to find if it has steps
    // if not then no need to check for leafs
    return this._stepper.value.hasSteps()
  }

  /**
   * Advances to the next step in the stepper.
   * Updates the stepper state if a next step exists.
   * @returns {Object|null} The next state object if one exists, null otherwise
   * @memberof ViewAPI
   * @instance
   */
  goNextStep() {
    let next = this._stepper.value.next()
    if (next !== null) {
      this._updateStepperState(next)
    }
    return next
  }

  /**
   * Returns to the previous step in the stepper.
   * Updates the stepper state if a previous step exists.
   * @returns {Object|null} The previous state object if one exists, null otherwise
   * @memberof ViewAPI
   * @instance
   */
  goPrevStep() {
    let prev = this._stepper.value.prev()
    if (prev !== null) {
      this._updateStepperState(prev)
    }
    return prev
  }

  /**
   * Resets the stepper to its first step.
   * Updates the stepper state after resetting to the initial position.
   * @returns {void}
   * @memberof ViewAPI
   * @instance
   */
  goFirstStep() {
    this._stepper.value.reset()
    this._updateStepperState(this._stepper.value)
  }

  /**
   * Navigates to a specific step by path.
   * Updates the stepper state after navigating to the specified path.
   * @param {string} path - The path of the step to navigate to
   * @returns {void}
   * @memberof ViewAPI
   * @instance
   */
  goToStep(path) {
    this._stepper.value.goTo(path)
    this._updateStepperState(this._stepper.value)
  }

  get stepData() {
    if (!this._pathData.value) return null

    const mergedData = computed(() => {
      return this._pathData.value.reduce((merged, item) => {
        return { ...merged, ...item }
      }, {})
    })

    const createRecursiveProxy = (obj) => {
      if (obj === null || typeof obj !== 'object') {
        return obj
      }

      if (Array.isArray(obj)) {
        return new Proxy(obj, {
          get: (target, prop) => {
            const value = target[prop]
            if (typeof prop === 'string' && !isNaN(prop)) {
              return createRecursiveProxy(value)
            }
            return value
          },
          set: (target, prop, value) => {
            target[prop] = value
            if (this._stepper.value.currentData) {
              this._stepper.value.currentData[prop] = value
              this._saveStepperState()
            }
            return true
          },
        })
      }

      return new Proxy(obj, {
        get: (target, prop) => {
          const value = target[prop]
          return createRecursiveProxy(value)
        },
        set: (target, prop, value) => {
          target[prop] = value
          if (this._stepper.value.currentData) {
            this._stepper.value.currentData[prop] = value
            this._saveStepperState()
          }
          return true
        },
      })
    }

    return createRecursiveProxy(mergedData.value)
  }

  get datapath() {
    if (this._pathData.value === null) return null

    return this._data.value.map((item) => {
      if (item?.type?.__vueComponent) {
        return {
          ...item,
          type: this.componentRegistry.get(item.type.componentName) || {
            template: `<div>Component ${item.type.componentName} not found</div>`,
          },
        }
      }
      return item
    })
  }

  /**
   * Gets the current step index among leaf nodes in the stepper.
   * The step index represents the position of the current path string
   * within the flattened array of leaf nodes.
   * @returns {number} The zero-based index of the current step, or -1 if not found
   * @memberof ViewAPI
   * @instance
   */
  get stepIndex() {
    const leafNodes = this._stepper.value.leafNodes
    return leafNodes.indexOf(this._pathString.value)
  }

  /**
   * Gets the current block index in the stepper.
   * The block index represents the position within the current block of steps.
   * @returns {number} The zero-based index within the current block
   * @memberof ViewAPI
   * @instance
   */
  get blockIndex() {
    return this._stepper.value.blockIndex
  }

  /**
   * Gets the current path as a string representation.
   * The path string is a forward-slash delimited string of step names representing
   * the current location in the stepper (e.g. "trial/block1/step2").
   * @returns {string} The current path string
   * @memberof ViewAPI
   * @instance
   */
  get pathString() {
    return this._pathString.value
  }

  /**
   * Gets the current path as an array.
   * The path array contains the sequence of step names representing the current
   * location in the stepper (e.g. ['trial', 'block1', 'step2']).
   * @returns {string[]} The current path array
   * @memberof ViewAPI
   * @instance
   */
  get path() {
    return this._path.value
  }

  /**
   * Gets the total number of leaf nodes in the stepper.
   * This represents the total number of steps in the sequence, excluding any parent/container nodes.
   * @returns {number} The total number of leaf nodes
   * @memberof ViewAPI
   * @instance
   */
  get length() {
    return this._stepper.value.countLeafNodes
  }

  /**
   * Checks if the current step is the last step in the sequence.
   * This compares the current step index against the total number of steps.
   * @returns {boolean} True if this is the last step, false otherwise
   * @memberof ViewAPI
   * @instance
   */
  isLastStep() {
    return this.stepIndex === this.nSteps - 1
  }

  /**
   * Checks if the current step is the last step in the current block.
   * This compares the current block index against the total length of the block.
   * @returns {boolean} True if this is the last step in the block, false otherwise
   * @memberof ViewAPI
   * @instance
   */
  isLastBlockStep() {
    return this.blockIndex === this.blockLength - 1
  }

  get blockLength() {
    return this._stepper.value.blockLength
  }

  get stepLength() {
    return this._stepper.value.countLeafNodes
  }

  get nSteps() {
    return this._stepper.value.countLeafNodes
  }

  // Getter for persisted variable that provides access to gvars from stepper root data
  get persist() {
    if (!this._stepper.value.root.data.gvars) {
      this._stepper.value.root.data.gvars = {}
    }
    const self = this // capture the outer this context

    const isDefined = (key) => key in this._stepper.value.root.data.gvars

    const createRecursiveProxy = (target) => {
      return new Proxy(target, {
        get: (target, prop) => {
          if (prop === 'isDefined') {
            return isDefined
          }
          const value = target[prop]
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            return createRecursiveProxy(value)
          }
          return value
        },
        set: (target, prop, value) => {
          target[prop] = value
          setTimeout(() => {
            self.updateStepper()
          }, 2)
          return true
        },
      })
    }

    return createRecursiveProxy(this._stepper.value.root.data.gvars)
  }

  // Timing methods
  startTimer(name = 'default') {
    this.persist[`startTime_${name}`] = Date.now()
  }

  timerStarted(name = 'default') {
    const timerKey = `startTime_${name}`
    return timerKey in this._stepper.value.root.data.gvars ? this._stepper.value.root.data.gvars[timerKey] : false
  }

  elapsedTime(name = 'default') {
    return Date.now() - this._stepper.value.root.data.gvars[`startTime_${name}`]
  }

  elapsedTimeInSeconds(name = 'default') {
    return (Date.now() - this._stepper.value.root.data.gvars[`startTime_${name}`]) / 1000
  }

  elapsedTimeInMinutes(name = 'default') {
    return (Date.now() - this._stepper.value.root.data.gvars[`startTime_${name}`]) / 60000
  }

  // Data methods
  stepperData(pathFilter = null) {
    const matchesFilter = (path, filter) => {
      if (!filter) return true

      let pattern = filter.replace(/\*/g, '.*')
      pattern = pattern.replace(/[+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`^${pattern}`)
      return regex.test(path)
    }

    const getLeafData = (state) => {
      if (state.isLeaf) {
        if (matchesFilter(state.pathString, pathFilter)) {
          return state.data
        }
        return []
      }
      return state.states.flatMap(getLeafData)
    }

    return getLeafData(this._stepper.value)
  }

  clear() {
    if (this.store.browserPersisted.viewSteppers[this._page.value]) {
      const pageData = this.store.browserPersisted.viewSteppers[this._page.value].data || {}
      delete pageData.stepperState
      this.store.browserPersisted.viewSteppers[this._page.value].data = pageData

      this._stepper.value.clearSubTree()
      this.componentRegistry.clear()
    }
    this._saveStepperState()
  }

  clearPersist() {
    this._gvars.value = reactive({})
    this.stepper.root.data.gvars = {}
    this._saveStepperState()
  }

  /**
   * Records the current step data to the experiment data store
   * @method recordStep
   * @memberof ViewAPI
   * @instance
   * @description Logs the current step data and records it to the experiment data store using recordData
   * @returns {void}
   */
  recordStep() {
    this.recordData(this.stepData)
  }

  // Update getter to use computed stepper
  get stepper() {
    return this._stepper.value
  }
}

/**
 * Creates and returns a reactive ViewAPI instance
 * @returns {ViewAPI} A reactive ViewAPI instance with all view-specific functionality
 */
export default function useViewAPI() {
  if (!viewAPIInstance) {
    const { goNextView, goPrevView, goToView, nextView, prevView } = useTimeline()
    const route = useRoute()
    const router = useRouter()
    const store = useSmileStore()
    const logStore = useLog()
    const timeline = { goNextView, goPrevView, goToView, nextView, prevView }
    viewAPIInstance = new ViewAPI(store, logStore, route, router, timeline)

    // Add shortcuts for arrow keys
    if (config.mode == 'development') {
      /**
       * Handle right arrow key press to advance to next step
       * @listens keydown.ArrowRight
       * @param {KeyboardEvent} e - The keyboard event
       */
      onKeyDown(['ArrowRight'], (e) => {
        e.preventDefault()
        viewAPIInstance.goNextStep()
      })

      /**
       * Handle left arrow key press to go back to previous step
       * @listens keydown.ArrowLeft
       * @param {KeyboardEvent} e - The keyboard event
       */
      onKeyDown(['ArrowLeft'], (e) => {
        e.preventDefault()
        viewAPIInstance.goPrevStep()
      })
    }
  }

  return viewAPIInstance
}

/**
 * Resets the ViewAPI instance to null. Used for testing purposes.
 * @private
 * @function _reset
 * @memberof useViewAPI
 */
useViewAPI._reset = () => {
  viewAPIInstance = null
}
