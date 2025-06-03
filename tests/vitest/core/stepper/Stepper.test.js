import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { Stepper } from '@/core/stepper/Stepper'
import config from '@/core/config'

describe('Stepper test', () => {
  let stepper
  let pinia

  beforeEach(() => {
    // Create pinia instance and set it as active
    pinia = createTestingPinia({ stubActions: true })
    setActivePinia(pinia)

    stepper = new Stepper({ id: '/' })
  })

  describe('Initialization', () => {
    it('should create a root state with correct initial values', () => {
      expect(stepper.id).toBe('/')
      expect(stepper.states.length).toBe(2) // SOS and EOS states
      expect(stepper.index).toBe(1) // starts at EOS so that new pushes are at index 1
      expect(stepper.parent).toBeNull()
      expect(stepper.depth).toBe(0)
      expect(stepper.states[0].id).toBe('SOS')
      expect(stepper.states[1].id).toBe('EOS')
    })

    it('should not initialize SOS and EOS nodes at deeper levels', () => {
      const child = stepper.push('child')
      expect(child.states.length).toBe(0)
    })
  })

  describe('Basic Operations', () => {
    it('should push new named states correctly', () => {
      const child = stepper.push('child')
      expect(stepper.states.length).toBe(3) // SOS, child, EOS
      expect(child.id).toBe('child')
      expect(child.parent).toBe(stepper)
      expect(stepper.depth).toBe(0)
      expect(stepper.treeDepth).toBe(1)
      expect(child.depth).toBe(1)
      expect(child.treeDepth).toBe(0)
    })

    it('should provide array-like access to states', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      stepper.append(trials)

      // Test length (excluding SOS and EOS)
      expect(stepper.states.length).toBe(4) // SOS, 2 trials, EOS

      // Test array indexing (skipping SOS and EOS)
      expect(stepper.states[1].data).toEqual(trials[0])
      expect(stepper.states[2].data).toEqual(trials[1])

      // Test iteration
      const items = [...stepper.states].slice(1, -1) // Skip SOS and EOS
      expect(items.map((s) => s.data)).toEqual(trials)

      // Test array methods
      expect(stepper.states.indexOf(stepper.states[1])).toBe(1)
      expect(stepper.states.slice(1, 3).map((s) => s.data)).toEqual(trials)
    })

    it('should allow iterating on the states', () => {
      stepper.append(1)
      stepper.append(2)
      stepper.append(3)

      // Test forEach
      const results = []
      stepper.states.forEach((state, index) => {
        if (index > 0 && index < stepper.states.length - 1) {
          // Skip SOS and EOS
          results.push(state.data)
        }
      })
      expect(results).toEqual([1, 2, 3])

      // Test for...of loop
      const loopResults = []
      for (const state of stepper.states) {
        if (state.id !== 'SOS' && state.id !== 'EOS') {
          loopResults.push(state.data)
        }
      }
      expect(loopResults).toEqual([1, 2, 3])
    })

    it('should return path data from root to leaf', () => {
      const child = stepper.push('child')
      child.data = { level: 'first' }
      const grandchild = child.push('grandchild')
      grandchild.data = { value: 'test' }

      // Check that path data contains the data at each level
      const path = grandchild.pathData
      expect(Array.isArray(path)).toBe(true)
      expect(path).toHaveLength(2) // pathData contains data from both child and grandchild
      expect(path[0]).toEqual({ level: 'first' })
      expect(path[1]).toEqual({ value: 'test' })

      // Test the full path using pathString
      expect(grandchild.pathString).toBe('child/grandchild')
    })

    it('should create an empty stepper with correct initial state', () => {
      // Test empty state
      expect(stepper.states.length).toBe(2) // SOS and EOS
      expect(stepper.states[0].id).toBe('SOS')
      expect(stepper.states[1].id).toBe('EOS')
      expect(stepper.index).toBe(1) // starts at EOS

      // Test array-like properties
      expect(stepper.states[2]).toBeUndefined()
      expect(stepper.states[-1]).toBeUndefined()
    })

    it('should throw an error when pushing duplicate value', () => {
      stepper.push('test')
      expect(() => stepper.push('test')).toThrow(/State id already exists/)

      // Verify auto-generated values still work
      expect(() => stepper.push()).not.toThrow()
      expect(() => stepper.push()).not.toThrow()

      // Verify different values still work
      expect(() => stepper.push('B')).not.toThrow()
    })

    it('should allow pushing null values', () => {
      const state = stepper.push()
      expect(state).toBeTruthy()
    })

    it('should push new auto-numbered states correctly', () => {
      const child = stepper.push()
      expect(stepper.states.length).toBe(3) // SOS, child, EOS
      const child2 = stepper.push()
      expect(stepper.states.length).toBe(4) // SOS, child, child2, EOS
      expect(child.id).toBe(2) // Auto-numbered states start after SOS and EOS
      expect(child.parent).toBe(stepper)
      expect(child2.id).toBe(3)
      expect(child2.parent).toBe(stepper)
    })
  })

  describe('Tree Consistency Validation', () => {
    it('should correctly validate parent-child relationships', () => {
      // Create a simple hierarchical structure
      const child = stepper.push('child')
      const grandchild = child.push('grandchild')
      const greatGrandchild = grandchild.push('greatGrandchild')

      // This should not throw an error
      expect(() => {
        // Verify parent-child relationships
        expect(child.parent).toBe(stepper)
        expect(grandchild.parent).toBe(child)
        expect(greatGrandchild.parent).toBe(grandchild)

        // Verify depths
        expect(child.depth).toBe(1)
        expect(grandchild.depth).toBe(2)
        expect(greatGrandchild.depth).toBe(3)

        // Verify tree depths
        expect(stepper.treeDepth).toBe(3)
        expect(child.treeDepth).toBe(2)
        expect(grandchild.treeDepth).toBe(1)
        expect(greatGrandchild.treeDepth).toBe(0)
      }).not.toThrow()
    })

    it('should detect incorrect parent references', () => {
      // Create a structure with a deliberate error
      const child = stepper.push('child')
      const grandchild = child.push('grandchild')

      // Manually break the parent reference
      grandchild._parent = stepper // This is wrong, should be child

      // This should cause inconsistencies
      expect(grandchild.pathString).not.toBe('child/grandchild') // Path will be wrong
      expect(grandchild.pathString).toBe('grandchild') // Should only show current node
      expect(grandchild.depth).toBe(2) // Depth doesn't automatically update
      expect(grandchild.parent).toBe(stepper) // Should point to root
      expect(grandchild._parent).toBe(stepper) // Internal parent reference is updated
    })

    it('should maintain correct state indices', () => {
      const child = stepper.push('child')
      const grandchild = child.push('grandchild')

      // Verify indices are sequential
      expect(stepper.states.indexOf(child)).toBe(2) // After SOS and EOS
      expect(child.states.indexOf(grandchild)).toBe(0) // First child

      // Add another child and verify indices update
      const child2 = stepper.push('child2')
      expect(stepper.states.indexOf(child2)).toBe(3) // After first child
      expect(stepper.states.indexOf(stepper.states[stepper.states.length - 1])).toBe(3) // EOS at end
    })

    it('should maintain correct tree structure after modifications', () => {
      const child = stepper.push('child')
      const grandchild = child.push('grandchild')
      const greatGrandchild = grandchild.push('greatgrandchild')

      // Verify initial structure
      expect(stepper.treeDepth).toBe(3)
      expect(greatGrandchild.pathString).toBe('child/grandchild/greatgrandchild')

      // Add a sibling to grandchild
      const grandchild2 = child.push('grandchild2')
      expect(child.treeDepth).toBe(2) // Tree depth should still be 2
      expect(stepper.treeDepth).toBe(3) // Overall tree depth unchanged

      // Verify both grandchildren are children of child
      expect(child.states).toContain(grandchild)
      expect(child.states).toContain(grandchild2)
      expect(grandchild.parent).toBe(child)
      expect(grandchild2.parent).toBe(child)
    })
  })

  describe('append Operations', () => {
    it('should append a single item', () => {
      stepper.append({ test: 'value' })
      expect(stepper.states.length).toBe(3) // SOS, appended, EOS
      expect(stepper.states[1].data).toEqual({ test: 'value' })
    })

    it('should append multiple items', () => {
      stepper.append([{ test: 'value1' }, { test: 'value2' }])
      expect(stepper.states.length).toBe(4) // SOS, appended1, appended2, EOS
      expect(stepper.states[1].data).toEqual({ test: 'value1' })
      expect(stepper.states[2].data).toEqual({ test: 'value2' })
    })

    it('should allow building complex tables through multiple chained append operations', () => {
      // Create a stepper with multiple append operations
      const s1 = stepper
        .append([{ color: 'red', shape: 'triangle' }])
        .append([{ color: 'blue', shape: 'square' }])
        .append([{ color: 'green', shape: 'circle' }])
        .append([{ color: 'yellow', shape: 'star' }])

      // Test the final state
      expect(s1.states.length).toBe(6) // SOS + 4 items + EOS
      expect(s1.rowsData).toEqual([
        {}, // SOS
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
        { color: 'yellow', shape: 'star' },
        {}, // EOS
      ])

      // Test array-like access still works
      expect(s1.states.length - 2).toBe(4) // Excluding SOS and EOS
      expect(s1.states[1].data).toEqual({ color: 'red', shape: 'triangle' })
      expect(s1.states[4].data).toEqual({ color: 'yellow', shape: 'star' })

      // Test iteration (excluding SOS and EOS)
      const items = [...s1.states].slice(1, -1)
      expect(items).toHaveLength(4)

      // Test slice operation
      const slicedItems = s1.states.slice(2, 4).map((s) => s.data)
      expect(slicedItems).toEqual([
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
      ])
    })

    it('should append sequentially to the stepper when stored in a local variable', () => {
      const el = stepper.append(1)
      el.append(2)
      el.append(3)

      // check original stepper was modified
      expect(stepper.states.length).toBe(5) // SOS + 3 items + EOS
      expect(stepper.states[1].data).toBe(1)
      expect(stepper.states[2].data).toBe(2)
      expect(stepper.states[3].data).toBe(3)

      // check el was modified
      expect(el.states.length).toBe(5) // SOS + 3 items + EOS
      expect(el.states[1].data).toBe(1)
      expect(el.states[2].data).toBe(2)
      expect(el.states[3].data).toBe(3)

      // verify they are the same object
      expect(el).toBe(stepper)
    })

    it('should throw error when appending would exceed safety limit', () => {
      const maxRows = Number(config.maxStepperRows)
      const items = Array(maxRows + 1).fill({ color: 'red', shape: 'circle' })
      expect(() => {
        stepper.append(items)
      }).toThrow(/Cannot append \d+ rows as it exceeds the safety limit of \d+/)
    })

    it('should be chainable with other methods', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const s1 = stepper
        .append(trials)
        .shuffle({ seed: 'test-seed-123' })
        .append([{ color: 'green', shape: 'circle' }])

      expect(s1.states.length).toBe(5) // SOS + 3 items + EOS
      expect(s1.rowsData).toEqual([
        {}, // SOS
        { color: 'red', shape: 'triangle' }, // Shuffled order
        { color: 'blue', shape: 'square' }, // Shuffled order
        { color: 'green', shape: 'circle' },
        {}, // EOS
      ])
    })

    it('should skip items that would create duplicate paths', () => {
      stepper.append({ path: 'test' })
      stepper.append({ path: 'test' }) // Should be skipped
      expect(stepper.states.length).toBe(3) // SOS, test, EOS
    })
  })

  describe('outer Operations', () => {
    it('should create factorial combinations from arrays', () => {
      stepper.outer({
        color: ['red', 'blue'],
        size: ['small', 'large'],
      })
      expect(stepper.states.length).toBe(6) // SOS + 4 combinations + EOS
      expect(stepper.states[1].data).toEqual({ color: 'red', size: 'small' })
      expect(stepper.states[2].data).toEqual({ color: 'red', size: 'large' })
      expect(stepper.states[3].data).toEqual({ color: 'blue', size: 'small' })
      expect(stepper.states[4].data).toEqual({ color: 'blue', size: 'large' })
    })

    it('should handle single values by converting to arrays', () => {
      stepper.outer({
        color: 'red',
        size: ['small', 'large'],
      })
      expect(stepper.states.length).toBe(4) // SOS + 2 combinations + EOS
      expect(stepper.states[1].data).toEqual({ color: 'red', size: 'small' })
      expect(stepper.states[2].data).toEqual({ color: 'red', size: 'large' })
    })

    it('should throw error for non-object input', () => {
      expect(() => stepper.outer(null)).toThrow('outer() requires an object with arrays as values')
      expect(() => stepper.outer({})).toThrow('outer() requires at least one column')
      expect(() => stepper.outer('test')).toThrow('outer() requires an object with arrays as values')
    })

    it('should throw error for empty object input', () => {
      expect(() => stepper.outer({})).toThrow('outer() requires at least one column')
    })
  })

  describe('forEach Operations', () => {
    it('should execute callback for each item', () => {
      stepper.append([{ value: 1 }, { value: 2 }, { value: 3 }])

      const results = []
      stepper.forEach((item, index) => {
        results.push(item.data.value)
      })

      expect(results).toEqual([1, 2, 3])
    })

    it('should allow updating items through callback', () => {
      stepper.append([{ value: 1 }, { value: 2 }])

      stepper.forEach((item, index) => {
        return { value: item.data.value * 2 }
      })

      expect(stepper.states[1].data).toEqual({ value: 2 })
      expect(stepper.states[2].data).toEqual({ value: 4 })
    })

    it('should skip SOS and EOS states at depth 0', () => {
      stepper.append([{ value: 1 }, { value: 2 }])

      const results = []
      stepper.forEach((item, index) => {
        results.push(item.data.value)
      })

      expect(results).toEqual([1, 2]) // Should not include SOS or EOS
    })
  })

  describe('shuffle Operations', () => {
    it('should shuffle rows with a specific seed', () => {
      stepper.append([{ value: 'a' }, { value: 'b' }, { value: 'c' }, { value: 'd' }, { value: 'e' }])

      // Shuffle with a specific seed
      stepper.shuffle('test-seed-123')
      // The order should be deterministic with this seed
      // Skip SOS and EOS states by using rowsData
      expect(stepper.rowsData.map((r) => r.value).filter((v) => v !== undefined)).toEqual(['c', 'a', 'e', 'b', 'd'])
    })

    it('should produce consistent order with same seed', () => {
      const data = [{ value: 'a' }, { value: 'b' }, { value: 'c' }, { value: 'd' }, { value: 'e' }]

      // Create two steppers with same data
      const stepper1 = new Stepper({ id: '/' })
      const stepper2 = new Stepper({ id: '/' })
      stepper1.append(data)
      stepper2.append(data)

      // Shuffle both with same seed
      stepper1.shuffle('test-seed-123')
      stepper2.shuffle('test-seed-123')

      // They should have the same order
      expect(stepper1.rowsData.map((r) => r.value).filter((v) => v !== undefined)).toEqual(
        stepper2.rowsData.map((r) => r.value).filter((v) => v !== undefined)
      )
    })

    it('should use Math.random when no seed is provided', () => {
      stepper.append([{ value: 'a' }, { value: 'b' }, { value: 'c' }, { value: 'd' }, { value: 'e' }])

      // Mock Math.random to return deterministic values
      const originalRandom = Math.random
      let randomValues = [0.1, 0.2, 0.3, 0.4, 0.5]
      let randomIndex = 0
      Math.random = () => randomValues[randomIndex++ % randomValues.length]

      // Shuffle without a seed
      stepper.shuffle()

      // The order should be deterministic with our mocked Math.random
      expect(stepper.rowsData.map((r) => r.value).filter((v) => v !== undefined)).toEqual(['b', 'c', 'd', 'e', 'a'])

      // Restore Math.random
      Math.random = originalRandom
    })

    it('should preserve all elements after shuffling', () => {
      const originalData = [
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
        { id: 5, value: 'e' },
      ]

      stepper.append(originalData)
      const originalIds = [...stepper.rowsData.map((r) => r.id)].sort()

      // Shuffle with a specific seed
      stepper.shuffle('test-seed-123')
      const shuffledIds = [...stepper.rowsData.map((r) => r.id)].sort()

      // All elements should still be present, just in different order
      expect(shuffledIds).toEqual(originalIds)
    })

    it('should handle empty stepper', () => {
      stepper.shuffle('test-seed-123')
      expect(stepper.rowsData).toEqual([{}, {}])
    })

    it('should handle single element stepper', () => {
      stepper.append([{ id: 1, value: 'a' }])
      stepper.shuffle('test-seed-123')
      expect(stepper.rowsData).toEqual([{}, { id: 1, value: 'a' }, {}])
    })

    it('should be chainable with other methods', () => {
      stepper
        .append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
        ])
        .shuffle('test-seed-123')
        .append([{ id: 4, value: 'd' }])

      expect(stepper.rowsData).toHaveLength(6)
      expect(stepper.states[4].data).toEqual({ id: 4, value: 'd' })
    })

    it('should not shuffle again if already shuffled and always is false', () => {
      stepper.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
      ])

      // First shuffle
      stepper.shuffle('test-seed-123')
      const firstShuffleOrder = [...stepper.rowsData.map((r) => r.id)]

      // Second shuffle with same seed but always=false (default)
      stepper.shuffle('test-seed-123')
      const secondShuffleOrder = [...stepper.rowsData.map((r) => r.id)]

      // Order should remain the same
      expect(secondShuffleOrder).toEqual(firstShuffleOrder)
    })

    it('should shuffle again if always is true', () => {
      stepper.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
      ])

      // First shuffle
      stepper.shuffle('test-seed-123')
      const firstShuffleOrder = [...stepper.rowsData.map((r) => r.id)]

      // Second shuffle with always=true
      stepper.shuffle({ seed: 'test-seed-123', always: true })
      const secondShuffleOrder = [...stepper.rowsData.map((r) => r.id)]

      // Order should be different
      expect(secondShuffleOrder).not.toEqual(firstShuffleOrder)
    })

    it('should reset shuffled state when clearSubTree is called', () => {
      stepper.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
      ])

      // First shuffle
      stepper.shuffle('test-seed-123')
      const firstShuffleOrder = [...stepper.rowsData.map((r) => r.value).filter((v) => v !== undefined)]

      // Clear the subtree
      stepper.clearSubTree()

      // Add the same data again
      stepper.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
      ])

      // Shuffle again with different
      stepper.shuffle('test-seed-456')
      const secondShuffleOrder = [...stepper.rowsData.map((r) => r.value).filter((v) => v !== undefined)]

      // Order should be the same as first shuffle
      expect(secondShuffleOrder).not.toEqual(firstShuffleOrder)

      // Clear the subtree
      stepper.clearSubTree()

      // Add the same data again
      stepper.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
      ])

      // Shuffle again with different
      stepper.shuffle('test-seed-123')
      const thirdShuffleOrder = [...stepper.rowsData.map((r) => r.value).filter((v) => v !== undefined)]

      // Order should be the same as first shuffle
      expect(thirdShuffleOrder).toEqual(firstShuffleOrder)
    })
  })

  describe('zip Operations', () => {
    it('should zip columns with equal lengths', () => {
      const trials = {
        shape: ['circle', 'square', 'triangle'],
        color: ['red', 'green', 'blue'],
      }

      stepper.zip(trials)

      expect(stepper.states.length).toBe(5) // SOS + 3 trials + EOS
      expect(stepper.states[1].data).toEqual({ shape: 'circle', color: 'red' })
      expect(stepper.states[2].data).toEqual({ shape: 'square', color: 'green' })
      expect(stepper.states[3].data).toEqual({ shape: 'triangle', color: 'blue' })
    })

    it('should throw error by default when columns have different lengths', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      expect(() => {
        stepper.zip(trials)
      }).toThrow(
        'All columns must have the same length when using zip(). Specify a method (loop, pad, last) to handle different lengths.'
      )
    })

    it('should pad with specified value when using pad method', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      stepper.zip(trials, { method: 'pad', padValue: 'unknown' })

      expect(stepper.states.length).toBe(5) // SOS + 3 trials + EOS
      expect(stepper.states[1].data).toEqual({ shape: 'circle', color: 'red' })
      expect(stepper.states[2].data).toEqual({ shape: 'square', color: 'green' })
      expect(stepper.states[3].data).toEqual({ shape: 'unknown', color: 'blue' })
    })

    it('should handle null padValue', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      stepper.zip(trials, { method: 'pad', padValue: null })
      expect(stepper.states.length).toBe(5) // SOS + 3 trials + EOS
      expect(stepper.states[1].data).toEqual({ shape: 'circle', color: 'red' })
      expect(stepper.states[2].data).toEqual({ shape: 'square', color: 'green' })
      expect(stepper.states[3].data).toEqual({ shape: null, color: 'blue' })
    })

    it('should throw error when padValue is undefined', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      expect(() => {
        stepper.zip(trials, { method: 'pad' })
      }).toThrow('padValue is required when using the pad method')
    })

    it('should loop shorter columns', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      stepper.zip(trials, { method: 'loop' })

      expect(stepper.states.length).toBe(5) // SOS + 3 trials + EOS
      expect(stepper.states[1].data).toEqual({ shape: 'circle', color: 'red' })
      expect(stepper.states[2].data).toEqual({ shape: 'square', color: 'green' })
      expect(stepper.states[3].data).toEqual({ shape: 'circle', color: 'blue' })

      // Test with more loops
      stepper = new Stepper({ id: '/' })
      const trials2 = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue', 'yellow', 'purple'],
      }

      stepper.zip(trials2, { method: 'loop' })

      expect(stepper.states.length).toBe(7) // SOS + 5 trials + EOS
      expect(stepper.states[1].data).toEqual({ shape: 'circle', color: 'red' })
      expect(stepper.states[2].data).toEqual({ shape: 'square', color: 'green' })
      expect(stepper.states[3].data).toEqual({ shape: 'circle', color: 'blue' })
      expect(stepper.states[4].data).toEqual({ shape: 'square', color: 'yellow' })
      expect(stepper.states[5].data).toEqual({ shape: 'circle', color: 'purple' })

      // Test with multiple columns of different lengths
      stepper = new Stepper({ id: '/' })
      const trials3 = {
        shape: ['circle'],
        color: ['red', 'green', 'blue'],
        size: ['small', 'medium'],
      }

      stepper.zip(trials3, { method: 'loop' })

      expect(stepper.states.length).toBe(5) // SOS + 3 trials + EOS
      expect(stepper.states[1].data).toEqual({ shape: 'circle', color: 'red', size: 'small' })
      expect(stepper.states[2].data).toEqual({ shape: 'circle', color: 'green', size: 'medium' })
      expect(stepper.states[3].data).toEqual({ shape: 'circle', color: 'blue', size: 'small' })
    })

    it('should handle non-array values as single-element arrays', () => {
      const trials = {
        shape: 'circle',
        color: ['red', 'green', 'blue'],
      }

      stepper.zip(trials, { method: 'loop' })

      expect(stepper.states.length).toBe(5) // SOS + 3 trials + EOS
      expect(stepper.states[1].data).toEqual({ shape: 'circle', color: 'red' })
      expect(stepper.states[2].data).toEqual({ shape: 'circle', color: 'green' })
      expect(stepper.states[3].data).toEqual({ shape: 'circle', color: 'blue' })
    })

    it('should handle multiple non-array values', () => {
      const trials = {
        shape: 'circle',
        color: 'red',
        size: ['small', 'medium'],
      }

      stepper.zip(trials, { method: 'loop' })

      expect(stepper.states.length).toBe(4) // SOS + 2 trials + EOS
      expect(stepper.states[1].data).toEqual({ shape: 'circle', color: 'red', size: 'small' })
      expect(stepper.states[2].data).toEqual({ shape: 'circle', color: 'red', size: 'medium' })
    })

    it('should repeat last value when using last method', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      stepper.zip(trials, { method: 'last' })

      expect(stepper.states.length).toBe(5) // SOS + 3 trials + EOS
      expect(stepper.states[1].data).toEqual({ shape: 'circle', color: 'red' })
      expect(stepper.states[2].data).toEqual({ shape: 'square', color: 'green' })
      expect(stepper.states[3].data).toEqual({ shape: 'square', color: 'blue' })
    })

    it('should throw error for invalid method', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      expect(() => {
        stepper.zip(trials, { method: 'invalid' })
      }).toThrow('Invalid method: invalid. Must be one of: loop, pad, last')
    })

    it('should throw error for invalid input', () => {
      expect(() => {
        stepper.zip(null)
      }).toThrow('zip() requires an object with arrays as values')

      expect(() => {
        stepper.zip({})
      }).toThrow('zip() requires at least one column')
    })

    it('should throw error when zip would exceed safety limit', () => {
      // Create arrays that would exceed the limit when zipped
      // Subtract 2 to account for SOS and EOS states
      const trials = {
        shape: Array(config.maxStepperRows - 1).fill('circle'),
        color: Array(config.maxStepperRows - 1).fill('red'),
      }

      expect(() => {
        stepper.zip(trials)
      }).toThrow(/Cannot create \d+ combinations: would exceed maximum of \d+ rows/)
    })

    it('should be chainable with other methods', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green'],
      }

      stepper.zip(trials).append([{ shape: 'triangle', color: 'blue' }])

      expect(stepper.states.length).toBe(5) // SOS + 3 trials + EOS
      expect(stepper.states[1].data).toEqual({ shape: 'circle', color: 'red' })
      expect(stepper.states[2].data).toEqual({ shape: 'square', color: 'green' })
      expect(stepper.states[3].data).toEqual({ shape: 'triangle', color: 'blue' })
    })
  })
})
