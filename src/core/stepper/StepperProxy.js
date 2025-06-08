/**
 * @class StepperProxy
 * @description Proxy handler for TableAPI objects that handles array-like access and SOS/EOS states
 */
class StepperProxy {
  /**
   * Creates a new StepperProxy instance and returns a proxy
   * @param {TableAPI} target - The target TableAPI object
   * @returns {Proxy} A proxy for the target object
   */
  constructor(target) {
    this.target = target
    return new Proxy(target, this)
  }

  /**
   * Handles property access through the proxy
   * @param {TableAPI} target - The target TableAPI object
   * @param {string|number} prop - The property being accessed
   * @returns {*} The value of the property
   */
  get(target, prop) {
    console.log('get', prop)
    // Handle array/object access
    if (typeof prop === 'string' || typeof prop === 'number') {
      // Convert string numbers to actual numbers
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        prop = parseInt(prop)
      }

      // Handle negative indices first
      if (typeof prop === 'number') {
        if (prop < 0) {
          prop = target._states.length + prop
          // If still negative after adjustment, return undefined
          if (prop < 0) return undefined
        }

        // Then adjust for SOS/EOS states at the root level
        prop = this.adjustIndex(prop, target)
      }

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
  }

  /**
   * Adjusts the index to account for SOS/EOS states at the root level
   * @param {number} index - The index to adjust
   * @param {StepState} node - The node being accessed
   * @returns {number} The adjusted index
   */
  adjustIndex(index, node) {
    // If this is the root node (depth 0), adjust indices to skip SOS/EOS states
    if (node.depth === 0) {
      if (index >= 0) {
        // Add 1 to skip SOS state
        return index + 1
      } else {
        // Subtract 1 to skip EOS state
        return index - 1
      }
    }
    return index
  }
}

export default StepperProxy
