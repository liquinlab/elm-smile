/**
 * A tree-based state management class for hierarchical navigation.
 *
 * StepState represents a node in a tree structure where each node can have:
 * - A value (string, number, or custom type)
 * - Multiple child states
 * - Associated data
 * - Navigation capabilities (next/prev)
 *
 * Used with StepperStateMachine for higher-level state management.
 */
export class StepState {
  /**
   * Creates a new StepState node in a tree structure.
   * @param {*} value - The value for this node. If null, defaults to '/'
   * @param {StepState|null} parent - The parent node. If null, this is a root node
   *
   * This constructor initializes:
   * - value: The node's value
   * - states: Array of child nodes
   * - currentIndex: Index tracking current position when traversing children (-1 means no selection)
   * - depth: How deep this node is in the tree (0 for root)
   * - parent: Reference to parent node
   */
  constructor(value = null, parent = null) {
    this._value = value === null ? '/' : value
    this._states = []
    this._currentIndex = -1
    this._depth = 0
    if (parent !== null) {
      this._depth = parent.depth + 1
    }
    this._parent = parent
    this._data = null // Rename to _data to avoid naming conflict
  }

  /**
   * Gets the number of child states in this node
   * @returns {number} The number of child states
   */
  get length() {
    return this._states.length
  }

  /**
   * Gets the parent node of this state node
   * @returns {StepState|null} The parent StepState node, or null if this is the root
   */
  get parent() {
    return this._parent
  }

  /**
   * Sets the value of this node
   * @param {*} value - The new value to set
   */
  set value(value) {
    this._value = value
  }

  /**
   * Gets the value of this node
   * @returns {*} The node's value
   */
  get value() {
    return this._value
  }

  /**
   * Sets the array of child states for this node
   * @param {StepState[]} states - Array of child StepState nodes to set
   */
  set states(states) {
    this._states = states
  }

  /**
   * Gets the array of child states for this node
   * @returns {StepState[]} Array of child StepState nodes
   */
  get states() {
    return this._states
  }

  /**
   * Sets the current index position in the state sequence
   * @param {number} index - The index position to set (-1 means no selection)
   */
  set index(index) {
    this._currentIndex = index
  }

  /**
   * Gets the current index position in the state sequence
   * @returns {number} The current index (-1 means no selection)
   */
  get index() {
    return this._currentIndex
  }

  /**
   * Setter for data property
   * @param {*} value - The data to store in this node
   */
  set data(value) {
    this._data = value
  }

  /**
   * Getter for data property
   * @returns {*} The data stored in this node
   */
  get data() {
    return this._data
  }

  /**
   * Gets the depth of this node in the tree.
   * @returns {number} The depth of this node
   */
  get depth() {
    return this._depth
  }

  /**
   * Gets the maximum depth of the tree beneath this node.
   * @returns {number} The maximum depth of the tree beneath this node
   */
  get treeDepth() {
    if (this._states.length === 0) {
      return 0 // this is a leaf node
    }
    return Math.max(...this._states.map((state) => state.treeDepth)) + 1
  }

  /**
   * Checks if there is a next state available.
   * @returns {boolean} True if there is a next state, false otherwise
   */
  hasNext() {
    if (this._states.length === 0) return false
    if (this._currentIndex < this._states.length - 1) return true
    if (this._currentIndex === this._states.length - 1) {
      return this._states[this._currentIndex].hasNext()
    }
    return false
  }

  /**
   * Checks if there is a previous state available.
   * @returns {boolean} True if there is a previous state, false otherwise
   */
  hasPrev() {
    if (this._states.length === 0) return false
    if (this._currentIndex > 0) return true
    if (this._currentIndex === 0) {
      return this._states[this._currentIndex].hasPrev()
    }
    return false
  }

