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

    // Make stepper reactive using computed
    this._stepper = computed(() => useStepper(route.name))

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
        if (newStepper?.states?.length > 0) {
          this._pathData.value = newStepper.pathData
          this._pathString.value = newStepper.currentPathString
          this._path.value = newStepper.currentPath || []
          this._index.value = newStepper.index
          this._gvars.value = reactive(newStepper.data.gvars || {})
        }
      },
      { immediate: true }
    )

    // Add keyboard event handlers from VueUse
    this.onKeyDown = onKeyDown
    this.onKeyPressed = onKeyPressed
    this.onKeyUp = onKeyUp

    // Add mouse event handlers from VueUse
    this.useMouse = useMouse
    this.useMousePressed = useMousePressed
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
    return this._stepper.value
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
    if (this.store.local.viewSteppers[this.page]) {
      this.store.local.viewSteppers[this.page] = {
        data: {
          stepperState: this._stepper.json,
        },
      }
    }
  }

  hasNextStep() {
    return this._stepper.value.hasNext()
  }

  hasPrevStep() {
    return this._stepper.value.hasPrev()
  }

  goNextStep() {
    let next = this._stepper.value.next()
    if (next !== null) {
      console.log('NEXT', this._pathString)
      this._pathData.value = next.pathData
      this._pathString.value = next.currentPathString
      this._path.value = next.currentPath
      this._index.value = next.index
      this._stateMachine.value = this._visualizeStateMachine()
      this._saveStepperState()
    }
    return next
  }

  goPrevStep() {
    let prev = this._stepper.value.prev()
    if (prev !== null) {
      console.log('PREV', this._pathString)
      this._pathData.value = prev.pathData
      this._pathString.value = prev.currentPathString
      this._path.value = prev.currentPath
      this._index.value = prev.index
      this._stateMachine.value = this._visualizeStateMachine()
      this._saveStepperState()
    }
    return prev
  }

  reset() {
    this._stepper.value.reset()
    if (this._stepper.value.states.length > 0) {
      this._stepper.value.next()
      this._pathData.value = this._stepper.value.pathData
      this._pathString.value = this._stepper.value.currentPathString
      this._path.value = this._stepper.value.currentPath
      this._stateMachine.value = this._visualizeStateMachine()
      this._saveStepperState()
    }
  }

  goToStep(path) {
    this._stepper.value.goTo(path)
    this._pathData.value = this._stepper.value.pathData
    this._pathString.value = this._stepper.value.currentPathString
    this._path.value = this._stepper.value.currentPath
    this._stateMachine.value = this._visualizeStateMachine()
    this._saveStepperState()
  }

  init() {
    this._stateMachine.value = this._visualizeStateMachine()
    this._stepper.value.next()
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

  get d() {
    return this.stepData
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

  get stepIndex() {
    const leafNodes = this._stepper.value.leafNodes
    return leafNodes.indexOf(this._pathString.value)
  }

  get pathString() {
    return this._pathString.value
  }

  get path() {
    return this._path.value
  }

  get smviz() {
    return this._stateMachine.value || this._visualizeStateMachine()
  }

  get length() {
    return this._stepper.value.countLeafNodes - 2
  }

  get nSteps() {
    return this._stepper.value.countLeafNodes - 2
  }

  get nrows() {
    return this._stepper.value.countLeafNodes
  }

  // Timing methods
  startTimer(name = 'default') {
    this._stepper.value.root.data.gvars[`startTime_${name}`] = Date.now()
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
        if (state.id === 'SOS' || state.id === 'EOS') {
          return []
        }
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
    if (this.store.local.viewSteppers[this.page]) {
      const pageData = this.store.local.viewSteppers[this.page].data || {}
      delete pageData.stepperState
      this.store.local.viewSteppers[this.page].data = pageData

      this._stepper.value.clearSubTree()
      this._stepper.value.push('SOS')
      this._stepper.value.push('EOS')

      this._path.value = []
      this._pathString.value = ''
      this._pathData.value = null
      this._index.value = null
      this._stateMachine.value = this._visualizeStateMachine()

      this.componentRegistry.clear()
    }
  }

  clearGlobals() {
    this._gvars.value = reactive({})
    this.stepper.root.data.gvars = {}
    this._saveStepperState()
  }

  get globals() {
    const createRecursiveProxy = (target) => {
      if (target === null || typeof target !== 'object') {
        return target
      }

      return new Proxy(target, {
        get: (obj, prop) => {
          const value = obj[prop]
          return createRecursiveProxy(value)
        },
        set: (obj, prop, value) => {
          obj[prop] = value
          this.stepper.root.data.gvars = this._gvars.value
          this._saveStepperState()
          return true
        },
      })
    }

    return createRecursiveProxy(this._gvars.value)
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
    console.log('recordStep', this.stepData)
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
