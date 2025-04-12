/**
 * @module NestedTable
 * @description A module providing a hierarchical data structure for managing nested tables and data operations.
 * Provides functionality for:
 * - Managing nested data structures
 * - Performing hierarchical operations
 * - Tracking paths and relationships
 * - Handling data transformations
 *
 * The NestedTable structure enables:
 * - Chainable operations on nested data
 * - Path-based data access and modification
 * - Parent-child relationship tracking
 * - Flexible data storage and retrieval
 *
 * Used with StepState and HStepper for complex hierarchical data management.
 */
import seedrandom from 'seedrandom'
import config from '@/core/config'
import { v4 as uuidv4 } from 'uuid'

// Helper function to handle array padding/looping
/**
 * Adjusts an array to a target length by either padding or looping its contents
 * @param {Array} arr - The input array to adjust
 * @param {number} targetLength - The desired length of the output array
 * @param {string} [method='pad'] - The method to use: 'pad' or 'loop'
 * @param {*} [padValue=undefined] - Value to pad with when using 'pad' method. If undefined, uses last array element
 * @returns {Array} A new array of the target length
 * @example
 * // Pad with last value
 * adjustArrayLength([1,2], 4) // returns [1,2,2,2]
 * // Pad with specific value
 * adjustArrayLength([1,2], 4, 'pad', 0) // returns [1,2,0,0]
 * // Loop values
 * adjustArrayLength([1,2], 5, 'loop') // returns [1,2,1,2,1]
 */
function adjustArrayLength(arr, targetLength, method = 'pad', padValue = undefined) {
  if (arr.length >= targetLength) return arr.slice(0, targetLength)

  if (method === 'loop') {
    const result = []
    while (result.length < targetLength) {
      result.push(...arr)
    }
    return result.slice(0, targetLength)
  } else {
    // pad
    const valueToPad = padValue === undefined ? arr[arr.length - 1] : padValue
    return [...arr, ...Array(targetLength - arr.length).fill(valueToPad)]
  }
}

/**
 * @class NestedTable
 * @description A chainable, tree-like data structure that allows nested operations,
 * hierarchical data storage, and flexible path-based access. This structure enables
 * complex nested data operations while maintaining intuitive access patterns.
 */
