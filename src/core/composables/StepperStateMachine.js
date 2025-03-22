import { StepState } from './StepState'

// todo items
// -- get position by giving a path and then testing you can step foward correctly
// -- delete tree and start over
// -- check serializing

/**
 * Creates a new StepState initialized with SOS and EOS
 * @returns {StepState} Initialized StepState
 */
function createInitializedStepState() {
  const state = new StepState()
  state.push('SOS')
  state.push('EOS')
  return state
}

/**
 * A state machine for traversing a tree of states.
 * Provides a high-level API for controlling a hierarchical timeline.
 * the statemachine has an automatic root note and then the first row
 * the first row has an automatic SOS (start of sequence) and EOS (end of sequence)
 * these are used to help know when to stop when traversing the tree
 */
export class StepperStateMachine {
  constructor(stepState = null, _root = null) {
    this.stepState = stepState || createInitializedStepState()
    this._root = _root || this // If no root provided, this instance is the root
    this.next()
    return new Proxy(this, {
      get(target, prop) {
        // Handle array/object access
        if (typeof prop === 'string' || typeof prop === 'number') {
          // Handle special methods/properties
          if (prop in target) {
            return target[prop]
          }

          // Handle array/key access
          const node = target.stepState.getNode(prop)
          if (node) {
            // Return a new StepperStateMachine instance for the node, passing the root reference
            return new StepperStateMachine(node, target._root)
          }
        }
        return undefined
      },
    })
  }

  /**
   * Pushes a new state to the current node
   * @param {*} value - Value for the new state
   * @param {Object} [data=null] - Optional data to associate with the node
   * @returns {StepState} The newly created state
   * @throws {Error} If a state with the given value already exists
   */
  push(value = null, data = null) {
    try {
      let state
      // Check if this is the top-level sequence state (contains SOS and EOS)
      if (
        this.stepState.states.length >= 2 &&
        this.stepState.states[0].value === 'SOS' &&
        this.stepState.states[this.stepState.states.length - 1].value === 'EOS'
      ) {
        // Insert the new state before EOS (at length - 1)
        state = this.stepState.insert(value, -2)
      } else {
        // Regular push for non-top-level states
        state = this.stepState.push(value)
      }

      if (data !== null) {
        state.data = data
      }
      return state
    } catch (error) {
      throw new Error(`Push failed: ${error.message}`)
    }
  }

  /**
   * Sets or updates data for the current node
   * @param {Object} data - Data to associate with the node
   */
  set data(data) {
    this.stepState.data = data
  }

  /**
   * Gets data associated with the current node and all its ancestors in the current path
   * @returns {Array} Array of data objects from all nodes along the current path
   */
  get pathdata() {
    return this.stepState.datapath
  }

  /**
   * Gets data associated with the current node
   * @returns {Object|null} Data object associated with the current node, or null if no data
   */
  get data() {
    return this.stepState.data
  }

  /**
   * Sets data for a node at the specified path
   * @param {Array|string} path - Path to the node (array of values or hyphen-separated string)
   * @param {Object} data - Data to associate with the node
   * @throws {Error} If the path doesn't exist
   */
  setDataAtPath(path, data) {
    const pathArray = typeof path === 'string' ? path.split('-') : path
    let current = this

    for (const value of pathArray) {
      current = current[value]
      if (!current) {
        throw new Error(`Invalid path: ${path}`)
      }
    }

    current.data = data
  }

  /**
   * Moves to and returns the next state value in the sequence
   * @returns {*} The next state value or EOS if already at EOS
   */
  next() {
    // If we're currently at EOS, just return EOS without advancing
    if (this.stepState.states[this.stepState.index]?.value === 'EOS') {
      return 'EOS'
    }
    return this.stepState.next()
  }

  /**
   * Moves to and returns the previous state value in the sequence
   * @returns {*} The previous state value or SOS if already at SOS
   */
  prev() {
    // If we're currently at SOS, just return SOS without moving back
    if (this.stepState.states[this.stepState.index]?.value === 'SOS') {
      return 'SOS'
    }
    return this.stepState.prev()
  }

  /**
   * Resets the traversal state to the first item
   */
  reset() {
    this.stepState.reset()
    // Initialize to before first state
    if (this.stepState.states.length > 0) {
      this.stepState.currentIndex = -1
    }
    this.next()
  }

  /**
   * Returns the current path through the tree as a list of values
   * @returns {Array} Array of values representing the current path
   */
  get currentPath() {
    const path = []

    // Then traverse down from root following the selected indices
    let current = this._root.stepState

    // Add values of selected children
    while (current.index !== -1 && current.length > 0) {
      current = current.states[current.index]
      path.push(current.value)
    }

    return path
  }

  /**
   * Returns the current path through the tree as a hyphen-separated string
   * @returns {string} String representation of the current path
   */
  get currentPaths() {
    return this.currentPath.join('-')
  }

  /**
   * Returns a string representation of the tree structure
   * @returns {string} Tree diagram
   */
  get treeDiagram() {
    const buildDiagram = (node, prefix = '', isLast = true) => {
      // Create the line for current node
      const line = prefix + (isLast ? '└── ' : '├── ') + node.value + '\n'

      // Calculate new prefix for children
      const childPrefix = prefix + (isLast ? '    ' : '│   ')

      // Recursively build diagram for children
      const childLines = node.states
        .map((state, index) => buildDiagram(state, childPrefix, index === node.length - 1))
        .join('')

      return line + childLines
    }

    const root = this._root.stepState

    // Special case for root node
    if (root.value === '/') {
      return '/' + '\n' + root.states.map((state, index) => buildDiagram(state, '', index === this.length - 1)).join('')
    }

    return buildDiagram(root)
  }

  /**
   * Gets all leaf nodes in the tree beneath this node.
   * A leaf node is defined as a node that has no children.
   * @returns {Array} An array of all leaf nodes
   */
  get leafNodes() {
    return this._root.stepState.leafNodes
  }

  /**
   * Gets the JSON representation of the StepperStateMachine
   * @returns {string} A JSON representation of the StepperStateMachine
   */
  get json() {
    return this.stepState.json
  }

  /**
   * Deserializes a JSON string to a StepperStateMachine object.
   * @param {string} data - The JSON string to deserialize
   */
  loadFromJSON(data) {
    this.stepState.loadFromJSON(data)
  }
}
