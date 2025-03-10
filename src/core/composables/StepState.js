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
    this.value = value === null ? '/' : value
    this.states = []
    this.currentIndex = -1
    this.depth = 0
    if (parent !== null) {
      this.depth = parent.depth + 1
    }
    this.parent = parent
    this.data = null // Add this line to store node data
  }

  /**
   * Creates and adds a new child state to this node.
   * If no value is provided, automatically assigns the next available index as the value.
   * @param {*} value - Optional value for the new state. If null, uses states.length
   * @returns {StepState} The newly created child state
   * @throws {Error} If a state with the given value already exists
   */
  push(value = null) {
    const autoValue = value === null ? this.states.length : value

    // Check for existing state with same value
    if (value !== null && this.states.some((state) => state.value === value)) {
      throw new Error(`State with value "${value}" already exists in this node`)
    }

    const state = new StepState(autoValue, this)
    this.states.push(state)
    return state
  }

  /**
   * Resets the traversal state of this node and all its descendants.
   * Sets currentIndex back to -1 (no selection) for this node,
   * then recursively resets all child nodes.
   */
  reset() {
    this.currentIndex = -1
    this.states.forEach((state) => state.reset())
  }

  /**
   * Gets the path from root to this node by walking up the parent chain.
   * Returns an array of values representing each node's value along the path,
   * excluding the root node ('/').
   * For example, if we have root -> A -> B -> C, calling getPath() on C returns ['A','B','C']
   * @returns {Array} Array of values representing the path from root to this node
   */
  getPath() {
    const path = []
    let current = this
    while (current && current.value !== '/') {
      path.unshift(current.value)
      current = current.parent
    }
    return path
  }

  /**
   * Gets the depth of this node in the tree.
   * @returns {number} The depth of this node
   */
  getNodeDepth() {
    return this.depth
  }

  /**
   * Gets the maximum depth of the tree beneath this node.
   * @returns {number} The maximum depth of the tree beneath this node
   */
  getTreeDepth() {
    if (this.states.length === 0) {
      return 0 // this is a leaf node
    }
    return Math.max(...this.states.map((state) => state.getTreeDepth())) + 1
  }

  /**
   * Checks if there is a next state available.
   * @returns {boolean} True if there is a next state, false otherwise
   */
  hasNext() {
    if (this.states.length === 0) return false
    if (this.currentIndex < this.states.length - 1) return true
    if (this.currentIndex === this.states.length - 1) {
      return this.states[this.currentIndex].hasNext()
    }
    return false
  }

  /**
   * Checks if there is a previous state available.
   * @returns {boolean} True if there is a previous state, false otherwise
   */
  hasPrev() {
    if (this.states.length === 0) return false
    if (this.currentIndex > 0) return true
    if (this.currentIndex === 0) {
      return this.states[this.currentIndex].hasPrev()
    }
    return false
  }

  /**
   * Peeks at the next state without moving the current position.
   * @returns {StepState|null} The next state or null if no next state exists
   */
  peekNext() {
    if (!this.hasNext()) return null

    const savedIndex = this.currentIndex
    const nextState = this.next()
    this.currentIndex = savedIndex

    return nextState
  }

  /**
   * Peeks at the previous state without moving the current position.
   * @returns {StepState|null} The previous state or null if no previous state exists
   */
  peekPrev() {
    if (!this.hasPrev()) return null

    const savedIndex = this.currentIndex
    const prevState = this.prev()
    this.currentIndex = savedIndex

    return prevState
  }

  /**
   * Moves to the next state in the sequence.
   * @returns {StepState|null} The next state or null if no next state exists
   */
  next() {
    // Empty state has no next value
    if (this.states.length === 0) return null

    // First time navigation - start at index 0 and traverse to leftmost leaf
    if (this.currentIndex === -1) {
      this.currentIndex = 0
      if (this.states[0].states.length > 0) {
        return this.states[0].next()
      }
      return this.states[0].value
    }

    // Try to get next value from current state
    const current = this.states[this.currentIndex]
    const nextInCurrent = current.next()
    if (nextInCurrent !== null) {
      return nextInCurrent
    }

    // Move to next sibling state if available
    this.currentIndex++
    if (this.currentIndex < this.states.length) {
      return this.states[this.currentIndex].next() || this.states[this.currentIndex].value
    }

    // End of sequence reached - stay at last state
    this.currentIndex = this.states.length - 1
    return null
  }

  /**
   * Moves to the previous state in the sequence.
   * @returns {StepState|null} The previous state or null if no previous state exists
   */
  prev() {
    // Empty state or initial state has no previous value
    if (this.states.length === 0 || this.currentIndex === -1) {
      return null
    }

    // Try to get previous value from current state
    const current = this.states[this.currentIndex]
    const prevInCurrent = current.prev()
    if (prevInCurrent !== null) {
      return prevInCurrent
    }

    // Reset current state and move to previous sibling
    current.reset()
    this.currentIndex--

    // If previous sibling exists, navigate to its rightmost leaf
    if (this.currentIndex >= 0) {
      let prevState = this.states[this.currentIndex]
      // Navigate to the rightmost leaf node
      while (prevState.states.length > 0) {
        prevState.currentIndex = prevState.states.length - 1
        const lastState = prevState.states[prevState.currentIndex]
        if (lastState.states.length === 0) {
          return lastState.value
        }
        prevState = lastState
      }
      return prevState.value
    }

    return null
  }

  /**
   * Generates a text-based diagram of the tree structure beneath this node.
   * This is useful for debugging and visualizing the tree structure.
   * @returns {string} A text-based diagram of the tree
   */
  getTreeDiagram() {
    const buildDiagram = (node, prefix = '', isLast = true) => {
      // Create the line for current node
      const line = prefix + (isLast ? '└── ' : '├── ') + node.value + '\n'

      // Calculate new prefix for children
      const childPrefix = prefix + (isLast ? '    ' : '│   ')

      // Recursively build diagram for children
      const childLines = node.states
        .map((state, index) => buildDiagram(state, childPrefix, index === node.states.length - 1))
        .join('')

      return line + childLines
    }

    // Special case for root node
    if (this.value === '/') {
      return (
        '/' +
        '\n' +
        this.states.map((state, index) => buildDiagram(state, '', index === this.states.length - 1)).join('')
      )
    }

    return buildDiagram(this)
  }

  /**
   * Gets all leaf nodes in the tree beneath this node.
   * A leaf node is defined as a node that has no children.
   * @returns {Array} An array of all leaf nodes
   */
  getLeafNodes() {
    if (this.states.length === 0) {
      return [this.getPath()]
    }

    return this.states.reduce((leaves, state) => {
      return leaves.concat(state.getLeafNodes())
    }, [])
  }

  /**
   * Gets a child node by its index or value.
   * @param {number|*} identifier - Either the index or value of the child node to find
   * @returns {StepState|null} The found child node, or null if not found
   */
  getNode(identifier) {
    if (typeof identifier === 'number') {
      return this.states[identifier] || null
    }
    return this.states.find((state) => state.value === identifier) || null
  }

  /**
   * Serializes the StepState object to a JSON string.
   * @returns {string} A JSON representation of the StepState object
   */
  toJSON() {
    // Helper function to clean non-serializable data
    const cleanData = (data) => {
      if (!data) return data
      const cleaned = {}
      for (const [key, value] of Object.entries(data)) {
        // Handle different non-serializable types differently
        if (typeof value === 'function' || typeof value === 'undefined') {
          // Skip functions and undefined values entirely
          continue
        } else if (value instanceof RegExp || (value instanceof Object && 'nodeType' in value)) {
          // Convert DOM elements and RegExp to empty objects
          cleaned[key] = {}
        } else {
          cleaned[key] = value
        }
      }
      return cleaned
    }

    return {
      value: this.value,
      currentIndex: this.currentIndex,
      states: this.states.map((state) => state.toJSON()),
      data: cleanData(this.data),
    }
  }

  /**
   * Deserializes a JSON string to a StepState object.
   * @param {string} data - The JSON string to deserialize
   */
  loadFromJSON(data) {
    this.value = data.value
    this.currentIndex = data.currentIndex
    this.data = data.data
    this.states = data.states.map((stateData) => {
      const state = new StepState(stateData.value, this)
      state.loadFromJSON(stateData)
      return state
    })
  }

  /**
   * Gets the current path through the tree based on selected nodes.
   * Returns an array of values representing each selected node's value,
   * excluding the root node ('/').
   * @returns {Array} Array of values representing the current path
   */
  getCurrentPath() {
    const path = []
    let current = this

    // Add current node's value if it's not the root
    if (current.value !== '/') {
      path.push(current.value)
    }

    // Add values of selected children
    while (current.currentIndex !== -1 && current.states.length > 0) {
      current = current.states[current.currentIndex]
      path.push(current.value)
    }

    return path
  }

  /**
   * Gets the current path through the tree as a hyphen-separated string.
   * Returns a string of values representing each selected node's value,
   * excluding the root node ('/'), joined with hyphens.
   * @returns {string} Hyphen-separated string representing the current path
   */
  getCurrentPathStr() {
    return this.getCurrentPath().join('-')
  }

  setData(data) {
    this.data = data
  }

  getData() {
    return this.data
  }

  /**
   * Gets an array of data objects from all nodes along the current path, from root to leaf.
   * @returns {Array} Array of data objects, where each element is the complete data from a node along the path
   */
  getDataAlongPath() {
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
    while (current.currentIndex !== -1 && current.states.length > 0) {
      current = current.states[current.currentIndex]
      if (current.data) {
        dataArray.push(current.data)
      }
    }

    return dataArray
  }
}

export default StepState