class NestedTable {
  /**
   * Creates a new NestedTable instance.
   *
   * @param {Object} sm - State machine reference that will be used for operations requiring application state
   * @param {*} [data=undefined] - Optional data value to store at this node
   * @param {NestedTable|null} [parent=null] - Parent node reference for traversing up the tree
   * @param {Array<number>} [path=[]] - Path indices to reach this node from the root
   * @param {boolean} [readOnly=false] - Whether the table is read-only (prevents modifications)
   */
  constructor(sm, data = undefined, parent = null, path = [], readOnly = false) {
    // State machine reference
    this.sm = sm

    // Internal array to store items
    this._items = []

    // The data property for this node
    this.data = data

    // Parent reference for tracking the path
    this._parent = parent

    // Path indices to get to this node
    this._path = path

    // Unique ID for this node to help with comparison
    this._id = uuidv4()

    // Read-only status - inherit from parent if parent is read-only
    this._readOnly = readOnly || (parent && parent._readOnly) || false

    // Store a reference to the proxy to be returned from methods
    let selfProxy

    // Create a proxy to handle array access and method calls
    selfProxy = new Proxy(this, {
      /**
       * Trap for property access - handles all the special properties and array-like access
       *
       * @param {NestedTable} target - The target object (this instance)
       * @param {string|symbol} prop - The property being accessed
       * @returns {*} The value of the property or a function
       */
      get: (target, prop) => {
        // Handle Symbol properties
        if (typeof prop === 'symbol') {
          if (prop === Symbol.iterator) {
            return target[Symbol.iterator].bind(target)
          }
          if (prop === Symbol.isConcatSpreadable) {
            return true
          }
          return target[prop]
        }

        // Handle numeric indices
        if (typeof prop === 'string' && !isNaN(prop)) {
          const index = parseInt(prop)

          // If the index exists, return it
          if (index < target._items.length && index >= 0) {
            return target._items[index]
          }

          // Return undefined for out-of-bounds access (matching JavaScript array behavior)
          return undefined
        }

        // Handle append method
        if (prop === 'append') {
          /**
           * Adds a new item to the table with the specified value.
           *
           * @param {*} value - The value to store in the new node. Can be a single value, array of values, or another NestedTable
           * @returns {NestedTable} The current instance for chaining
           */
          return (value) => {
            // Check if table is read-only
            target._checkReadOnly()

            // Calculate how many items we'll be adding
            let itemsToAdd = 0
            if (value instanceof NestedTable) {
              itemsToAdd = value.length
            } else {
              itemsToAdd = Array.isArray(value) ? value.length : 1
            }

            // Check if initial value exceeds limit
            if (itemsToAdd > config.maxStepperRows) {
              throw new Error(
                `Cannot append ${itemsToAdd} rows as it exceeds the safety limit of ${config.maxStepperRows}. Consider reducing the number of rows to append.`
              )
            }

            // Check if appending would exceed limit
            const newLength = target._items.length + itemsToAdd
            if (newLength > config.maxStepperRows) {
              throw new Error(
                `append() would generate ${newLength} rows, which exceeds the safety limit of ${config.maxStepperRows}. Consider reducing the number of rows to append.`
              )
            }

            // Handle NestedTable instances by copying their rows' data
            if (value instanceof NestedTable) {
              const rowsData = value.rowsdata
              for (let i = 0; i < rowsData.length; i++) {
                const index = target._items.length
                const newPath = [...target._path, index]
                const newNode = new NestedTable(target.sm, rowsData[i], target, newPath, target._readOnly)
                target._items.push(newNode)
              }
              return selfProxy
            }

            // Handle regular values
            const values = Array.isArray(value) ? value : [value]
            for (let i = 0; i < values.length; i++) {
              const index = target._items.length
              const newPath = [...target._path, index]
              const newNode = new NestedTable(target.sm, values[i], target, newPath, target._readOnly)
              target._items.push(newNode)
            }

            return selfProxy
          }
        }

        if (prop === 'forEach') {
          /**
           * Executes a function once for each item in the table.
           * Returns the table for chaining.
           *
           * @param {Function} callback - Function to execute for each element
           * @param {NestedTable} callback.item - The current item being processed
           * @param {number} callback.index - The index of the current item
           * @returns {NestedTable} The current instance for chaining
           */
          return (callback) => {
            // Check if table is read-only
            target._checkReadOnly()

            target._items.forEach((item, index) => {
              // Create a proxy for the item that handles property mutations and method access
              const itemProxy = new Proxy(item, {
                get: (itemTarget, itemProp) => {
                  // Handle data property access
                  if (itemProp === 'data') {
                    return itemTarget.data
                  }
                  // Handle chainable methods
                  if (typeof itemTarget[itemProp] === 'function') {
                    return itemTarget[itemProp].bind(itemTarget)
                  }
                  // Handle data property direct access
                  if (itemTarget.data && itemProp in itemTarget.data) {
                    return itemTarget.data[itemProp]
                  }
                  // Pass through any other properties
                  return itemTarget[itemProp]
                },
                set: (itemTarget, itemProp, value) => {
                  if (itemProp === 'data') {
                    itemTarget.data = value
                  } else {
                    itemTarget.data = { ...itemTarget.data, [itemProp]: value }
                  }
                  return true
                },
              })

              // Call the callback and check if it returns a new value
              const result = callback(itemProxy, index)
              if (result !== undefined) {
                // If result is an object with properties from the proxy, extract just the data properties
                if (typeof result === 'object' && result !== null) {
                  // Create a new data object by starting with the original data
                  const newData = { ...item.data }

                  // Add or update properties from the result object
                  // This allows new properties to be added that weren't in the original data
                  Object.keys(result).forEach((key) => {
                    // Only copy properties that are not internal properties of the NestedTable
                    if (
                      key !== '_id' &&
                      key !== '_items' &&
                      key !== '_parent' &&
                      key !== '_path' &&
                      key !== 'sm' &&
                      key !== 'data' &&
                      key !== '_readOnly' &&
                      typeof result[key] !== 'function'
                    ) {
                      newData[key] = result[key]
                    }
                  })

                  item.data = newData
                }
              }
            })
            return selfProxy
          }
        }

        if (prop === 'zip') {
          /**
           * Combines multiple arrays into a single table by matching elements at corresponding indices.
           * Supports different methods for handling arrays of different lengths.
           *
           * @param {Object} trials - Object with arrays as values
           * @param {Object} options - Options for handling arrays of different lengths
           * @param {string} options.method - Method to use: 'loop', 'pad', or 'last'
           * @param {*} options.padValue - Value to use for padding when method is 'pad'
           * @returns {NestedTable} The current instance for chaining
           */
          return (trials, options = {}) => {
            // Check if table is read-only
            target._checkReadOnly()

            if (typeof trials !== 'object' || trials === null) {
              throw new Error('zip() requires an object with arrays as values')
            }

            const columns = Object.entries(trials)
            if (columns.length === 0) {
              throw new Error('zip() requires at least one column')
            }

            // Convert non-array values to single-element arrays
            const processedColumns = columns.map(([key, value]) => {
              if (Array.isArray(value)) return [key, value]
              return [key, [value]]
            })

            // Get the maximum length of any column
            const maxLength = Math.max(...processedColumns.map(([_, arr]) => arr.length))

            // Check safety limit first
            const newLength = target._items.length + maxLength
            if (newLength > config.maxStepperRows) {
              throw new Error(
                `zip() would generate ${newLength} rows, which exceeds the safety limit of ${config.maxStepperRows}. Consider reducing the number of values in your arrays.`
              )
            }

            // Check if any column has a different length
            const hasDifferentLengths = processedColumns.some(([_, arr]) => arr.length !== maxLength)

            // By default, throw error if lengths are different
            if (hasDifferentLengths && !options.method) {
              throw new Error(
                'All columns must have the same length when using zip(). Specify a method (loop, pad, last) to handle different lengths.'
              )
            }

            // Process each column according to the specified method
            const processedArrays = processedColumns.map(([key, arr]) => {
              if (arr.length === maxLength) return arr

              const method = options.method
              const padValue = options.padValue

              if (method === 'loop') {
                return adjustArrayLength(arr, maxLength, 'loop')
              } else if (method === 'pad') {
                if (padValue === undefined) {
                  throw new Error('padValue is required when using the pad method')
                }
                return adjustArrayLength(arr, maxLength, 'pad', padValue)
              } else if (method === 'last') {
                return adjustArrayLength(arr, maxLength, 'pad', arr[arr.length - 1])
              } else {
                throw new Error(`Invalid method: ${method}. Must be one of: loop, pad, last`)
              }
            })

            // Create the zipped rows
            const zippedRows = Array(maxLength)
              .fill(null)
              .map((_, i) => {
                const row = {}
                processedColumns.forEach(([key], colIndex) => {
                  row[key] = processedArrays[colIndex][i]
                })
                return row
              })

            // Add the zipped rows to the table
            for (let i = 0; i < zippedRows.length; i++) {
              const index = target._items.length
              const newPath = [...target._path, index]
              const newNode = new NestedTable(target.sm, zippedRows[i], target, newPath, target._readOnly)
              target._items.push(newNode)
            }

            return selfProxy
          }
        }

        if (prop === 'range') {
          /**
           * Creates a sequence of n items with incrementing values.
           * Each item will have a field (default 'range') set to its index.
           *
           * @param {number} n - Number of items to create
           * @param {string} [fieldName='range'] - Name of the field to store the index
           * @returns {NestedTable} The current instance for chaining
           * @throws {Error} If n is not a positive integer or exceeds safety limit
           */
          return (n, fieldName = 'range') => {
            // Check if table is read-only
            target._checkReadOnly()

            if (n <= 0) {
              throw new Error('range() must be called with a positive integer')
            }

            // Check if n exceeds safety limit
            if (n > config.maxStepperRows) {
              throw new Error(
                `Cannot append ${n} rows as it exceeds the safety limit of ${config.maxStepperRows}. Consider reducing the number of rows to append.`
              )
            }

            // Clear existing items
            target._items = []

            // Create n new items with incrementing values
            for (let i = 0; i < n; i++) {
              const newPath = [...target._path, i]
              const newNode = new NestedTable(target.sm, { [fieldName]: i }, target, newPath, target._readOnly)
              target._items.push(newNode)
            }

            return selfProxy
          }
        }

        if (prop === 'repeat') {
          /**
           * Repeats the current rows n times, creating deep copies of all elements.
           *
           * @param {number} n - Number of times to repeat the current rows
           * @returns {NestedTable} The current instance for chaining
           * @throws {Error} If n is not positive or if operation would exceed max rows
           */
          return (n) => {
            // Check if table is read-only
            target._checkReadOnly()

            if (n <= 0 || target._items.length === 0) return selfProxy

            const totalRows = target._items.length * n
            if (totalRows > config.maxStepperRows) {
              throw new Error(
                `repeat() would generate ${totalRows} rows, which exceeds the safety limit of ${config.maxStepperRows}. Consider reducing the repeat count.`
              )
            }

            // Store original items
            const originalItems = [...target._items]

            // Helper function to deep copy a NestedTable node
            const deepCopyNode = (node) => {
              // Create new node with copied data
              const newNode = new NestedTable(
                node.sm,
                JSON.parse(JSON.stringify(node.data)),
                node._parent,
                [...node._path],
                node._readOnly
              )

              // Deep copy all child items
              newNode._items = node._items.map((child) => deepCopyNode(child))

              // Update parent references and paths for children
              newNode._items.forEach((child, index) => {
                child._parent = newNode
                child._path = [...newNode._path, index]
              })

              return newNode
            }

            // Add n-1 copies of the original items
            for (let i = 1; i < n; i++) {
              const newItems = originalItems.map((item) => {
                const newItem = deepCopyNode(item)
                // Update the path for the new copy
                const baseIndex = target._items.length
                newItem._path = [...target._path, baseIndex]
                return newItem
              })
              target._items.push(...newItems)
            }

            return selfProxy
          }
        }

        if (prop === 'shuffle') {
          /**
           * Shuffles the current rows using the Fisher-Yates algorithm.
           * If a seed is provided, ensures deterministic shuffling.
           *
           * @param {string} [seed] - Optional seed for deterministic shuffling
           * @returns {NestedTable} The current instance for chaining
           */
          return (seed) => {
            // Check if table is read-only
            target._checkReadOnly()

            if (target._items.length <= 1) return selfProxy

            // Only create a new RNG if a seed is provided
            // Otherwise use the global Math.random
            const rng = seed ? seedrandom(seed) : Math.random

            // Fisher-Yates shuffle algorithm
            for (let i = target._items.length - 1; i > 0; i--) {
              const j = Math.floor(rng() * (i + 1))
              ;[target._items[i], target._items[j]] = [target._items[j], target._items[i]]

              // Update paths to reflect new positions
              target._items[i]._path = [...target._path, i]
              target._items[j]._path = [...target._path, j]
            }

            return selfProxy
          }
        }

        if (prop === 'sample') {
          /**
           * Samples rows from the table according to the specified sampling method.
           * Creates deep copies of the sampled items and preserves parent relationships.
           *
           * @param {Object} options - Options for the sampling operation
           * @param {string} [options.type='without-replacement'] - Sampling type: 'with-replacement', 'without-replacement', 'fixed-repetitions', 'alternate-groups', or 'custom'
           * @param {number} [options.size] - Number of samples to take (required for most sampling types)
           * @param {Array<number>} [options.weights] - Optional weights for weighted sampling
           * @param {Array<Array<number>>} [options.groups] - Required for 'alternate-groups' sampling
           * @param {boolean} [options.randomize_group_order=false] - Whether to randomize group order in 'alternate-groups' sampling
           * @param {Function} [options.fn] - Required for 'custom' sampling
           * @param {string} [options.seed] - Optional seed for deterministic sampling
           * @returns {NestedTable} The current instance for chaining
           * @throws {Error} If invalid options are provided or operation would exceed max rows
           */
          return (options = {}) => {
            // Check if table is read-only
            target._checkReadOnly()

            if (target._items.length === 0) return selfProxy

            const type = options.type || 'without-replacement'
            const size = options.size
            const weights = options.weights
            const groups = options.groups
            const randomize_group_order = options.randomize_group_order || false
            const fn = options.fn
            const seed = options.seed

            // Only create a new RNG if a seed is provided
            // Otherwise use the global Math.random
            const rng = seed ? seedrandom(seed) : Math.random

            // Check safety limit first
            if (size && size > config.maxStepperRows) {
              throw new Error(
                `sample() would generate ${size} rows, which exceeds the safety limit of ${config.maxStepperRows}. Consider reducing the sample size.`
              )
            }

            // Helper function to deep copy a NestedTable node
            const deepCopyNode = (node) => {
              // Create new node with copied data
              const newNode = new NestedTable(
                node.sm,
                JSON.parse(JSON.stringify(node.data)),
                target,
                [...target._path],
                target._readOnly
              )

              // Deep copy all child items
              newNode._items = node._items.map((child) => deepCopyNode(child))

              // Update parent references and paths for children
              newNode._items.forEach((child, index) => {
                child._parent = newNode
                child._path = [...newNode._path, index]
              })

              return newNode
            }

            // Array to hold the indices of sampled rows
            let sampledIndices = []

            switch (type) {
              case 'with-replacement':
                if (!size) throw new Error('size parameter is required for with-replacement sampling')
                sampledIndices = Array(size)
                  .fill(null)
                  .map(() => {
                    if (weights) {
                      // Validate weights array length
                      if (weights.length !== target._items.length) {
                        throw new Error('Weights array length must match the number of rows')
                      }
                      // Weighted sampling
                      const totalWeight = weights.reduce((a, b) => a + b, 0)
                      let random = rng() * totalWeight
                      for (let i = 0; i < weights.length; i++) {
                        random -= weights[i]
                        if (random <= 0) return i
                      }
                      return target._items.length - 1 // Fallback
                    }
                    return Math.floor(rng() * target._items.length)
                  })
                break

              case 'without-replacement':
                if (!size) throw new Error('size parameter is required for without-replacement sampling')
                if (size > target._items.length) {
                  throw new Error('Sample size cannot be larger than the number of available rows')
                }
                sampledIndices = Array.from({ length: target._items.length }, (_, i) => i)
                // Fisher-Yates shuffle
                for (let i = sampledIndices.length - 1; i > 0; i--) {
                  const j = Math.floor(rng() * (i + 1))
                  ;[sampledIndices[i], sampledIndices[j]] = [sampledIndices[j], sampledIndices[i]]
                }
                sampledIndices = sampledIndices.slice(0, size)
                break

              case 'fixed-repetitions':
                if (!size) throw new Error('size parameter is required for fixed-repetitions sampling')
                sampledIndices = []
                for (let i = 0; i < target._items.length; i++) {
                  for (let j = 0; j < size; j++) {
                    sampledIndices.push(i)
                  }
                }
                // Shuffle the result
                for (let i = sampledIndices.length - 1; i > 0; i--) {
                  const j = Math.floor(rng() * (i + 1))
                  ;[sampledIndices[i], sampledIndices[j]] = [sampledIndices[j], sampledIndices[i]]
                }
                break

              case 'alternate-groups':
                if (!groups) throw new Error('groups parameter is required for alternate-groups sampling')
                if (!Array.isArray(groups) || groups.length < 2) {
                  throw new Error('groups must be an array with at least two groups')
                }

                // Validate group indices
                groups.forEach((group, groupIndex) => {
                  if (!Array.isArray(group)) {
                    throw new Error(`Group ${groupIndex} must be an array`)
                  }
                  group.forEach((index) => {
                    if (index < 0 || index >= target._items.length) {
                      throw new Error(`Invalid index ${index} in group ${groupIndex}`)
                    }
                  })
                })

                // Randomize group order if requested
                const groupOrder = randomize_group_order
                  ? (() => {
                      const indices = Array.from({ length: groups.length }, (_, i) => i)
                      for (let i = indices.length - 1; i > 0; i--) {
                        const j = Math.floor(rng() * (i + 1))
                        ;[indices[i], indices[j]] = [indices[j], indices[i]]
                      }
                      return indices
                    })()
                  : Array.from({ length: groups.length }, (_, i) => i)

                sampledIndices = []
                const maxGroupSize = Math.max(...groups.map((g) => g.length))

                if (randomize_group_order) {
                  // When randomizing group order, take all items from each group in sequence
                  for (const groupIndex of groupOrder) {
                    const group = groups[groupIndex]
                    for (let i = 0; i < group.length; i++) {
                      sampledIndices.push(group[i])
                    }
                  }
                } else {
                  // When not randomizing, alternate between groups one item at a time
                  for (let i = 0; i < maxGroupSize; i++) {
                    for (const groupIndex of groupOrder) {
                      const group = groups[groupIndex]
                      if (i < group.length) {
                        sampledIndices.push(group[i])
                      }
                    }
                  }
                }
                break

              case 'custom':
                if (!fn) throw new Error('fn parameter is required for custom sampling')
                if (typeof fn !== 'function') {
                  throw new Error('fn must be a function')
                }
                const customIndices = Array.from({ length: target._items.length }, (_, i) => i)
                const customOrder = fn(customIndices, rng)
                if (!Array.isArray(customOrder)) {
                  throw new Error('Custom sampling function must return an array')
                }
                // Validate custom indices instead of filtering them
                customOrder.forEach((i) => {
                  if (i < 0 || i >= target._items.length) {
                    throw new Error(`Invalid index ${i} returned by custom sampling function`)
                  }
                })
                sampledIndices = customOrder
                break

              default:
                throw new Error(
                  `Invalid sampling type: ${type}. Must be one of: with-replacement, without-replacement, fixed-repetitions, alternate-groups, custom`
                )
            }

            // Store original items
            const originalItems = [...target._items]

            // Create new items based on the sampled indices
            const newItems = sampledIndices.map((index, newIndex) => {
              const originalItem = originalItems[index]
              const newItem = deepCopyNode(originalItem)

              // Update the path for the new position
              newItem._path = [...target._path, newIndex]
              newItem._parent = target

              return newItem
            })

            // Replace the items with the sampled ones
            target._items = newItems

            return selfProxy
          }
        }

        if (prop === 'interleave') {
          return (input) => {
            // Check if table is read-only
            target._checkReadOnly()

            let inputItems = []

            // Helper function to deep copy a NestedTable node
            const deepCopyNode = (node) => {
              // Create new node with copied data
              const newNode = new NestedTable(
                target.sm,
                JSON.parse(JSON.stringify(node.data)),
                target,
                [...target._path],
                target._readOnly
              )

              // Deep copy all child items
              newNode._items = node._items.map((child) => deepCopyNode(child))

              // Update parent references and paths for children
              newNode._items.forEach((child, index) => {
                child._parent = newNode
                child._path = [...newNode._path, index]
              })

              return newNode
            }

            // Handle different input types
            if (Array.isArray(input)) {
              // Create NestedTable nodes from array elements
              inputItems = input.map((data) => {
                return new NestedTable(target.sm, data, target, [], target._readOnly)
              })
            } else if (input && input._items) {
              // Deep copy nodes from another table
              inputItems = input._items.map((node) => deepCopyNode(node))
            } else if (input && typeof input === 'object') {
              // Create a single NestedTable node from object
              inputItems = [new NestedTable(target.sm, input, target, [], target._readOnly)]
            } else {
              throw new Error('interleave() requires an array, table, or object as input')
            }

            // Check if the operation would exceed max rows
            const newLength = target._items.length + inputItems.length
            if (newLength > config.maxStepperRows) {
              throw new Error(
                `interleave() would generate ${newLength} rows, which exceeds the safety limit of ${config.maxStepperRows}. Consider reducing the number of rows to interleave.`
              )
            }

            // Perform the interleaving
            const maxLength = Math.max(target._items.length, inputItems.length)
            const result = []

            for (let i = 0; i < maxLength; i++) {
              if (i < target._items.length) {
                result.push(target._items[i])
              }
              if (i < inputItems.length) {
                result.push(inputItems[i])
              }
            }

            // Update paths for all items in the result
            result.forEach((item, index) => {
              item._parent = target
              item._path = [...target._path, index]
            })

            target._items = result
            return selfProxy
          }
        }

        if (prop === 'outer') {
          /**
           * Creates a factorial combination (Cartesian product) of all provided arrays.
           * Each combination will be a row in the resulting table.
           *
           * @param {Object} trials - Object with arrays as values
           * @param {Object} options - Options for handling the operation (reserved for future use)
           * @returns {NestedTable} The current instance for chaining
           * @throws {Error} If the operation would exceed the max rows limit
           */
          return (trials, options = {}) => {
            // Check if table is read-only
            target._checkReadOnly()

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

            // Check safety limit first
            const newLength = target._items.length + totalCombinations
            if (newLength > config.maxStepperRows) {
              throw new Error(
                `outer() would generate ${totalCombinations} combinations, which exceeds the safety limit of ${config.maxStepperRows}. Consider using zip() or reducing the number of values in your arrays.`
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

            // Add the generated combinations as rows to the table
            for (let i = 0; i < outerRows.length; i++) {
              const index = target._items.length
              const newPath = [...target._path, index]
              const newNode = new NestedTable(target.sm, outerRows[i], target, newPath, target._readOnly)
              target._items.push(newNode)
            }

            return selfProxy
          }
        }

        if (prop === 'print') {
          /**
           * Prints the table structure to the console with proper indentation for nested tables.
           *
           * @param {number} [indent=0] - The indentation level to start with
           * @returns {NestedTable} The current instance for chaining
           */
          return (indent = 0) => {
            const indentStr = '  '.repeat(indent)
            console.log(`${indentStr}Table with ${target._items.length} rows:`)

            // Helper function to format data for display
            const formatData = (data) => {
              if (data === undefined) return 'undefined'
              if (data === null) return 'null'
              if (typeof data === 'object') {
                // Filter out methods and symbols, only keep data properties
                const cleanData = {}
                for (const key in data) {
                  // Skip methods and symbols
                  if (typeof data[key] !== 'function' && typeof key === 'string') {
                    cleanData[key] = data[key]
                  }
                }
                return cleanData
              }
              return data
            }

            // Helper function to print a nested table
            const printNestedTable = (node, level) => {
              const levelIndent = '  '.repeat(level)

              // Print each item at this level
              node._items.forEach((item, idx) => {
                console.log(`${levelIndent}[${idx}]:`, formatData(item.data))

                // If this item has children, recursively print them
                if (item._items && item._items.length > 0) {
                  console.log(`${levelIndent}  Nested table with ${item._items.length} rows:`)
                  printNestedTable(item, level + 1)
                }
              })
            }

            // Start the recursive printing
            printNestedTable(target, indent)

            // Return the proxy for chaining
            return selfProxy
          }
        }

        if (prop === 'partition') {
          /**
           * Partitions the current table into n groups, reorganizing the structure.
           * Creates a new set of rows, each containing an equal number of the original items.
           *
           * @param {number} n - Number of partitions to create
           * @returns {NestedTable} The current instance for chaining
           * @throws {Error} If the table size is not divisible by n or n <= 0
           */
          return (n) => {
            // Check if table is read-only
            target._checkReadOnly()

            if (n <= 0) {
              throw new Error('partition() must be called with a positive integer')
            }

            const origItemCount = target._items.length

            // If table is empty or n=1, do nothing and return
            if (origItemCount === 0 || n === 1) {
              return selfProxy
            }

            // Check if table size is divisible by n
            if (origItemCount % n !== 0) {
              throw new Error(`Table size (${origItemCount}) is not divisible by ${n}`)
            }

            // Calculate how many items per partition
            const itemsPerPartition = Math.floor(origItemCount / n)

            // Store the original items
            const originalItems = [...target._items]

            // Helper function to deep copy a NestedTable node
            const deepCopyNode = (node, newParent, newPath) => {
              // Create new node with copied data
              const newNode = new NestedTable(
                node.sm,
                JSON.parse(JSON.stringify(node.data)),
                newParent,
                newPath,
                node._readOnly
              )

              // Deep copy all child items
              newNode._items = node._items.map((child, childIndex) => {
                return deepCopyNode(child, newNode, [...newPath, childIndex])
              })

              return newNode
            }

            // Clear existing items
            target._items = []

            // Create n new partition rows
            for (let i = 0; i < n; i++) {
              const partitionPath = [...target._path, i]
              const partition = new NestedTable(target.sm, { partition: i }, target, partitionPath, target._readOnly)
              target._items.push(partition)

              // Add the appropriate original items to this partition
              const startIdx = i * itemsPerPartition
              const endIdx = startIdx + itemsPerPartition

              for (let j = startIdx; j < endIdx; j++) {
                const originalItem = originalItems[j]
                const newItemPath = [...partitionPath, j - startIdx]

                // Deep copy the item and its children
                const newItem = deepCopyNode(originalItem, partition, newItemPath)

                // Add to the partition
                partition._items.push(newItem)
              }
            }

            return selfProxy
          }
        }

        if (prop === 'setReadOnly') {
          /**
           * Sets the table to read-only mode, preventing further modifications.
           * Navigates to the root parent first to ensure the entire nested structure becomes read-only.
           *
           * @param {boolean} [recursive=true] - Whether to also set all child tables to read-only
           * @returns {NestedTable} The current instance for chaining
           */
          return (recursive = true) => {
            // Find the root parent node
            let rootNode = target
            while (rootNode._parent !== null) {
              rootNode = rootNode._parent
            }

            // Set the root node to read-only
            rootNode._readOnly = true

            // Recursively set all child tables to read-only if requested
            if (recursive) {
              const setChildrenReadOnly = (node) => {
                if (node._items && node._items.length > 0) {
                  node._items.forEach((item) => {
                    item._readOnly = true
                    setChildrenReadOnly(item)
                  })
                }
              }

              // Start the recursive setting from the root
              setChildrenReadOnly(rootNode)
            }

            return selfProxy
          }
        }

        // Return the original property or method
        return target[prop]
      },

      /**
       * Trap for property assignment - handles setting values on the NestedTable
       *
       * @param {NestedTable} target - The target object (this instance)
       * @param {string|symbol} prop - The property being set
       * @param {*} value - The value being assigned
       * @returns {boolean} True if the assignment succeeded
       */
      set: (target, prop, value) => {
        // Check if table is read-only
        target._checkReadOnly()

        // Handle data property
        if (prop === 'data') {
          target.data = value
          return true
        }

        // Handle numeric indices
        if (!isNaN(prop)) {
          const index = parseInt(prop)
          if (value instanceof NestedTable) {
            // Update the parent reference for the new node
            value._parent = target
            value._path = [...target._path, index]
            target._items[index] = value
          } else {
            // If setting a raw value, wrap it in a NestedTable
            const newPath = [...target._path, index]
            target._items[index] = new NestedTable(target.sm, value, target, newPath, target._readOnly)
          }
        } else {
          target[prop] = value
        }
        return true
      },
    })

    return selfProxy
  }

  /**
   * Returns a list of methods that should only be called after a table is created.
   * These are the chainable methods that operate on the table's rows.
   *
   * @returns {Array<string>} Array of method names
   */
  getProtectedTableMethods() {
    // Return a hardcoded list of protected methods and getters
    // This is more reliable than introspection for this use case
    return [
      // Methods
      'append',
      'shuffle',
      'sample',
      'repeat',
      'forEach',
      'zip',
      'outer',
      'range',
      'print',
      'slice',
      'partition',
      'indexOf',
      'interleave',
      'pop',
      'getSubtreeData',

      // Getters
      'tableID',
      'id',
      'path',
      'paths',
      'length',
      'rows',
      'rowsdata',
      'isReadOnly',
      'readOnly',
      'pathdata',
    ]
  }

  /**
   * Checks if the table is read-only and throws an error if it is.
   *
   * @param {string} operation - The name of the operation being attempted
   * @throws {Error} If the table is read-only
   * @private
   */
  _checkReadOnly() {
    if (this._readOnly) {
      throw new Error('Table is read-only')
    }
  }

  /**
   * Checks if the table is read-only.
   *
   * @returns {boolean} True if the table is read-only, false otherwise
   */
  get isReadOnly() {
    return this._readOnly
  }

  get readOnly() {
    return this._readOnly
  }

  /**
   * Get the unique identifier for this table node.
   *
   * @returns {string} UUID v4 string that uniquely identifies this node
   */
  get id() {
    return this._id
  }

  /**
   * Generates a deterministic signature/hash of the entire table structure including all nodes.
   * This can be used to compare tables or track changes.
   *
   * @returns {string} A unique hash representing the entire table structure and data
   */
  get tableID() {
    // Helper function to create a deterministic string representation of any value
    const stringifyValue = (value) => {
      if (value === undefined) return 'undefined'
      if (value === null) return 'null'
      if (typeof value === 'object') {
        // Sort object keys to ensure consistent ordering
        const sortedKeys = Object.keys(value).sort()
        return '{' + sortedKeys.map((key) => `${key}:${stringifyValue(value[key])}`).join(',') + '}'
      }
      return String(value)
    }

    // Helper function to recursively process the table structure
    const processNode = (node) => {
      const nodeSignature = [
        `path:${node._path.join('-')}`,
        `data:${stringifyValue(node.data)}`,
        'items:[' + node._items.map((item) => processNode(item)).join(',') + ']',
      ].join(';')

      return nodeSignature
    }

    // Get the full table signature
    const fullSignature = processNode(this)

    // Create a hash of the signature using a simple but fast hashing function
    const hash = (str) => {
      let hash = 5381
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i)
        hash = hash & hash // Convert to 32-bit integer
      }
      return hash >>> 0 // Convert to unsigned
    }

    // Return the final hash in hex format
    return hash(fullSignature).toString(16).padStart(8, '0')
  }

