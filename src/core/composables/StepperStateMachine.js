import { StepState } from './StepState'

// todo items
// -- get position by giving a path and then testing you can step foward correctly
// -- instead of initalizing off of push give an array or nested array and
// build the timeline that way
// -- jspsych compatibility mode?
// -- should have option to append
// -- delete tree and start over
// -- check serializing

/**
 * A state machine for traversing a tree of states.
 * Provides a high-level API for controlling a hierarchical timeline.
 */
export class StepperStateMachine {
  constructor(stepState = null) {
    this.stepState = stepState || new StepState()
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
            // Return a new StepperStateMachine instance for the node
            return new StepperStateMachine(node)
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
      const state = this.stepState.push(value)
      if (data !== null) {
        state.setData(data)
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
  setData(data) {
    this.stepState.setData(data)
  }

  /**
   * Gets data associated with the current node
   * @returns {Object|null} The node's data or null if none exists
   */
  getData() {
    return this.stepState.getData()
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

    current.setData(data)
  }

  /**
   * Moves to and returns the next state value in the sequence
   * @returns {*} The next state value or null if no next state exists
   */
  next() {
    return this.stepState.next()
  }

  /**
   * Moves to and returns the previous state value in the sequence
   * @returns {*} The previous state value or null if no previous state exists
   */
  prev() {
    return this.stepState.prev()
  }

  /**
   * Resets the traversal state
   */
  reset() {
    this.stepState.reset()
  }

  /**
   * Returns the current path through the tree as a list of values
   * @returns {Array} Array of values representing the current path
   */
  getCurrentPath() {
    return this.stepState.getCurrentPath()
  }

  /**
   * Returns the current path through the tree as a hyphen-separated string
   * @returns {string} String representation of the current path
   */
  getCurrentPathStr() {
    return this.getCurrentPath().join('-')
  }

  /**
   * Returns a string representation of the tree structure
   * @returns {string} Tree diagram
   */
  getTreeDiagram() {
    return this.stepState.getTreeDiagram()
  }
}
