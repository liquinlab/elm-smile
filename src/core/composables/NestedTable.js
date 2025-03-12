import seedrandom from 'seedrandom'
import config from '@/core/config'
import { v4 as uuidv4 } from 'uuid'

// Helper function to handle array padding/looping
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
   * @param {NestedTable|null} [baseNode=null] - Base node for relative path calculations
   */
  constructor(sm, data = undefined, parent = null, path = [], baseNode = null) {
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

    // Base node for relative path calculations
    this._baseNode = baseNode || this

    // Unique ID for this node to help with comparison
    this._id = uuidv4()

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
            // Make sure the child uses the same base node for path calculations
            target._items[index]._baseNode = target._baseNode
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
            // Calculate how many items we'll be adding
            let itemsToAdd = 0
            if (value instanceof NestedTable) {
              itemsToAdd = value.length
            } else {
              itemsToAdd = Array.isArray(value) ? value.length : 1
            }

            // Check if initial value exceeds limit
            if (itemsToAdd > config.max_stepper_rows) {
              throw new Error(
                `Cannot append ${itemsToAdd} rows as it exceeds the safety limit of ${config.max_stepper_rows}. Consider reducing the number of rows to append.`
              )
            }

            // Check if appending would exceed limit
            const newLength = target._items.length + itemsToAdd
            if (newLength > config.max_stepper_rows) {
              throw new Error(
                `append() would generate ${newLength} rows, which exceeds the safety limit of ${config.max_stepper_rows}. Consider reducing the number of rows to append.`
              )
            }

            // Handle NestedTable instances by copying their rows' data
            if (value instanceof NestedTable) {
              const rowsData = value.rowsdata
              for (let i = 0; i < rowsData.length; i++) {
                const index = target._items.length
                const newPath = [...target._path, index]
                const newNode = new NestedTable(target.sm, rowsData[i], target, newPath, target._baseNode)
                target._items.push(newNode)
              }
              return selfProxy
            }

            // Handle regular values
            const values = Array.isArray(value) ? value : [value]
            for (let i = 0; i < values.length; i++) {
              const index = target._items.length
              const newPath = [...target._path, index]
              const newNode = new NestedTable(target.sm, values[i], target, newPath, target._baseNode)
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
            target._items.forEach((item, index) => {
              callback(item, index)
            })
            return selfProxy
          }
        }

        if (prop === 'map') {
          /**
           * Creates a new array with the results of calling a function
           * for every element in the table. Returns the table for chaining.
           *
           * @param {Function} callback - Function to execute for each element
           * @param {NestedTable} callback.item - The current item being processed
           * @param {number} callback.index - The index of the current item
           * @returns {NestedTable} The current instance for chaining
           */
          return (callback) => {
            target._items.map((item, index) => {
              return callback(item, index)
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
            if (newLength > config.max_stepper_rows) {
              throw new Error(
                `zip() would generate ${newLength} rows, which exceeds the safety limit of ${config.max_stepper_rows}. Consider reducing the number of values in your arrays.`
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
              const newNode = new NestedTable(target.sm, zippedRows[i], target, newPath, target._baseNode)
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
            if (n <= 0) {
              throw new Error('range() must be called with a positive integer')
            }

            // Check if n exceeds safety limit
            if (n > config.max_stepper_rows) {
              throw new Error(
                `Cannot append ${n} rows as it exceeds the safety limit of ${config.max_stepper_rows}. Consider reducing the number of rows to append.`
              )
            }

            // Clear existing items
            target._items = []

            // Create n new items with incrementing values
            for (let i = 0; i < n; i++) {
              const newPath = [...target._path, i]
              const newNode = new NestedTable(target.sm, { [fieldName]: i }, target, newPath, target._baseNode)
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
            if (n <= 0 || target._items.length === 0) return selfProxy

            const totalRows = target._items.length * n
            if (totalRows > config.max_stepper_rows) {
              throw new Error(
                `repeat() would generate ${totalRows} rows, which exceeds the safety limit of ${config.max_stepper_rows}. Consider reducing the repeat count.`
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
                node._baseNode
              )

              // Deep copy all child items
              newNode._items = node._items.map((child) => deepCopyNode(child))

              // Update parent references and paths for children
              newNode._items.forEach((child, index) => {
                child._parent = newNode
                child._path = [...newNode._path, index]
                child._baseNode = newNode._baseNode
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

        if (prop === 'interleave') {
          return (input) => {
            let inputItems = []

            // Helper function to deep copy a NestedTable node
            const deepCopyNode = (node) => {
              // Create new node with copied data
              const newNode = new NestedTable(
                target.sm,
                JSON.parse(JSON.stringify(node.data)),
                target,
                [...target._path],
                target._baseNode
              )

              // Deep copy all child items
              newNode._items = node._items.map((child) => deepCopyNode(child))

              // Update parent references and paths for children
              newNode._items.forEach((child, index) => {
                child._parent = newNode
                child._path = [...newNode._path, index]
                child._baseNode = newNode._baseNode
              })

              return newNode
            }

            // Handle different input types
            if (Array.isArray(input)) {
              // Create NestedTable nodes from array elements
              inputItems = input.map((data) => {
                return new NestedTable(target.sm, data, target, [], target._baseNode)
              })
            } else if (input && input._items) {
              // Deep copy nodes from another table
              inputItems = input._items.map((node) => deepCopyNode(node))
            } else if (input && typeof input === 'object') {
              // Create a single NestedTable node from object
              inputItems = [new NestedTable(target.sm, input, target, [], target._baseNode)]
            } else {
              throw new Error('interleave() requires an array, table, or object as input')
            }

            // Check if the operation would exceed max rows
            const newLength = target._items.length + inputItems.length
            if (newLength > config.max_stepper_rows) {
              throw new Error(
                `interleave() would generate ${newLength} rows, which exceeds the safety limit of ${config.max_stepper_rows}. Consider reducing the number of rows to interleave.`
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
              item._baseNode = target._baseNode
            })

            target._items = result
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
            value._baseNode = target._baseNode
            target._items[index] = value
          } else {
            // If setting a raw value, wrap it in a NestedTable
            const newPath = [...target._path, index]
            target._items[index] = new NestedTable(target.sm, value, target, newPath, target._baseNode)
          }
        } else {
          target[prop] = value
        }
        return true
      },
    })

    return selfProxy
  }

  // relative paths remain unimplemtned
  /**
   * Get path relative to the base node.
   *
   * @returns {Array<number>} Array of indices representing the path from base node to this node
   */
  getRelativePath() {
    if (this._baseNode === this) {
      // If this is the base node, the relative path is empty
      return []
    }

    // Find the path from the base node to this node
    const basePath = this._baseNode._path
    const thisPath = this._path

    // If this node is a descendant of the base node
    if (thisPath.length >= basePath.length) {
      const isDescendant = basePath.every((val, idx) => val === thisPath[idx])
      if (isDescendant) {
        // Return only the part of the path that extends beyond the base path
        return thisPath.slice(basePath.length)
      }
    }

    // If we can't determine a relative path, return the full path
    return [...this._path]
  }

  /**
   * Get the path indices to this node relative to the base node.
   *
   * @returns {Array<number>} Array of indices representing the relative path
   */
  get relpath() {
    return this.getRelativePath()
  }

  /**
   * Get the relative path as a hyphen-separated string.
   *
   * @returns {string} The path as a hyphen-separated string
   */
  get relpaths() {
    return this.getRelativePath().join('-')
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
   * Returns an array containing the data fields from the first n items in the table.
   * If n is greater than the table length, returns all items' data.
   * If n is negative, returns empty array.
   *
   * @param {number} [n=1] - Number of items to return from the start
   * @returns {Array} Array of data values from the first n items
   */
  head(n = 1) {
    if (n <= 0) return []
    return this._items.slice(0, n).map((item) => item.data)
  }

  /**
   * Returns an array containing the data fields from the last n items in the table.
   * If n is greater than the table length, returns all items' data.
   * If n is negative, returns empty array.
   *
   * @param {number} [n=1] - Number of items to return from the end
   * @returns {Array} Array of data values from the last n items
   */
  tail(n = 1) {
    if (n <= 0) return []
    return this._items.slice(-n).map((item) => item.data)
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
