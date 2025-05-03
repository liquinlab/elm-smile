import { StepState } from '@/core/stepper/StepState'
import config from '@/core/config'
import { StepperSerializer } from '@/core/stepper/StepperSerializer'
import StepperProxy from '@/core/stepper/StepperProxy'

// to be implemented functions

// some write operations should be named and only go once
// others should go repeatedly

// append() - done
// outer()  - done
// forEach()

// shuffle() important
// sample()

// zip()  helpful
// range() mid

// repeat()  tricky
// interleave()  low priority
// print()  low priority
// partition()  low priority

/**
 * @class Stepper
 * @extends StepState
 * @description A specialized version of StepState that provides stepper-specific functionality.
 * This class extends the base StepState to add stepper-specific operations and data handling.
 */
export class Stepper extends StepState {
  /**
   * Creates a new Stepper instance
   * @param {Object} [options] - Configuration options for the stepper
   * @param {*} [options.id] - The id for this node. If null, defaults to '/'
   * @param {StepState|null} [options.parent] - The parent node. If null, this is a root node
   * @param {string} [options.serializedState] - Optional serialized JSON state to load
   */
  constructor(options = {}) {
    const { id = null, parent = null, data = null, serializedState = null } = options
    super(id, parent, data)

    // If serialized state is provided, load it
    if (serializedState !== null) {
      this.loadFromJSON(serializedState)
    } else {
      // Initialize the state machine with SOS and EOS nodes
      if (this.depth === 0) {
        this.push('SOS')
        this.push('EOS')
      }
    }

    return new StepperProxy(this)
  }

  /**
   * Creates a new state instance. Overridden to return Stepper instances.
   * @protected
   * @param {*} id - The id for the new state
   * @param {StepState} parent - The parent state
   * @returns {Stepper} A new Stepper instance
   */
  _createNew(id, parent) {
    return new Stepper({ id, parent })
  }

  /**
   * Checks if any of the given items would create duplicate paths in the tree
   * @private
   * @param {Object|Array<Object>} items - Single object or array of objects to check for duplicates
   * @param {string} [items[].path] - Optional path property on each item
   * @returns {boolean} True if any items would create duplicate paths, false otherwise
   * @description
   * This method checks for duplicates in two ways:
   * 1. Checks for duplicate paths among the input items themselves
   * 2. Checks if any new items would create paths that already exist in the tree
   */
  _hasDuplicatePaths(items) {
    // Convert single item to array if needed
    const itemsToCheck = Array.isArray(items) ? items : [items]

    // First check for duplicates among the input items
    const seenPaths = new Set()
    for (const item of itemsToCheck) {
      if (item.path !== undefined) {
        if (seenPaths.has(item.path)) {
          return true
        }
        seenPaths.add(item.path)
      }
    }

    // Get all existing paths in the tree
    const existingPaths = this.existingPaths

    // Check if any new items would create duplicate paths with existing ones
    return itemsToCheck.some((item) => {
      // Create a temporary state to get its path
      let state
      if (item.path !== undefined) {
        state = new Stepper({ id: item.path, parent: this })
      } else {
        state = new Stepper({ parent: this })
      }
      state.data = item
      const newPath = state.pathString
      return existingPaths.has(newPath)
    })
  }

  /**
   * Creates a new state and assigns data to it
   * @private
   * @param {Object} item - The item to create a state for
   * @returns {Stepper} The newly created state
   */
  _addState(item) {
    let state
    // Create a new state with auto-incremented id
    if (item.path !== undefined) {
      // If at level 0, insert before EOS state
      if (this.depth === 0) {
        state = this.insert(item.path, -2, item)
      } else {
        state = this.push(item.path, item)
      }
    } else {
      // If at level 0, insert before EOS state
      if (this.depth === 0) {
        state = this.insert(null, -2, item)
      } else {
        state = this.push(null, item)
      }
    }
    return state
  }

  steps() {
    return this._root
  }

  /**
   * Appends one or more objects as new states to the current node
   * @param {Object|Array<Object>} items - Single object or array of objects to append as new states
   * @returns {Stepper} Returns this instance for method chaining
   * @throws {Error} If items is not an object or array, or if adding items would exceed maxStepperRows
   */
  append(items, options = {}) {
    console.log('append', items)
    // Convert single item to array if needed
    const itemsToAdd = Array.isArray(items) ? items : [items]

    // Check if adding these items would exceed maxStepperRows
    if (this._states.length + itemsToAdd.length > config.maxStepperRows) {
      throw new Error(`Cannot append ${itemsToAdd.length} items: would exceed maximum of ${config.maxStepperRows} rows`)
    }

    // Check for duplicates and throw error if found
    if (this._hasDuplicatePaths(itemsToAdd)) {
      throw new Error('Cannot append items: would create duplicate paths')
    }

    console.log('itemsToAdd', itemsToAdd)
    console.log('this.level', this.depth)
    itemsToAdd.forEach((item) => {
      this._addState(item)
    })

    return this
  }

