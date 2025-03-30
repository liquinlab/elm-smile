import { ref, computed } from 'vue'
import useSmileStore from '@/core/stores/smilestore'
import { useRoute } from 'vue-router'
import { StepState } from '@/core/composables/StepState'
import NestedTable from '@/core/composables/NestedTable'
import { v4 as uuidv4 } from 'uuid'

export function useHStepper() {
  const smilestore = useSmileStore()
  const route = useRoute()
  const page = route.name

  // this activates the stepper for the page in the dev tools
  smilestore.dev.page_provides_trial_stepper = true

  // Create instances of our state managers
  const sm = new StepState('/')

  // Internal reactive refs
  const _data = ref(null)
  const _path = ref(null)
  const _paths = ref('')
  const _index = ref(null)
  const _stateMachine = ref(null) // Add reactive ref for state machine visualization
  const _transactionHistory = ref([]) // Add new ref for transaction history
  // Internal table management
  const tables = new Map()

  // Modify the RNG implementation to return 8-character string
  let _seed = 12345 // Fixed seed for deterministic behavior
  const transactionId = () => {
    _seed = (_seed * 1664525 + 1013904223) >>> 0 // LCG parameters from Numerical Recipes
    return (_seed & 0xffffffff).toString(36).padStart(8, '0').slice(-8) // Convert to base36 string, padded to 8 chars
  }

  // Register page tracker if not already registered
  smilestore.registerPageTracker(page)

  // // Try to load existing state from smilestore
  const savedState = smilestore.getPageTrackerData(page)?.stepperState

  if (savedState) {
    //console.log('STEPPER: Loading saved state from smilestore')
    sm.loadFromJSON(savedState.stepperState)
    _data.value = sm.pathdata
    _paths.value = sm.currentPaths
    _path.value = sm.currentPath || [] // Ensure path is never null
    _index.value = sm.index
    _transactionHistory.value = savedState.transactionHistory || [] // Load transaction history
    //console.log('STEPPER: Loaded state from smilestore with path', sm.currentPaths)
  } else {
    sm.push('SOS')
    sm.push('EOS')
    _path.value = [] // Initialize path as empty array
    _paths.value = ''
    _data.value = null
    _index.value = null
    _transactionHistory.value = [] // Initialize empty transaction history
  }

  // Get all protected methods from a temporary table instance
  const PROTECTED_METHODS = new NestedTable(sm).getProtectedTableMethods()

  // Add this helper function after the initial setup and before the stepper object
  const saveStepperState = () => {
    if (smilestore.local.pageTracker[page]) {
      //console.log('STEPPER: Saving state to smilestore')
      smilestore.local.pageTracker[page].data = {
        ...smilestore.local.pageTracker[page].data,
        stepperState: {
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
    next: () => {
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
    prev: () => {
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
    goTo: (path) => {
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
    push: (table) => {
      // Generate a new random number at the start of each push

      const tnxID = transactionId()
      const fullTransactionId = `${table.tableID}-${tnxID}`

      // Always scan table items for components, regardless of saved state
      table._items.forEach((item) => {
        scanForComponents(item.data)
      })

      // Skip the actual push if we're loading from saved state or if table was already pushed
      if (savedState && _transactionHistory.value.includes(fullTransactionId)) {
        return table
      }

      // Check if we've already pushed a table with this hash
      const existingTransaction = _transactionHistory.value.find((tx) => tx.startsWith(table.tableID + '-'))
      if (existingTransaction) {
        return table
      }

      // Add combined transaction ID to transaction history
      _transactionHistory.value.push(fullTransactionId)

      // Check if the table is already read-only
      if (table.isReadOnly) {
        throw new Error('Cannot push a read-only table')
      }

      // Check if there are any items to push
      if (table._items.length === 0) {
        return table
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

          // Set data for this item
          if (item.data !== undefined) {
            state.data = item.data
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

      return table
    },
    // Expose current and index as computed properties
    get data() {
      if (!this.datapath) return null

      // Merge all objects in datapath array into a single object
      return this.datapath.reduce((merged, item) => {
        return { ...merged, ...item }
      }, {})
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
    get index() {
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
    table: () => {
      const tableId = uuidv4()
      const table = new NestedTable(sm)

      // Store the table in our internal map
      tables.set(tableId, table)

      // Add cleanup on push to remove the table from our map
      //const originalPush = table.push
      table.push = () => {
        // Forward to the stepper's push method
        return stepper.push(table)
      }
      return table
    },
    // Shorthand for table()
    get t() {
      return stepper.table()
    },
    // Add transactionHistory getter to the stepper object
    get transactionHistory() {
      return _transactionHistory.value
    },
    get length() {
      return sm.countLeafNodes - 2
    },
    get nrows() {
      return sm.countLeafNodes
    },

    // Add new clearState method
    clear: () => {
      if (smilestore.local.pageTracker[page]) {
        // Remove the stepperState from the page tracker data
        const pageData = smilestore.local.pageTracker[page].data || {}
        delete pageData.stepperState
        smilestore.local.pageTracker[page].data = pageData

        // Clear all states and reset the state machine
        sm.clear()
        sm.push('SOS')
        sm.push('EOS')

        // Reset all internal refs
        _path.value = []
        _paths.value = ''
        _data.value = null
        _index.value = null
        _transactionHistory.value = []
        _stateMachine.value = visualizeStateMachine()

        // Clear component registry and tables
        componentRegistry.clear()
        tables.clear()
      }
    },
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