  /**
   * Get the absolute path indices regardless of base node.
   *
   * @returns {Array<number>} Array of indices representing the absolute path
   */
  get path() {
    return [...this._path]
  }

  /**
   * Get the absolute path as a hyphen-separated string.
   *
   * @returns {string} The absolute path as a hyphen-separated string
   */
  get paths() {
    return this._path.join('-')
  }

  /**
   * Get the data values from nodes along the absolute path.
   *
   * @returns {Array} Array of data values from nodes along the absolute path
   */
  get pathdata() {
    // Start with an empty result array
    const result = []

    // Start from the root node
    let currentNode = this
    while (currentNode._parent !== null) {
      currentNode = currentNode._parent
    }

    // Now traverse down the path, collecting data values
    let node = currentNode
    const path = [...this._path]

    // Add root node data if it exists
    if (node.data !== undefined) {
      result.push(node.data)
    }

    // Follow each index in the path and collect data
    for (let i = 0; i < path.length; i++) {
      const index = path[i]
      if (node._items[index] && node._items[index].data !== undefined) {
        node = node._items[index]
        result.push(node.data)
      } else {
        break
      }
    }

    return result
  }

  /**
   * Get the length of the current table.
   *
   * @returns {number} The number of items in the current table
   */
  get length() {
    return this._items.length
  }