  /**
   * Peeks at the next state without moving the current position.
   * @returns {StepState|null} The next state or null if no next state exists
   */
  peekNext() {
    if (!this.hasNext()) return null

    const savedIndex = this._currentIndex
    const nextState = this.next()
    this._currentIndex = savedIndex

    return nextState
  }

  /**
   * Peeks at the previous state without moving the current position.
   * @returns {StepState|null} The previous state or null if no previous state exists
   */
  peekPrev() {
    if (!this.hasPrev()) return null

    const savedIndex = this._currentIndex
    const prevState = this.prev()
    this._currentIndex = savedIndex

    return prevState
  }

  /**
   * Creates and adds a new child state to this node.
   * If no value is provided, automatically assigns the next available index as the value.
   * @param {*} value - Optional value for the new state. If null, uses states.length
   * @returns {StepState} The newly created child state
   * @throws {Error} If a state with the given value already exists
   */
  push(value = null) {
    return this.insert(value, -1)
  }

  /**
   * Inserts a new state at the specified position in the list of children.
   * @param {*} value - Optional value for the new state. If null, uses states.length
   * @param {number} index - Position to insert at. Can be positive (0-based) or negative (from end).
   *                         If positive and beyond list length, appends to end.
   *                         If negative and beyond list length, prepends to start.
   * @returns {StepState} The newly created child state
   * @throws {Error} If a state with the given value already exists
   */
  insert(value = null, index = 0) {
    const autoValue = value === null ? this._states.length : value

    // Check for existing state with same value
    if (value !== null && this._states.some((state) => state.value === value)) {
      throw new Error(`State with value "${value}" already exists in this node`)
    }

    const state = new StepState(autoValue, this)

    // Handle negative indices
    if (index < 0) {
      index = this._states.length + index + 1
    }

    // Handle positive indices beyond list length
    if (index > this._states.length) {
      index = this._states.length
    }

    this._states.splice(index, 0, state)
    return state
  }

  /**
   * Resets the traversal state of this node and all its descendants.
   * Sets currentIndex back to -1 (no selection) for this node,
   * then recursively resets all child nodes.
   */
  reset() {
    this._currentIndex = -1
    this._states.forEach((state) => state.reset())
  }

  /**
   * Moves to the next state in the sequence.
   * @returns {StepState|null} The next state or null if no next state exists
   */
  next() {
    // Empty state has no next value
    if (this._states.length === 0) return null

    // First time navigation - start at index 0 and traverse to leftmost leaf
    if (this._currentIndex === -1) {
      this._currentIndex = 0
      if (this._states[0]._states.length > 0) {
        return this._states[0].next()
      }
      return this._states[0].value
    }

    // Try to get next value from current state
    const current = this._states[this._currentIndex]
    const nextInCurrent = current.next()
    if (nextInCurrent !== null) {
      return nextInCurrent
    }

    // Move to next sibling state if available
    this._currentIndex++
    if (this._currentIndex < this._states.length) {
      return this._states[this._currentIndex].next() || this._states[this._currentIndex].value
    }

    // End of sequence reached - stay at last state
    this._currentIndex = this._states.length - 1
    return null
  }

  /**
   * Moves to the previous state in the sequence.
   * @returns {StepState|null} The previous state or null if no previous state exists
   */
  prev() {
    // Empty state or initial state has no previous value
    if (this._states.length === 0 || this._currentIndex === -1) {
      return null
    }

    // Try to get previous value from current state
    const current = this._states[this._currentIndex]
    const prevInCurrent = current.prev()
    if (prevInCurrent !== null) {
      return prevInCurrent
    }

    // Reset current state and move to previous sibling
    current.reset()
    this._currentIndex--

    // If previous sibling exists, navigate to its rightmost leaf
    if (this._currentIndex >= 0) {
      let prevState = this._states[this._currentIndex]
      // Navigate to the rightmost leaf node
      while (prevState._states.length > 0) {
        prevState._currentIndex = prevState._states.length - 1
        const lastState = prevState._states[prevState._currentIndex]
        if (lastState._states.length === 0) {
          return lastState.value
        }
        prevState = lastState
      }
      return prevState.value
    }

    return null
  }

