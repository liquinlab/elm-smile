/**
 * @class StepState
 * @description A tree-based state management class for hierarchical navigation.
 *
 * StepState represents a node in a tree structure where each node can have:
 * - A id (string, number, or custom type)
 * - Multiple child states
 * - Associated data
 * - Navigation capabilities (next/prev)
 *
 * Used with StepperStateMachine for higher-level state management.
 *
 * @property {*} _id - The node's unique identifier
 * @property {StepState[]} _states - Array of child nodes/states
 * @property {number} _currentIndex - Index tracking current position in children
 * @property {number} _depth - Depth of this node in the tree (0 for root)
 * @property {StepState|null} _parent - Reference to parent node
 * @property {StepState} _root - Reference to root node
 * @property {Object} _data - Associated data for this node
 */
export class StepState {
  /**
   * Creates a new StepState node in a tree structure.
   * @param {*} id - The id for this node. If null, defaults to '/'
   * @param {StepState|null} parent - The parent node. If null, this is a root node
   *
   * This constructor initializes:
   * - id: The node's id
   * - states: Array of child nodes (also called rows)
   * - currentIndex: Index tracking current position when traversing children (-1 means no selection)
   * - depth: How deep this node is in the tree (0 for root)
   * - parent: Reference to parent node
   */
  constructor(id = null, parent = null) {
    this._id = id === null ? '/' : id
    this._states = []
    this._currentIndex = 0
    this._depth = 0
    if (parent !== null) {
      this._depth = parent.depth + 1
    }
    this._parent = parent
    this._root = parent?._root || this
    this._data = {}

    return new Proxy(this, {
      get(target, prop) {
        // Handle array/object access
        if (typeof prop === 'string' || typeof prop === 'number') {
          // IMPORTANT: We first try to get a child node by id before checking properties/methods
          // This ensures that child nodes with ids matching getter names (like 'parent')
          // take precedence over the getter methods
          const node = target.getNode(prop)
          if (node) {
            return node
          }
          // If no child node found, then check for properties/methods
          if (prop in target) {
            return target[prop]
          }
          return undefined
        }
        return target[prop]
      },
    })
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
   * Sets the id of this node
   * @param {*} id - The new id to set
   */
  set id(id) {
    this._id = id
  }

  /**
   * Gets the id of this node
   * @returns {*} The node's id
   */
  get id() {
    return this._id
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
   * @param {*} data - The data to store in this node
   */
  set data(data) {
    this._data = data
  }

  /**
   * Getter for data property
   * @returns {*} The data stored in this node
   */
  get data() {
    return this._data
  }

  /**
   * Gets the root node of the state tree
   * @returns {StepState} The root StepState node
   */
  get root() {
    return this._root
  }
  /**
   * Get all child states of the current state.
   * row is just a synonym for child states
   * row lines a bit more with the table metaphor
   *
   * @returns {Array<StepState>} Array of child StepState nodes
   */
  get rows() {
    return this._states
  }

  /**
   * Get data from all child states of the current state.
   * row is just a synonym for child states
   * row lines a bit more with the table metaphor
   *
   * @returns {Array} Array of data values from all child states
   */
  get rowsdata() {
    return this._states.map((item) => item.data)
  }

  /**
   * Get data from all child states of the current state.
   *
   * @returns {Array} Array of data values from all child states
   */
  get statesdata() {
    return this._states.map((item) => item.data)
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
   * Checks if this node is a leaf node (has no child states).
   * @returns {boolean} True if this node has no child states, false otherwise
   */
  get isLeaf() {
    return this._states.length === 0
  }

  /**
   * Checks if this node is the first non-special leaf node in the tree.
   *
   * A leaf node is considered "first" if:
   * 1. It is a leaf node (has no children)
   * 2. It is the leftmost leaf node when traversing the tree that is not marked as 'SOS' or 'EOS'
   *
   * @returns {boolean} True if this is the first non-special leaf node, false otherwise
   */
  get isFirstLeaf() {
    // If this is not a leaf node, return false
    if (!this.isLeaf) {
      return false
    }

    // Helper function to find leftmost leaf
    const findLeftmostLeaf = (state) => {
      if (state.isLeaf) {
        return state
      }
      return findLeftmostLeaf(state._states[0])
    }

    // Find first non-SOS leaf by checking each branch from left
    for (let i = 0; i < this._root._states.length; i++) {
      const leftmostLeaf = findLeftmostLeaf(this._root._states[i])
      if (leftmostLeaf.id !== 'SOS' && leftmostLeaf.id !== 'EOS') {
        // Return true if this is that first non-SOS leaf
        return leftmostLeaf.paths === this.paths
      }
    }

    return false
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
   * If no id is provided, automatically assigns the next available index as the id.
   * @param {*} id - Optional id for the new state. If null, uses states.length
   * @param {*} data - Optional data to associate with the new state
   * @returns {StepState} The newly created child state
   * @throws {Error} If a state with the given id already exists
   */
  push(id = null, data = null) {
    return this.insert(id, -1, data)
  }

  /**
   * Inserts a new state at the specified position in the list of children.
   * Maintains the invariant that we're always pointing to a leaf node.
   * @param {*} id - Optional id for the new state. If null, uses states.length
   * @param {number} index - Position to insert at. Can be positive (0-based) or negative (from end).
   * @param {*} data - Optional data to associate with the new state
   * @returns {StepState} The newly created child state
   * @throws {Error} If a state with the given id already exists
   */
  insert(id = null, index = 0, data = null) {
    const autoid = id === null ? this._states.length : id

    // Check for existing state with same id
    if (this._states.some((state) => state.id === autoid)) {
      throw new Error(`State id already exists in this node (id: "${autoid}")`)
    }

    // Check for hyphen in id
    if (String(autoid).includes('-')) {
      throw new Error(`State id cannot contain hyphens (id: "${autoid}")`)
    }

    const state = new StepState(autoid, this)
    if (data !== null) {
      state.data = data
    }

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
   * Sets currentIndex back to 0 for this node,
   * then recursively resets all child nodes.
   */
  reset() {
    this._currentIndex = 0
    this._states.forEach((state) => state.reset())
  }

  /**
   * Resets the state machine and navigates to the specified path.
   * If the path points to a leaf node, stays at that leaf.
   * If the path points to a non-leaf node, traverses to its leftmost leaf.
   * @param {Array|string} path - Path to navigate to (array of ids or hyphen-separated string)
   * @throws {Error} If the path doesn't exist
   */
  goTo(path) {
    // Convert string path to array if needed
    const pathArray = typeof path === 'string' ? path.split('-') : path

    // Reset the state machine
    this.reset()

    // Start from root
    let current = this

    // Navigate through the path
    for (const id of pathArray) {
      // Skip the root '/' id if it's in the path
      if (id === '/') continue

      // Find the child state with matching id, converting to string for comparison
      const childState = current._states.find((state) => String(state.id) === String(id))
      if (!childState) {
        throw new Error(`Invalid path: ${path} (Could not find child with id "${id}" in node "${current.id}")`)
      }

      // Update current index to point to this child
      current._currentIndex = current._states.indexOf(childState)
      current = childState
    }

    // If we're at a non-leaf node, traverse to its leftmost leaf
    while (current._states.length > 0) {
      current._currentIndex = 0
      current = current._states[0]
    }
  }

  /**
   * Moves to the next state in the sequence.
   * @returns {StepState|null} The next state or null if no next state exists
   */
  next() {
    // Empty state has no next value
    if (this._states.length === 0) return null

    // Get current node
    const current = this._states[this._currentIndex]

    // Try to get next value from current state's children
    const nextInCurrent = current.next()
    if (nextInCurrent !== null) {
      return nextInCurrent
    }

    // Move to next sibling state if available
    this._currentIndex++
    if (this._currentIndex < this._states.length) {
      // When moving to a sibling, traverse to its leftmost leaf
      let leaf = this._states[this._currentIndex]
      while (leaf._states.length > 0) {
        leaf._currentIndex = 0
        leaf = leaf._states[0]
      }
      return leaf
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
    // Empty state has no previous value
    if (this._states.length === 0) return null

    // Get current node
    const current = this._states[this._currentIndex]

    // Try to get previous value from current state's children
    const prevInCurrent = current.prev()
    if (prevInCurrent !== null) {
      return prevInCurrent
    }

    // Move to previous sibling
    if (this._currentIndex > 0) {
      this._currentIndex--
      // When moving to a previous sibling, traverse to its rightmost leaf
      let leaf = this._states[this._currentIndex]
      while (leaf._states.length > 0) {
        leaf._currentIndex = leaf._states.length - 1
        leaf = leaf._states[leaf._currentIndex]
      }
      return leaf
    }

    // No more previous states
    return null
  }

  /**
   * Gets all leaf node paths in the tree beneath this node.
   * A leaf node is defined as a node that has no children.
   * @returns {string} A hyphen-separated string of leaf node paths
   */
  get leafNodes() {
    if (this._states.length === 0) {
      return this.paths
    }

    return this._states.reduce((leaves, state) => {
      return leaves.concat(state.leafNodes)
    }, [])
  }

  /**
   * Gets the total number of leaf nodes in the tree beneath this node.
   * A leaf node is defined as a node that has no children.
   * @returns {number} The count of leaf nodes
   */
  get countLeafNodes() {
    return this.leafNodes.length
  }

  /**
   * Gets a child node by its index or id.
   * @param {number|*} identifier - Either the index or id of the child node to find
   * @returns {StepState|null} The found child node, or null if not found
   */
  getNode(identifier) {
    if (typeof identifier === 'number') {
      return this._states[identifier] || null
    }
    return this._states.find((state) => state.id === identifier) || null
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
        // Skip functions unless they are faker functions
        if (typeof value === 'function') {
          // Get the function body as string
          const funcStr = value.toString()
          // Check if it's a faker function call
          if (funcStr.includes('api.faker.')) {
            // Extract the faker function name and parameters
            const match = funcStr.match(/api\.faker\.(\w+)\((.*)\)/)
            if (match) {
              const [_, fakerName, params] = match
              cleaned[key] = {
                __fakerFunction: true,
                name: fakerName,
                params: params.split(',').map((p) => p.trim()),
              }
            }
          }
          // Skip all other functions
          continue
        }

        // Check if it's a Vue component
        if (value && typeof value === 'object' && value.name && (value.template || value.render)) {
          cleaned[key] = {
            __vueComponent: true,
            componentName: value.name,
          }
          continue
        }

        // Handle data objects that might contain component references
        if (key === 'type' && value?.name && (value.template || value.render)) {
          cleaned[key] = {
            __vueComponent: true,
            componentName: value.name,
          }
          continue
        }

        if (
          typeof value === 'undefined' ||
          value instanceof RegExp ||
          (value instanceof Object && 'nodeType' in value)
        ) {
          // Skip undefined values, RegExp, and DOM elements entirely
          continue
        } else {
          cleaned[key] = value
        }
      }
      return cleaned
    }

    return {
      id: this.id,
      currentIndex: this._currentIndex,
      depth: this._depth,
      states: this._states.map((state) => state.json),
      data: cleanData(this.data),
      // Note: We don't serialize _parent or _root as they are circular references
      // and will be re-established during deserialization
    }
  }

  /**
   * Deserializes a JSON string to a StepState object.
   * @param {string} data - The JSON string to deserialize
   */
  loadFromJSON(data) {
    // Only reset root-level properties if this is the root node
    if (this._parent === null) {
      this._id = data.id
      this._currentIndex = data.currentIndex
      this._depth = data.depth
      this._data = this._reconstructData(data.data)
      this._states = []
      this._parent = null
      this._root = this
    }
    // Create child states with proper parent references and load their data
    this._states = data.states.map((stateData) => {
      const state = new StepState(stateData.id, this) // Pass 'this' as parent
      state.loadFromJSON(stateData) // Load child data while preserving parent reference
      state._depth = stateData.depth
      state._currentIndex = stateData.currentIndex
      state._data = this._reconstructData(stateData.data)
      state._root = this._root
      state._parent = this
      return state
    })
  }

  /**
   * Reconstructs data objects, including faker functions
   * @private
   * @param {Object} data - The data object to reconstruct
   * @returns {Object} The reconstructed data object
   */
  _reconstructData(data) {
    if (!data) return data

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this._reconstructData(item))
    }

    // Handle objects
    if (typeof data === 'object') {
      const reconstructed = {}
      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object') {
          // Handle faker functions
          if (value.__fakerFunction) {
            reconstructed[key] = () => {
              const fakerFunc = this._root.api?.faker?.[value.name]
              if (!fakerFunc) {
                console.warn(`Faker function ${value.name} not found during reconstruction`)
                return null
              }
              return fakerFunc(...value.params)
            }
            continue
          }

          // Handle Vue components
          if (value.__vueComponent) {
            reconstructed[key] = {
              name: value.componentName,
              __vueComponent: true,
            }
            continue
          }

          // Recursively reconstruct nested objects
          reconstructed[key] = this._reconstructData(value)
        } else {
          reconstructed[key] = value
        }
      }
      return reconstructed
    }

    // Return primitive values as is
    return data
  }