  /**
   * Get all items in the current table.
   *
   * @returns {Array<NestedTable>} Array of NestedTable nodes
   */
  get rows() {
    return this._items
  }

  /**
   * Get data from all items in the current table.
   *
   * @returns {Array} Array of data values from all items
   */
  get rowsdata() {
    return this._items.map((item) => item.data)
  }

  /**
   * Remove and return the last item in the table.
   *
   * @returns {NestedTable|undefined} The removed item or undefined if empty
   */
  pop() {
    this._checkReadOnly()
    return this._items.pop()
  }

  /**
   * Collect data from this node and all of its descendants.
   *
   * @returns {Array} Array of data values from this node and all its descendants
   */
  getSubtreeData() {
    const result = []

    // Add this node's data if it exists
    if (this.data !== undefined) {
      result.push(this.data)
    }

    // Add data from all descendants recursively (flatten the tree)
    const collectDescendantData = (node) => {
      for (let i = 0; i < node._items.length; i++) {
        const child = node._items[i]
        if (child && child.data !== undefined) {
          result.push(child.data)
        }
        collectDescendantData(child)
      }
    }

    collectDescendantData(this)

    return result
  }

  /**
   * Finds the index of the first item whose data matches the search value.
   *
   * @param {*} searchValue - The value to search for in the items' data fields
   * @returns {number} The index of the first matching item, or -1 if not found
   */
  indexOf(searchValue) {
    for (let i = 0; i < this._items.length; i++) {
      if (JSON.stringify(this._items[i].data) === JSON.stringify(searchValue)) {
        return i
      }
    }
    return -1
  }