  /**
   * Creates a factorial combination (Cartesian product) of all provided arrays.
   * Each combination will be a row in the resulting table.
   *
   * @param {Object} trials - Object with arrays as values
   * @param {Object} options - Options for handling the operation (reserved for future use)
   * @returns {Stepper} Returns this instance for method chaining
   * @throws {Error} If trials is not an object or if operation would exceed maxStepperRows
   */
  outer(trials, options = {}) {
    if (typeof trials !== 'object' || trials === null) {
      throw new Error('outer() requires an object with arrays as values')
    }

    const columns = Object.entries(trials)
    if (columns.length === 0) {
      throw new Error('outer() requires at least one column')
    }

    // Convert non-array values to single-element arrays
    const processedColumns = columns.map(([key, value]) => {
      if (Array.isArray(value)) return [key, value]
      return [key, [value]]
    })

    // Calculate total number of combinations
    const totalCombinations = processedColumns.reduce((total, [_, arr]) => total * arr.length, 1)

    // Check if adding these combinations would exceed maxStepperRows
    if (this._states.length + totalCombinations > config.maxStepperRows) {
      throw new Error(
        `Cannot create ${totalCombinations} combinations: would exceed maximum of ${config.maxStepperRows} rows`
      )
    }

    // Helper function to generate combinations
    function generateCombinations(arrays) {
      if (arrays.length === 0) return [{}]

      const [key, values] = arrays[0]
      const rest = arrays.slice(1)
      const restCombinations = generateCombinations(rest)

      return values.flatMap((value) =>
        restCombinations.map((combo) => ({
          [key]: value,
          ...combo,
        }))
      )
    }

    const outerRows = generateCombinations(processedColumns)

    // Check for duplicates and throw error if found
    if (this._hasDuplicatePaths(outerRows)) {
      throw new Error('Cannot create outer product: would create duplicate paths')
    }

    // Add each combination as a new state
    outerRows.forEach((row) => {
      this._addState(row)
    })

    return this
  }

  /**
   * Executes a function once for each item in the table.
   * Returns the table for chaining.
   *
   * @param {Function} callback - Function to execute for each element
   * @param {Stepper} callback.item - The current item being processed
   * @param {number} callback.index - The index of the current item
   * @returns {Stepper} The current instance for chaining
   */
  forEach(callback) {
    this.states.forEach((item, index) => {
      // Skip SOS and EOS states when at depth 0
      if (this.depth === 0 && (index === 0 || index === this.states.length - 1)) {
        return
      }
      
      // Call the callback and check if it returns a new value
      const result = callback(item, index)
      if (result !== undefined) {
        // If result is an object with properties from the proxy, extract just the data properties
        if (typeof result === 'object' && result !== null) {
          // Create a new data object by starting with the original data
          const newData = { ...item.data }

          // Add or update properties from the result object
          // This allows new properties to be added that weren't in the original data
          Object.keys(result).forEach((key) => {
            // Only copy properties that are not internal properties of the Stepper
            if (
              key !== '_id' &&
              key !== '_states' &&
              key !== '_parent' &&
              key !== '_path' &&
              key !== 'data' &&
              typeof result[key] !== 'function'
            ) {
              newData[key] = result[key]
            }
          })

          // Check for duplicate paths before updating
          if (this._hasDuplicatePaths([newData])) {
            throw new Error('Cannot update item: would create duplicate paths')
          }

          item.data = newData
        }
      }
    })
    return this
  }

  /**
   * Serializes the StepState object to a JSON string.
   * @returns {string} A JSON representation of the StepState object
   */
  get json() {
    return StepperSerializer.serialize(this)
  }

  /**
   * Deserializes a JSON string to a StepState object.
   * @param {string} data - The JSON string to deserialize
   */
  loadFromJSON(data) {
    StepperSerializer.deserialize(data, this, this)
  }

  /**
   * Visualizes the Stepper object as a tree structure.
   * Used by the dev bar to display the stepper tree.
   * @returns {Object} A clean object representation of the Stepper tree
   */
  visualize() {
    // Helper function to recursively process each state
    const processState = (state, level = 0) => {
      // Create a clean object without currentIndex, depth, and parent
      const cleanState = {
        data: state.data,
        pathdata: state.pathData,
        path: state.pathString,
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

    // Process the root state
    return processState(this.root)
  }
}

export default Stepper