  /**
   * Gets all leaf nodes in the tree beneath this node.
   * A leaf node is defined as a node that has no children.
   * @returns {Array} An array of all leaf nodes
   */
  get leafNodes() {
    if (this._states.length === 0) {
      return [this.path]
    }

    return this._states.reduce((leaves, state) => {
      return leaves.concat(state.leafNodes)
    }, [])
  }

  /**
   * Gets a child node by its index or value.
   * @param {number|*} identifier - Either the index or value of the child node to find
   * @returns {StepState|null} The found child node, or null if not found
   */
  getNode(identifier) {
    if (typeof identifier === 'number') {
      return this._states[identifier] || null
    }
    return this._states.find((state) => state.value === identifier) || null
  }

  /**
   * Serializes the StepState object to a JSON string.
   * @returns {string} A JSON representation of the StepState object
   */
  get json() {
    // Helper function to clean non-serializable data
    const cleanData = (data) => {
      if (!data) return data
      const cleaned = {}
      for (const [key, value] of Object.entries(data)) {
        // Handle different non-serializable types differently
        if (
          typeof value === 'function' ||
          typeof value === 'undefined' ||
          value instanceof RegExp ||
          (value instanceof Object && 'nodeType' in value)
        ) {
          // Skip functions, undefined values, RegExp, and DOM elements entirely
          continue
        } else {
          cleaned[key] = value
        }
      }
      return cleaned
    }

    return {
      value: this.value,
      currentIndex: this._currentIndex,
      states: this._states.map((state) => state.json), // json doesn't _states
      data: cleanData(this.data),
    }
  }

  /**
   * Deserializes a JSON string to a StepState object.
   * @param {string} data - The JSON string to deserialize
   */
  loadFromJSON(data) {
    this.value = data.value
    this._currentIndex = data.currentIndex
    this.data = data.data
    // the json doesn't ._states it is just .states
    this._states = data.states.map((stateData) => {
      const state = new StepState(stateData.value, this)
      state.loadFromJSON(stateData)
      return state
    })
  }

  /**
   * Gets the path from root to this node by walking up the parent chain.
   * Returns an array of values representing each node's value along the path,
   * excluding the root node ('/').
   * For example, if we have root -> A -> B -> C, calling getPath() on C returns ['A','B','C']
   * @returns {Array} Array of values representing the path from root to this node
   */
  get path() {
    const path = []
    let current = this
    while (current && current.value !== '/') {
      path.unshift(current.value)
      current = current.parent
    }
    return path
  }

  /**
   * Gets the path string for this node by walking up the parent chain.
   * Returns a hyphen-separated string of values representing each node's value,
   * excluding the root node ('/').
   * @returns {string} Hyphen-separated string representing the path to this node
   */
  get paths() {
    return this.path.join('-')
  }

  /**
   * Gets an array of data objects from all nodes along the current path, from root to leaf.
   * @returns {Array} Array of data objects, where each element is the complete data from a node along the path
   */
  get datapath() {
    const dataArray = []
    let current = this

    // First collect data from root to current node
    const ancestors = []
    while (current.parent !== null) {
      ancestors.unshift(current)
      current = current.parent
    }
    // Add root node data if it exists and isn't '/'
    if (current.value !== '/' && current.data) {
      dataArray.push(current.data)
    }
    // Add ancestor data
    ancestors.forEach((node) => {
      if (node.data) {
        dataArray.push(node.data)
      }
    })

    // Now traverse down through selected children
    current = this
    while (current._currentIndex !== -1 && current._states.length > 0) {
      current = current._states[current._currentIndex]
      if (current.data) {
        dataArray.push(current.data)
      }
    }

    return dataArray
  }
}

export default StepState