  /**
   * Returns an array containing the data fields from a portion of the table's items.
   * Similar to Array.slice(), but returns data values instead of NestedTable nodes.
   *
   * @param {number} [start=0] - Zero-based index at which to start extraction (inclusive)
   * @param {number} [end=this._items.length] - Zero-based index at which to end extraction (exclusive)
   * @returns {Array} A new array containing the data values from the selected items
   * @throws {Error} If start or end indices are invalid
   */
  slice(start = 0, end = this._items.length) {
    // Handle negative indices
    const actualStart = start < 0 ? Math.max(this._items.length + start, 0) : start
    const actualEnd = end < 0 ? Math.max(this._items.length + end, 0) : end

    // Validate indices
    if (actualStart >= this._items.length) {
      return []
    }

    // Ensure end doesn't exceed array length
    const finalEnd = Math.min(actualEnd, this._items.length)

    // Return data values from the selected range
    return this._items.slice(actualStart, finalEnd).map((item) => item.data)
  }

  /**
   * Allows the NestedTable to be used with for...of loops and the spread operator.
   * Returns the data values from each item rather than the NestedTable nodes.
   *
   * @returns {Object} An iterator object for the data values in this node
   */
  [Symbol.iterator]() {
    let index = 0
    const items = this._items

    return {
      next: () => {
        if (index < items.length) {
          const value = items[index].data
          index++
          return { value, done: false }
        }
        return { done: true }
      },
    }
  }
}

export default NestedTable
