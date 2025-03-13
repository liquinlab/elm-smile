import { ref, computed } from 'vue'
import useSmileStore from '@/core/stores/smilestore'
import { useRoute } from 'vue-router'
import { StepperStateMachine } from '@/core/composables/StepperStateMachine'
import NestedTable from '@/core/composables/NestedTable'
import { v4 as uuidv4 } from 'uuid'

export function useHStepper() {
  const smilestore = useSmileStore()
  const route = useRoute()
  const page = route.name

  // this activates the stepper for the page in the dev tools
  smilestore.dev.page_provides_trial_stepper = true

  // Create instances of our state managers
  const sm = new StepperStateMachine()

  // Internal table management
  const tables = new Map()

  // Register page tracker if not already registered
  smilestore.registerPageTracker(page)

  // // Try to load existing state from smilestore
  // const savedState = smilestore.getPageTrackerData(page)?.stepperState
  // if (savedState) {
  //   log.log('STEPPER: Loading saved state from smilestore')
  //   sm.loadFromJSON(savedState)
  // }

  // Get all protected methods from a temporary table instance
  const PROTECTED_METHODS = new NestedTable(sm).getProtectedTableMethods()

  // Internal reactive refs
  const _currentValue = ref(null)
  const _currentPath = ref('')

  // Create the stepper object that will be returned
  const stepper = {
    // Navigation methods
    next: () => {
      const nextValue = sm.next()
      if (nextValue !== null) {
        _currentValue.value = sm.getDataAlongPath()
        _currentPath.value = sm.getCurrentPathStr()
      } else {
        _currentValue.value = null
        _currentPath.value = null
      }
      return nextValue
    },
    prev: () => {
      const prevValue = sm.prev()
      if (prevValue !== null) {
        _currentValue.value = sm.getDataAlongPath()
        _currentPath.value = sm.getCurrentPathStr()
      } else {
        _currentValue.value = null
        _currentPath.value = null
      }
      return prevValue
    },
    reset: () => {
      sm.reset()
      if (sm.stepState.states.length > 0) {
        sm.next() // Move to first state after reset
        _currentValue.value = sm.getDataAlongPath()
        _currentPath.value = sm.getCurrentPathStr()
      } else {
        _currentValue.value = null
        _currentPath.value = ''
      }
    },
    // Push method for directly pushing a table to the state machine
    push: (table) => {
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
        // Get the starting index for appending new items (preserves existing items)
        const startIndex = parentState.states.length

        // Get all items at this level
        for (let i = 0; i < nestedTable._items.length; i++) {
          const item = nestedTable._items[i]

          // Create a new state in the state machine, using startIndex + i to ensure unique indices
          const state = parentState.push(startIndex + i)

          // Set data for this item
          if (item.data !== undefined) {
            state.setData(item.data)
          }

          // Process child items if they exist - need to handle all nested elements
          // NestedTable items are stored directly in the _items array
          if (item._items && item._items.length > 0) {
            processTable(item, state, level + 1)
          }
        }
      }

      // Process the root table - appends to existing structure
      processTable(table, sm.stepState)

      // Set the table to read-only
      table.setReadOnly()

      // Reset the state machine to prepare for navigation
      sm.reset()

      // Navigate through the structure - first to top level
      if (sm.stepState.states.length > 0) {
        sm.next()

        // Then try to navigate to the first child if there are nested elements
        // This simulates navigating through the structure: 0-0, 0-1, etc.
        let currentSm = sm
        let currentIndex = 0

        // Check if the current state has child states
        while (currentSm && currentSm.stepState.currentIndex >= 0 && currentSm.stepState.states.length > 0) {
          // Get the index of the current state
          currentIndex = currentSm.stepState.currentIndex

          // Get the state machine for the current index
          const childSm = currentSm[currentIndex]

          // If the child state machine has states, navigate to its first state
          if (childSm && childSm.stepState.states.length > 0) {
            childSm.next()
            currentSm = childSm
          } else {
            // Break the loop if there are no more child states
            break
          }
        }

        // Update the current value and path
        _currentValue.value = sm.getDataAlongPath()
        _currentPath.value = sm.getCurrentPathStr()
      }

      return table
    },
    // Expose current and index as computed properties
    get current() {
      return _currentValue.value === null ? null : _currentValue.value || []
    },
    get index() {
      return _currentPath.value
    },
    // Expose state machine with wrapped getData
    get sm() {
      return sm
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
  }

  // Add protected methods to the stepper instance
  PROTECTED_METHODS.forEach((method) => {
    Object.defineProperty(stepper, method, {
      get() {
        throw new Error(`${method}() must be called after table()`)
      },
    })
  })

  return stepper
}

export default useHStepper