  /**
   * Gets the path from root to this node by walking up the parent chain.
   * Returns an array of ids representing each node's id along the path,
   * excluding the root node ('/').
   * This is distinct from the currentPath property which returns the path from the
   * root to the current selected node by following .index.
   * For example, if we have root -> A -> B -> C, calling getPath() on C returns ['A','B','C']
   * @returns {Array} Array of ids representing the path from root to this node
   */
  get path() {
    const path = []
    let current = this
    while (current && current.id !== '/') {
      path.unshift(current.id)
      current = current.parent
    }
    return path
  }

  /**
   * Gets the path string for this node by walking up the parent chain.
   * Returns a hyphen-separated string of ids representing each node's id,
   * excluding the root node ('/').
   * This is distinct from the currentPath property which returns the path from the
   * root to the current selected node by following .index.
   * @returns {string} Hyphen-separated string representing the path to this node
   */
  get paths() {
    return this.path.join('-')
  }

  /**
   * Gets an array of data objects from all nodes along the current path, from root to leaf.
   * @returns {Array} Array of data objects, where each element is the complete data from a node along the path
   */
  get pathdata() {
    const dataArray = []
    let current = this

    // First collect data from root to current node
    const ancestors = []
    while (current.parent !== null) {
      ancestors.unshift(current)
      current = current.parent
    }

    // Add root node data if it exists and isn't '/' and isn't empty
    if (current.id !== '/' && current.data && Object.keys(current.data).length > 0) {
      dataArray.push(current.data)
    }

    // Add ancestor data
    ancestors.forEach((node) => {
      if (node.data && Object.keys(node.data).length > 0) {
        dataArray.push(node.data)
      }
    })

    // Now traverse down through selected children to the leaf
    current = this
    while (current._states.length > 0) {
      current = current._states[current._currentIndex]
      if (current.data && Object.keys(current.data).length > 0) {
        dataArray.push(current.data)
      }
    }

    return dataArray
  }

