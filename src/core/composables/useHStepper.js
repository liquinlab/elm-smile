/**
 * @module useHStepper
 * @description Hierarchical stepper composable for managing multi-step processes in views.
 * Provides functionality for:
 * - Managing hierarchical state transitions
 * - Tracking step data and history
 * - Handling nested tables and transactions
 * - Managing global variables and timing
 *
 * The stepper maintains state using a tree structure that:
 * - Tracks the current path and available paths
 * - Manages step data and transaction history
 * - Provides utilities for timing and data access
 * - Handles nested table instances
 */

import { ref, computed, markRaw, reactive } from 'vue'
import useSmileStore from '@/core/stores/smilestore'
import useLog from '@/core/stores/log'
import { useRoute } from 'vue-router'
import { StepState } from '@/core/composables/StepState'
import NestedTable from '@/core/composables/NestedTable'
import { v4 as uuidv4 } from 'uuid'

export function useHStepper() {
  const smilestore = useSmileStore()
  const log = useLog()
  const route = useRoute()
  const page = route.name

  // Create instances of our state managers
  const sm = new StepState('/')

  // Internal reactive refs
  const _data = ref(null)
  const _path = ref(null)
  const _paths = ref('')
  const _index = ref(null)
  const _stateMachine = ref(null) // Add reactive ref for state machine visualization
  const _transactionHistory = ref([]) // Add new ref for transaction history
  const _gvars = ref({}) // Add new reactive ref for global variables
  // Internal table management
  const tables = new Map()

  // Custom deep copy function that handles special types
  const deepCopy = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    // Handle Vue components
    if (obj?.__vueComponent || obj?.template || obj?.render) {
      return markRaw(obj)
    }

    // Handle functions
    if (typeof obj === 'function') {
      return obj
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => deepCopy(item))
    }

    // Handle objects
    const copy = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = deepCopy(obj[key])
      }
    }
    return copy
  }

  // RNG implementation
  let _seed = 12345 // Fixed seed for deterministic behavior

  // New method to handle RNG seed functionality
  const resetSeed = () => {
    _seed = 12345 // Reset to initial seed value
  }

  const transactionId = () => {
    _seed = (_seed * 1664525 + 1013904223) >>> 0 // LCG parameters from Numerical Recipes
    return (_seed & 0xffffffff).toString(36).padStart(8, '0').slice(-8) // Convert to base36 string, padded to 8 chars
  }

  // Register stepper if not already registered
  smilestore.registerStepper(page)

  console.log(page, smilestore.local.viewSteppers[page])
  // // Try to load existing state from smilestore
  const savedState = smilestore.getStepper(page)?.data

  if (savedState) {
    console.log('STEPPER: Loading saved state from smilestore')
    console.log('savedState', savedState)
    sm.loadFromJSON(savedState.stepperState)
    console.log('sm', sm)
    _data.value = sm.pathdata
    _paths.value = sm.currentPaths
    _path.value = sm.currentPath || [] // Ensure path is never null
    _index.value = sm.index
    _gvars.value = reactive(sm.data.gvars || {})
    _transactionHistory.value = savedState.transactionHistory || [] // Load transaction history
    //console.log('STEPPER: Loaded state from smilestore with path', sm.currentPaths)
  } else {
    // Initialize the state machine with SOS and EOS nodes
    console.log('STEPPER: Initializing state machine with SOS and EOS nodes')
    sm.push('SOS')
    sm.push('EOS')
    _path.value = [] // Initialize path as empty array
    _paths.value = ''
    _data.value = null
    _index.value = null
    _transactionHistory.value = [] // Initialize empty transaction history
  }

  console.log('sm.root', sm.root)
  // Initialize root node data with empty gvars object if not already present
  if (!sm.root.data) {
    sm.root.data = { gvars: {} }
  } else if (!sm.root.data.gvars) {
    sm.root.data.gvars = {}
  }

  // Get all protected methods from a temporary table instance
  const PROTECTED_METHODS = new NestedTable(sm).getProtectedTableMethods()

  // Add this helper function after the initial setup and before the stepper object
  const saveStepperState = () => {
    console.log('STEPPER: Saving state to smilestore')
    if (smilestore.local.viewSteppers[page]) {
      console.log('STEPPER: Saving state to smilestore')
      smilestore.local.viewSteppers[page] = {
        data: {
          stepperState: sm.json,
          transactionHistory: _transactionHistory.value,
        },
      }
    }
  }

  // Create internal component registry
  const componentRegistry = new Map()

  // Helper to register component
  const registerComponent = (component) => {
    if (component?.name && (component.template || component.render)) {
      componentRegistry.set(component.name, component)
    }
  }

  // Helper to scan data for components
  const scanForComponents = (data) => {
    if (!data) return

    // Check if the item itself is a component
    if (data?.name && (data.template || data.render)) {
      registerComponent(data)
    }

    // Check type property for component
    if (data?.type?.name && (data.type.template || data.type.render)) {
      registerComponent(data.type)
    }

    // Recursively scan arrays and objects
    if (Array.isArray(data)) {
      data.forEach(scanForComponents)
    } else if (typeof data === 'object') {
      Object.values(data).forEach(scanForComponents)
    }
  }

  // Create the stepper object that will be returned
  const stepper = {
    // Navigation methods
    goNextStep: () => {
      let next = sm.next()
      //console.log('next', next)
      if (next !== null) {
        _data.value = next.pathdata
        _paths.value = next.currentPaths
        _path.value = next.currentPath
        _index.value = next.index
        _stateMachine.value = visualizeStateMachine() // Update state machine visualization
        saveStepperState() // Save state after successful navigation
      }
      return next
    },
    goPrevStep: () => {
      let prev = sm.prev()

      if (prev !== null) {
        _data.value = prev.pathdata
        _paths.value = prev.currentPaths
        _path.value = prev.currentPath
        _index.value = prev.index
        _stateMachine.value = visualizeStateMachine() // Update state machine visualization
        saveStepperState() // Save state after successful navigation
      }
      return prev
    },
    reset: () => {
      sm.reset()
      if (sm.states.length > 0) {
        sm.next()
        _data.value = sm.pathdata
        _paths.value = sm.currentPaths
        _path.value = sm.currentPath
        _stateMachine.value = visualizeStateMachine() // Update state machine visualization
        saveStepperState() // Save state after reset
      }
    },
    goToStep: (path) => {
      //console.log('goTo', path)
      sm.goTo(path)
      _data.value = sm.pathdata
      _paths.value = sm.currentPaths
      _path.value = sm.currentPath
      _stateMachine.value = visualizeStateMachine() // Update state machine visualization
      saveStepperState() // Save state after goTo
    },
    init: () => {
      //sm.next()
      _stateMachine.value = visualizeStateMachine() // Update state machine visualization
      sm.next()
    },
    addSpec: (table, ignoreContent = false) => {
      // Generate a new random number at the start of each push

      const tnxID = transactionId()
      const fullTransactionId = ignoreContent ? `${tnxID}` : `${table.tableID}-${tnxID}`

      // Always scan table items for components, regardless of saved state
      table._items.forEach((item) => {
        scanForComponents(item.data)
      })

      // Skip the actual push if we're loading from saved state or if table was already pushed
      if (savedState && _transactionHistory.value.includes(fullTransactionId)) {
        log.debug('STEPPER: Skipping push of table with transaction ID', fullTransactionId)
        return
      }

      // Check if we've already pushed a table with this hash
      const existingTransaction = _transactionHistory.value.find((tx) => tx === fullTransactionId)
      if (existingTransaction) {
        log.debug('STEPPER: Skipping push of table with transaction ID', fullTransactionId)
        return
      }

      // Add combined transaction ID to transaction history
      _transactionHistory.value.push(fullTransactionId)

      // Check if the table is already read-only
      if (table.isReadOnly) {
        throw new Error('Cannot push a read-only table')
      }

      // Check if there are any items to push
      if (table._items.length === 0) {
        log.debug('STEPPER: Skipping push of table with no items')
        return
      }

      // Recursive function to process NestedTable structure
      const processTable = (nestedTable, parentState, level = 0) => {
        // Get the starting index for appending new items (excludes SOS/EOS nodes)
        const startIndex = parentState.states.filter((state) => state.id !== 'SOS' && state.id !== 'EOS').length

        // Get all items at this level
        for (let i = 0; i < nestedTable._items.length; i++) {
          const item = nestedTable._items[i]

          // Use path from data if available, otherwise use index-based approach
          let state
          if (item.data && (item.data.path !== undefined || item.data.page !== undefined)) {
            const nodeName = item.data.path !== undefined ? item.data.path : item.data.page
            if (level == 0) {
              state = parentState.insert(nodeName, -2)
            } else {
              state = parentState.push(nodeName)
            }
          } else {
            if (level == 0) {
              state = parentState.insert(startIndex + i, -2)
            } else {
              state = parentState.push(startIndex + i)
            }
          }

          // Set data for this item - create a deep copy
          if (item.data !== undefined) {
            state.data = deepCopy(item.data)
          }

          // Process child items if they exist
          if (item._items && item._items.length > 0) {
            processTable(item, state, level + 1)
          }
        }
      }

      // Process the root table - appends to existing structure
      processTable(table, sm)

      // Set the table to read-only
      table.setReadOnly()
      if (sm.index == 0) {
        stepper.reset()
      }

      _stateMachine.value = visualizeStateMachine() // Update state machine visualization
      // Add this before the return statement in push
      saveStepperState() // Save state after pushing new items
    },
    // Expose current and index as computed properties
    get stepData() {
      if (!this.datapath) return null

      // Create a computed property that merges the datapath
      const mergedData = computed(() => {
        // By default, later items override earlier ones (last-wins)
        // To preserve first occurrence, reverse the array before reducing
        return this.datapath.reduce((merged, item) => {
          return { ...merged, ...item }
        }, {})
      })

      // Helper function to create a recursive proxy
      const createRecursiveProxy = (obj) => {
        if (obj === null || typeof obj !== 'object') {
          return obj
        }

        // Handle arrays
        if (Array.isArray(obj)) {
          return new Proxy(obj, {
            get: (target, prop) => {
              const value = target[prop]
              if (typeof prop === 'string' && !isNaN(prop)) {
                // If accessing array index, return proxied value
                return createRecursiveProxy(value)
              }
              return value
            },
            set: (target, prop, value) => {
              target[prop] = value
              if (sm.currentData) {
                sm.currentData[prop] = value
                saveStepperState()
              }
              return true
            },
          })
        }

        // Handle objects
        return new Proxy(obj, {
          get: (target, prop) => {
            const value = target[prop]
            return createRecursiveProxy(value)
          },
          set: (target, prop, value) => {
            target[prop] = value
            if (sm.currentData) {
              sm.currentData[prop] = value
              saveStepperState()
            }
            return true
          },
        })
      }

      // Create the root proxy
      return createRecursiveProxy(mergedData.value)
    },

    get d() {
      return this.data
    },

    get datapath() {
      if (_data.value === null) return null

      return _data.value.map((item) => {
        if (item?.type?.__vueComponent) {
          return {
            ...item,
            type: componentRegistry.get(item.type.componentName) || {
              template: `<div>Component ${item.type.componentName} not found</div>`,
            },
          }
        }
        return item
      })
    },
    get stepIndex() {
      // Get all leaf nodes from the state machine
      const leafNodes = sm.leafNodes
      //console.log('leafNodes', leafNodes)
      // Find the index of our current path in the leaf nodes array
      return leafNodes.indexOf(_paths.value)
    },

    get paths() {
      return _paths.value
    },
    get path() {
      return _path.value
    },
    // Expose state machine with wrapped getData
    get sm() {
      return sm
    },

    // Expose reactive state machine visualization
    get smviz() {
      return _stateMachine.value || visualizeStateMachine()
    },

    // Create new table instance with access to stepper for nested tables
    spec: () => {
      const tableId = uuidv4()
      const table = new NestedTable(sm)

      // Store the table in our internal map
      tables.set(tableId, table)

      return table
    },
    // Add transactionHistory getter to the stepper object
    get transactionHistory() {
      return _transactionHistory.value
    },
    get length() {
      return sm.countLeafNodes - 2
    },
    get nSteps() {
      return sm.countLeafNodes - 2
    },

    get nrows() {
      return sm.countLeafNodes
    },

    // timing
    startTimer: (name = 'default') => {
      sm.root.data.gvars[`startTime_${name}`] = Date.now()
    },
    elapsedTime: (name = 'default') => {
      return Date.now() - sm.root.data.gvars[`startTime_${name}`]
    },
    elapsedTimeInSeconds: (name = 'default') => {
      return (Date.now() - sm.root.data.gvars[`startTime_${name}`]) / 1000
    },
    elapsedTimeInMinutes: (name = 'default') => {
      return (Date.now() - sm.root.data.gvars[`startTime_${name}`]) / 60000
    },

    // Add new alldata getter
    stepperData(pathFilter = null) {
      // Helper function to check if a path matches a filter pattern
      const matchesFilter = (path, filter) => {
        if (!filter) return true // If no filter, match everything

        // Convert filter pattern to regex
        // First replace * with .* for wildcard matching
        let pattern = filter.replace(/\*/g, '.*')

        // Then escape special regex characters, but not the dots we just added
        pattern = pattern.replace(/[+?^${}()|[\]\\]/g, '\\$&')

        const regex = new RegExp(`^${pattern}`)

        console.log('Checking path:', path, 'against pattern:', pattern)
        const matches = regex.test(path)
        console.log('Matches:', matches)
        return matches
      }

      // Helper function to recursively get data from leaf nodes
      const getLeafData = (state) => {
        if (state.isLeaf) {
          // Skip SOS and EOS nodes
          if (state.id === 'SOS' || state.id === 'EOS') {
            return []
          }
          // Check if the full path matches the filter
          if (matchesFilter(state.paths, pathFilter)) {
            console.log('Including data for path:', state.paths)
            return state.data
          }
          return []
        }
        return state.states.flatMap(getLeafData)
      }

      // Start from root state and get all leaf node data
      return getLeafData(sm)
    },

    clear: () => {
      if (smilestore.local.viewSteppers[page]) {
        // Remove the stepperState from the page tracker data
        const pageData = smilestore.local.viewSteppers[page].data || {}
        delete pageData.stepperState
        smilestore.local.viewSteppers[page].data = pageData

        // Clear all states and reset the state machine
        sm.clearTree() /// this only clear the tree and not the data at the top level
        //sm.clear()
        sm.push('SOS')
        sm.push('EOS')
        // Reset all internal refs
        _path.value = []
        _paths.value = ''
        _data.value = null
        _index.value = null
        _transactionHistory.value = []
        _stateMachine.value = visualizeStateMachine()

        // Reset the RNG seed
        resetSeed()

        // Clear component registry and tables
        componentRegistry.clear()
        tables.clear()
      }
    },
    clearGlobals: () => {
      _gvars.value = reactive({})
      sm.root.data.gvars = {}
      saveStepperState() // Save state when global variables are modified
    },
    get globals() {
      console.log('getting globals', _gvars.value.forminfo)
      //_gvars.value = sm.root.data.gvars
      // Create a recursive proxy that automatically saves changes
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
            console.log('setting global variable', prop, value)
            obj[prop] = value
            sm.root.data.gvars = _gvars.value
            saveStepperState() // Save state when global variables are modified
            return true
          },
        })
      }

      return createRecursiveProxy(_gvars.value)
    },
    // set globals(value) {
    //   console.log('setting globals', value)
    //   _gvars.value = value
    //   sm.root.data.gvars = value
    //   saveStepperState() // Save state when global variables are modified
    // },
  }

  // Helper function to visualize state machine
  const visualizeStateMachine = () => {
    // Helper function to recursively process each state
    const processState = (state, level = 0) => {
      // Create a clean object without currentIndex, depth, and parent
      const cleanState = {
        data: state.data,
        pathdata: state.pathdata,
        path: state.paths,
        index: state.index,
        isLeaf: state.isLeaf,
        isFirstLeaf: state.isFirstLeaf,
        rows: [],
      }

      // Process each child state
      state.rows.forEach((childState) => {
        cleanState.rows.push(processState(childState, level + 1))
      })

      return cleanState
    }

    // Start processing from the root state
    return processState(sm)
  }

  // Add protected methods to the stepper instance
  PROTECTED_METHODS.filter((method) => method !== 'path' && method !== 'paths' && method !== 'length').forEach(
    (method) => {
      Object.defineProperty(stepper, method, {
        get() {
          throw new Error(`${method}() must be called after table()`)
        },
      })
    }
  )

  // When loading from savedState, we should also scan the existing state
  if (savedState) {
    // Scan the entire state machine for components
    const scanStateMachine = (state) => {
      scanForComponents(state.data)
      state.states.forEach(scanStateMachine)
    }
    scanStateMachine(sm)
  }

  return stepper
}

export default useHStepper
