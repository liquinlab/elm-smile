/**
 * @module useViewAPI
 * @description Creates a view-specific API instance that combines core API functionality with stepper controls
 * @returns {Object} A reactive object containing:
 * - All methods and properties from the core API
 * - All methods and properties from the stepper
 */
import { ref, reactive, computed } from 'vue'
import { SmileAPI } from '@/core/composables/useAPI'
import useSmileStore from '@/core/stores/smilestore'
import { useStepper } from '@/core/composables/useStepper'
import { onKeyDown, onKeyPressed, onKeyUp, useMouse, useMousePressed } from '@vueuse/core'
import useTimeline from '@/core/composables/useTimeline'
import { useRoute, useRouter } from 'vue-router'
import useLog from '@/core/stores/log'
import config from '@/core/config'

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
    this.stepper = useStepper()

    // Internal reactive refs
    this._data = ref(null)
    this._path = ref(null)
    this._pathString = ref('')
    this._index = ref(null)
    this._stateMachine = ref(null)
    this._gvars = ref({})

    // Component registry
    this.componentRegistry = new Map()

    // Initialize state
    if (this.stepper.states.length > 0) {
      this._data.value = this.stepper.pathData
      this._pathString.value = this.stepper.currentPathString
      this._path.value = this.stepper.currentPath || []
      this._index.value = this.stepper.index
      this._gvars.value = reactive(this.stepper.data.gvars || {})
    }

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
    return this.stepper
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

      state.rows.forEach((childState) => {
        cleanState.rows.push(processState(childState, level + 1))
      })

      return cleanState
    }

    return processState(this.stepper)
  }

  _saveStepperState() {
    if (this.store.local.viewSteppers[this.page]) {
      this.store.local.viewSteppers[this.page] = {
        data: {
          stepperState: this.stepper.json,
        },
      }
    }
  }

  goNextStep() {
    let next = this.stepper.next()
    if (next !== null) {
      console.log('NEXT', this._pathString)
      this._data.value = next.pathData
      this._pathString.value = next.currentPathString
      this._path.value = next.currentPath
      this._index.value = next.index
      this._stateMachine.value = this._visualizeStateMachine()
      this._saveStepperState()
    }
    return next
  }

  goPrevStep() {
    let prev = this.stepper.prev()
    if (prev !== null) {
      console.log('PREV', this._pathString)
      this._data.value = prev.pathData
      this._pathString.value = prev.currentPathString
      this._path.value = prev.currentPath
      this._index.value = prev.index
      this._stateMachine.value = this._visualizeStateMachine()
      this._saveStepperState()
    }
    return prev
  }

  reset() {
    this.stepper.reset()
    if (this.stepper.states.length > 0) {
      this.stepper.next()
      this._data.value = this.stepper.pathData
      this._pathString.value = this.stepper.currentPathString
      this._path.value = this.stepper.currentPath
      this._stateMachine.value = this._visualizeStateMachine()
      this._saveStepperState()
    }
  }

  goToStep(path) {
    this.stepper.goTo(path)
    this._data.value = this.stepper.pathData
    this._pathString.value = this.stepper.currentPathString
    this._path.value = this.stepper.currentPath
    this._stateMachine.value = this._visualizeStateMachine()
    this._saveStepperState()
  }

  init() {
    this._stateMachine.value = this._visualizeStateMachine()
    this.stepper.next()
  }

  get stepData() {
    if (!this.datapath) return null

    const mergedData = computed(() => {
      return this.datapath.reduce((merged, item) => {
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
            if (this.stepper.currentData) {
              this.stepper.currentData[prop] = value
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
          if (this.stepper.currentData) {
            this.stepper.currentData[prop] = value
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
    if (this._data.value === null) return null

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
    const leafNodes = this.stepper.leafNodes
    return leafNodes.indexOf(this._pathString.value)
  }

  get paths() {
    return this._pathString.value
  }

  get path() {
    return this._path.value
  }

  get smviz() {
    return this._stateMachine.value || this._visualizeStateMachine()
  }

  get steps() {
    return this.stepper
  }

  get length() {
    return this.stepper.countLeafNodes - 2
  }

  get nSteps() {
    return this.stepper.countLeafNodes - 2
  }

  get nrows() {
    return this.stepper.countLeafNodes
  }

  // Timing methods
  startTimer(name = 'default') {
    this.stepper.root.data.gvars[`startTime_${name}`] = Date.now()
  }

  elapsedTime(name = 'default') {
    return Date.now() - this.stepper.root.data.gvars[`startTime_${name}`]
  }

  elapsedTimeInSeconds(name = 'default') {
    return (Date.now() - this.stepper.root.data.gvars[`startTime_${name}`]) / 1000
  }

  elapsedTimeInMinutes(name = 'default') {
    return (Date.now() - this.stepper.root.data.gvars[`startTime_${name}`]) / 60000
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

    return getLeafData(this.stepper)
  }

  clear() {
    if (this.store.local.viewSteppers[this.page]) {
      const pageData = this.store.local.viewSteppers[this.page].data || {}
      delete pageData.stepperState
      this.store.local.viewSteppers[this.page].data = pageData

      this.stepper.clearTree()
      this.stepper.push('SOS')
      this.stepper.push('EOS')

      this._path.value = []
      this._pathString.value = ''
      this._data.value = null
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
}

/**
 * Creates and returns a reactive ViewAPI instance
 * @returns {ViewAPI} A reactive ViewAPI instance with all view-specific functionality
 */
export default function useViewAPI() {
  const { goNextView, goPrevView, goToView, nextView, prevView } = useTimeline()
  const route = useRoute()
  const router = useRouter()
  const store = useSmileStore()
  const logStore = useLog()
  const timeline = { goNextView, goPrevView, goToView, nextView, prevView }
  const viewAPI = new ViewAPI(store, logStore, route, router, timeline)

  // Add shortcuts for arrow keys
  if (config.mode == 'development') {
    /**
     * Handle right arrow key press to advance to next step
     * @listens keydown.ArrowRight
     * @param {KeyboardEvent} e - The keyboard event
     */
    onKeyDown(['ArrowRight'], (e) => {
      e.preventDefault()
      viewAPI.goNextStep()
    })

    /**
     * Handle left arrow key press to go back to previous step
     * @listens keydown.ArrowLeft
     * @param {KeyboardEvent} e - The keyboard event
     */
    onKeyDown(['ArrowLeft'], (e) => {
      e.preventDefault()
      viewAPI.goPrevStep()
    })
  }

  return viewAPI
}

// class StepperAPI {
//   constructor(stepper, smilestore, page) {
//     this.sm = stepper
//     this.smilestore = smilestore
//     this.page = page

//     // Internal reactive refs
//     this._data = ref(null)
//     this._path = ref(null)
//     this._paths = ref('')
//     this._index = ref(null)
//     this._stateMachine = ref(null)
//     this._gvars = ref({})

//     // Component registry
//     this.componentRegistry = new Map()

//     // Initialize state
//     if (stepper.states.length > 0) {
//       this._data.value = stepper.pathData
//       this._paths.value = stepper.currentPathString
//       this._path.value = stepper.currentPath || []
//       this._index.value = stepper.index
//       this._gvars.value = reactive(stepper.data.gvars || {})
//     }
//   }

//   // Navigation methods
//   goNextStep() {
//     let next = this.sm.next()
//     if (next !== null) {
//       this._data.value = next.pathData
//       this._paths.value = next.currentPathString
//       this._path.value = next.currentPath
//       this._index.value = next.index
//       this._stateMachine.value = this.visualizeStateMachine()
//       this.saveStepperState()
//     }
//     return next
//   }

//   goPrevStep() {
//     let prev = this.sm.prev()
//     if (prev !== null) {
//       this._data.value = prev.pathData
//       this._paths.value = prev.currentPathString
//       this._path.value = prev.currentPath
//       this._index.value = prev.index
//       this._stateMachine.value = this.visualizeStateMachine()
//       this.saveStepperState()
//     }
//     return prev
//   }

//   reset() {
//     this.sm.reset()
//     if (this.sm.states.length > 0) {
//       this.sm.next()
//       this._data.value = this.sm.pathData
//       this._paths.value = this.sm.currentPathString
//       this._path.value = this.sm.currentPath
//       this._stateMachine.value = this.visualizeStateMachine()
//       this.saveStepperState()
//     }
//   }

//   goToStep(path) {
//     this.sm.goTo(path)
//     this._data.value = this.sm.pathData
//     this._paths.value = this.sm.currentPathString
//     this._path.value = this.sm.currentPath
//     this._stateMachine.value = this.visualizeStateMachine()
//     this.saveStepperState()
//   }

//   init() {
//     this._stateMachine.value = this.visualizeStateMachine()
//     this.sm.next()
//   }

//   // Helper methods
//   saveStepperState() {
//     if (this.smilestore.local.viewSteppers[this.page]) {
//       this.smilestore.local.viewSteppers[this.page] = {
//         data: {
//           stepperState: this.sm.json,
//         },
//       }
//     }
//   }

//   visualizeStateMachine() {
//     const processState = (state, level = 0) => {
//       const cleanState = {
//         data: state.data,
//         pathdata: state.pathData,
//         path: state.pathString,
//         index: state.index,
//         isLeaf: state.isLeaf,
//         isFirstLeaf: state.isFirstLeaf,
//         rows: [],
//       }

//       state.rows.forEach((childState) => {
//         cleanState.rows.push(processState(childState, level + 1))
//       })

//       return cleanState
//     }

//     return processState(this.sm)
//   }

//   // Getters
//   get stepData() {
//     if (!this.datapath) return null

//     const mergedData = computed(() => {
//       return this.datapath.reduce((merged, item) => {
//         return { ...merged, ...item }
//       }, {})
//     })

//     const createRecursiveProxy = (obj) => {
//       if (obj === null || typeof obj !== 'object') {
//         return obj
//       }

//       if (Array.isArray(obj)) {
//         return new Proxy(obj, {
//           get: (target, prop) => {
//             const value = target[prop]
//             if (typeof prop === 'string' && !isNaN(prop)) {
//               return createRecursiveProxy(value)
//             }
//             return value
//           },
//           set: (target, prop, value) => {
//             target[prop] = value
//             if (this.sm.currentData) {
//               this.sm.currentData[prop] = value
//               this.saveStepperState()
//             }
//             return true
//           },
//         })
//       }

//       return new Proxy(obj, {
//         get: (target, prop) => {
//           const value = target[prop]
//           return createRecursiveProxy(value)
//         },
//         set: (target, prop, value) => {
//           target[prop] = value
//           if (this.sm.currentData) {
//             this.sm.currentData[prop] = value
//             this.saveStepperState()
//           }
//           return true
//         },
//       })
//     }

//     return createRecursiveProxy(mergedData.value)
//   }

//   get d() {
//     return this.data
//   }

//   get datapath() {
//     if (this._data.value === null) return null

//     return this._data.value.map((item) => {
//       if (item?.type?.__vueComponent) {
//         return {
//           ...item,
//           type: this.componentRegistry.get(item.type.componentName) || {
//             template: `<div>Component ${item.type.componentName} not found</div>`,
//           },
//         }
//       }
//       return item
//     })
//   }

//   get stepIndex() {
//     const leafNodes = this.sm.leafNodes
//     return leafNodes.indexOf(this._paths.value)
//   }

//   get paths() {
//     return this._paths.value
//   }

//   get path() {
//     return this._path.value
//   }

//   get smviz() {
//     return this._stateMachine.value || this.visualizeStateMachine()
//   }

//   get steps() {
//     return this.sm
//   }

//   get length() {
//     return this.sm.countLeafNodes - 2
//   }

//   get nSteps() {
//     return this.sm.countLeafNodes - 2
//   }

//   get nrows() {
//     return this.sm.countLeafNodes
//   }

//   // Timing methods
//   startTimer(name = 'default') {
//     this.sm.root.data.gvars[`startTime_${name}`] = Date.now()
//   }

//   elapsedTime(name = 'default') {
//     return Date.now() - this.sm.root.data.gvars[`startTime_${name}`]
//   }

//   elapsedTimeInSeconds(name = 'default') {
//     return (Date.now() - this.sm.root.data.gvars[`startTime_${name}`]) / 1000
//   }

//   elapsedTimeInMinutes(name = 'default') {
//     return (Date.now() - this.sm.root.data.gvars[`startTime_${name}`]) / 60000
//   }

//   // Data methods
//   stepperData(pathFilter = null) {
//     const matchesFilter = (path, filter) => {
//       if (!filter) return true

//       let pattern = filter.replace(/\*/g, '.*')
//       pattern = pattern.replace(/[+?^${}()|[\]\\]/g, '\\$&')
//       const regex = new RegExp(`^${pattern}`)
//       return regex.test(path)
//     }

//     const getLeafData = (state) => {
//       if (state.isLeaf) {
//         if (state.id === 'SOS' || state.id === 'EOS') {
//           return []
//         }
//         if (matchesFilter(state.pathString, pathFilter)) {
//           return state.data
//         }
//         return []
//       }
//       return state.states.flatMap(getLeafData)
//     }

//     return getLeafData(this.sm)
//   }

//   clear() {
//     if (this.smilestore.local.viewSteppers[this.page]) {
//       const pageData = this.smilestore.local.viewSteppers[this.page].data || {}
//       delete pageData.stepperState
//       this.smilestore.local.viewSteppers[this.page].data = pageData

//       this.sm.clearTree()
//       this.sm.push('SOS')
//       this.sm.push('EOS')

//       this._path.value = []
//       this._paths.value = ''
//       this._data.value = null
//       this._index.value = null
//       this._stateMachine.value = this.visualizeStateMachine()

//       this.componentRegistry.clear()
//     }
//   }

//   clearGlobals() {
//     this._gvars.value = reactive({})
//     this.sm.root.data.gvars = {}
//     this.saveStepperState()
//   }

//   get globals() {
//     const createRecursiveProxy = (target) => {
//       if (target === null || typeof target !== 'object') {
//         return target
//       }

//       return new Proxy(target, {
//         get: (obj, prop) => {
//           const value = obj[prop]
//           return createRecursiveProxy(value)
//         },
//         set: (obj, prop, value) => {
//           obj[prop] = value
//           this.sm.root.data.gvars = this._gvars.value
//           this.saveStepperState()
//           return true
//         },
//       })
//     }

//     return createRecursiveProxy(this._gvars.value)
//   }
// }