  /**
   * Sets data for a node at the specified path
   * @param {Array|string} path - Path to the node (array of ids or hyphen-separated string)
   * @param {Object} data - Data to associate with the node
   * @throws {Error} If the path doesn't exist
   */
  setDataAtPath(path, data) {
    // Ensure data is an object (not null, undefined, or an array)
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Data must be an object')
    }

    const pathArray = typeof path === 'string' ? path.split('-') : path
    let current = this

    for (const id of pathArray) {
      current = current[id]
      if (!current) {
        throw new Error(`Invalid path: ${path}`)
      }
    }

    current.data = data
  }

  /**
   * Returns the current path through the tree as a list of ids
   * @returns {Array} Array of ids representing the current path
   */
  get currentPath() {
    const path = []
    let current = this._root

    // Build path from root to current leaf node
    while (current._states.length > 0) {
      current = current._states[current._currentIndex]
      path.push(current.id)
    }

    return path
  }

  /**
   * Returns the data from the current leaf node in the tree
   * @returns {*} The data from the current leaf node
   */
  get currentData() {
    let current = this._root

    // Traverse to current leaf node
    while (current._states.length > 0) {
      current = current._states[current._currentIndex]
    }

    return current.data
  }

  /**
   * Returns the current path through the tree as a hyphen-separated string
   * @returns {string} String representation of the current path
   */
  get currentPaths() {
    return this.currentPath.join('-')
  }

  /**
   * Returns a string representation of the tree structure beneath this node
   * @returns {string} Tree diagram
   */
  get treeDiagram() {
    const buildDiagram = (node, prefix = '', isLast = true) => {
      // Create the line for current node
      const line = prefix + (isLast ? '└── ' : '├── ') + node.id + '\n'

      // Calculate new prefix for children
      const childPrefix = prefix + (isLast ? '    ' : '│   ')

      // Recursively build diagram for children
      const childLines = node.states
        .map((state, index) => buildDiagram(state, childPrefix, index === node.length - 1))
        .join('')

      return line + childLines
    }

    // Special case for root node
    if (this.id === '/') {
      return '/' + '\n' + this.states.map((state, index) => buildDiagram(state, '', index === this.length - 1)).join('')
    }

    return buildDiagram(this)
  }

  /**
   * Completely clears all states and resets to initial condition
   * Removes all child states and resets all internal properties
   */
  clear() {
    // Clear all child states recursively
    this._states.forEach((state) => {
      state.clear()
    })

    // Reset all internal properties
    this._states = []
    this._currentIndex = 0
    this._data = {}
  }

  /**
   * Completely clears all states and resets to initial condition
   * Removes all child states and resets all internal properties
   */
  clearTree() {
    // Clear all child states recursively
    this._states.forEach((state) => {
      state.clear()
    })

    // Reset all internal properties
    this._states = []
    this._currentIndex = 0
  }
}

export default StepState
