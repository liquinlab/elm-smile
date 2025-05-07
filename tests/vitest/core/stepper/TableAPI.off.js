import { describe, it, expect, beforeEach, vi } from 'vitest'
import Stepper from '@/core/stepper/Stepper'
import StepState from '@/core/stepper/StepState'
import config from '@/core/config'

// Mock the config
vi.mock('@/core/config', () => ({
  default: {
    maxStepperRows: 3, // Set a small number for testing
  },
}))

describe('Stepper', () => {
  let table

  beforeEach(() => {
    table = new Stepper()
  })

  describe('inheritance', () => {
    it('should be an instance of Stepper', () => {
      const table = new Stepper()
      expect(table).toBeInstanceOf(Stepper)
    })

    it('should be an instance of StepState', () => {
      const table = new Stepper()
      expect(table).toBeInstanceOf(StepState)
    })

    it('should have all StepState properties', () => {
      const table = new Stepper()
      expect(table).toHaveProperty('id')
      expect(table).toHaveProperty('states')
      expect(table).toHaveProperty('index')
      expect(table).toHaveProperty('data')
      expect(table).toHaveProperty('parent')
      expect(table).toHaveProperty('root')
    })
  })

  describe('array indexing', () => {
    it('should support array indexing', () => {
      const table = new Stepper()
      const items = [{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }]
      table.append(items)

      // Test positive indexing
      expect(table[0]).toBeDefined()
      expect(table[0].data).toEqual(items[0])
      expect(table[1]).toBeDefined()
      expect(table[1].data).toEqual(items[1])
      expect(table[2]).toBeDefined()
      expect(table[2].data).toEqual(items[2])
      expect(table[3]).toBeUndefined()

      // Test negative indexing
      expect(table[-1]).toBeDefined()
      expect(table[-1].data).toEqual(items[2])
      expect(table[-2]).toBeDefined()
      expect(table[-2].data).toEqual(items[1])
      expect(table[-3]).toBeDefined()
      expect(table[-3].data).toEqual(items[0])
      expect(table[-4]).toBeUndefined()
    })

    it('should allow chaining with array indexing', () => {
      const table = new Stepper()
      const items = [
        { type: 'stim', value: 'X' },
        { type: 'stim', value: 'Y' },
      ]
      table.append(items)

      // Test chaining with array indexing
      const nestedItems = [
        { type: 'nested', value: 'A' },
        { type: 'nested', value: 'B' },
      ]
      table[0].append(nestedItems)

      expect(table[0][0].data).toEqual(nestedItems[0])
      expect(table[0][1].data).toEqual(nestedItems[1])
    })

    it('should support negative indexing', () => {
      const table = new Stepper()
      const items = [{ name: 'item1' }, { name: 'item2' }]
      table.append(items)

      expect(table[-1].data).toEqual(items[1])
      expect(table[-2].data).toEqual(items[0])
    })

    it('should support string indexing', () => {
      const table = new Stepper()
      const items = [{ name: 'item1' }, { name: 'item2' }]
      table.append(items)

      expect(table['0'].data).toEqual(items[0])
    })

    it('should support path indexing', () => {
      const table = new Stepper()
      const items = [
        { name: 'item1', path: 'item1' },
        { name: 'item2', path: 'item2' },
      ]
      table.append(items)

      expect(table['item1'].data).toEqual(items[0])
      expect(table['item2'].data).toEqual(items[1])
    })
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const table = new Stepper()
      expect(table.id).toBe('/')
      expect(table.states).toEqual([])
      expect(table.index).toBe(0)
      expect(table.data).toEqual({})
      expect(table.parent).toBeNull()
      expect(table.root.id).toBe('/')
    })

    it('should initialize with custom id', () => {
      const table = new Stepper()
      const customTable = new Stepper('custom-id')
      expect(customTable.id).toBe('custom-id')
    })

    it('should initialize with parent', () => {
      const parent = new Stepper('parent')
      const child = new Stepper('child', parent)
      expect(child.parent.id).toBe('parent')
      expect(child.root.id).toBe('parent')
    })
  })

  describe('append()', () => {
    it('should append a single item', () => {
      const table = new Stepper()
      console.log('table', table.existingPaths)
      const item = { type: 'stim', value: 'X' }
      table.append(item)

      expect(table.states).toHaveLength(1)
      expect(table.states[0].data).toEqual(item)
    })

    it('should append multiple items', () => {
      const table = new Stepper()
      const items = [
        { type: 'stim', value: 'X' },
        { type: 'stim', value: 'Y' },
      ]
      table.append(items)

      expect(table.states).toHaveLength(2)
      expect(table.states[0].data).toEqual(items[0])
      expect(table.states[1].data).toEqual(items[1])
    })

    it('should be chainable', () => {
      const table = new Stepper()
      const result = table.append({ type: 'stim', value: 'X' }).append([
        { type: 'stim', value: 'Y' },
        { type: 'stim', value: 'Z' },
      ])

      expect(result).toBe(table)
      expect(table.states).toHaveLength(3)
      expect(table.states[0].data).toEqual({ type: 'stim', value: 'X' })
      expect(table.states[1].data).toEqual({ type: 'stim', value: 'Y' })
      expect(table.states[2].data).toEqual({ type: 'stim', value: 'Z' })
    })

    it('should throw error when exceeding maxStepperRows', () => {
      const table = new Stepper()
      // Fill up to maxStepperRows
      table.append({ type: 'stim', value: 'X' })
      table.append({ type: 'stim', value: 'Y' })
      table.append({ type: 'stim', value: 'Z' })

      // Try to append one more item
      expect(() => {
        table.append({ type: 'stim', value: 'W' })
      }).toThrow(`Cannot append 1 items: would exceed maximum of ${config.maxStepperRows} rows`)
    })

    it('should throw error when exceeding maxStepperRows with multiple items', () => {
      const table = new Stepper()
      // Fill up to maxStepperRows - 1
      table.append({ type: 'stim', value: 'X' })
      table.append({ type: 'stim', value: 'Y' })

      // Try to append two more items
      expect(() => {
        table.append([
          { type: 'stim', value: 'Z' },
          { type: 'stim', value: 'W' },
        ])
      }).toThrow(`Cannot append 2 items: would exceed maximum of ${config.maxStepperRows} rows`)
    })

    it('should throw error when duplicate paths are detected', () => {
      const table = new Stepper()
      const item1 = { type: 'stim', value: 'X', path: 'same' }
      const item2 = { type: 'stim', value: 'Y', path: 'same' }
      table.append(item1)

      // Try to append an item with the same path
      expect(() => {
        table.append(item2)
      }).toThrow('Cannot append items: would create duplicate paths')
    })

    it('should throw error when duplicate paths are added at the same time', () => {
      const table = new Stepper()
      const items = [
        { type: 'stim', value: 'X', path: 'same' },
        { type: 'stim', value: 'Y', path: 'same' },
      ]
      expect(() => {
        table.append(items)
      }).toThrow('Cannot append items: would create duplicate paths')
    })

    it('should not throw error when no path name provide (implictly becomes the counter)', () => {
      const table = new Stepper()
      const items = [
        { type: 'stim', value: 'X' },
        { type: 'stim', value: 'Y' },
      ]
      expect(() => {
        table.append(items)
      }).not.toThrow('Cannot append items: would create duplicate paths')
    })
  })

  describe('outer()', () => {
    it('should create factorial combinations of provided arrays', () => {
      const table = new Stepper()
      const result = table.outer({
        color: ['red'],
        shape: ['circle', 'square'],
        size: ['small'],
      })

      expect(result).toBe(table)
      expect(table.states).toHaveLength(2) // 1 * 2 * 1 = 2 combinations

      // Check combinations
      expect(table.states[0].data).toEqual({ color: 'red', shape: 'circle', size: 'small' })
      expect(table.states[1].data).toEqual({ color: 'red', shape: 'square', size: 'small' })
    })

    it('should handle single array input', () => {
      const table = new Stepper()
      const result = table.outer({
        color: ['red', 'blue'],
      })

      expect(result).toBe(table)
      expect(table.states).toHaveLength(2)
      expect(table.states[0].data).toEqual({ color: 'red' })
      expect(table.states[1].data).toEqual({ color: 'blue' })
    })

    it('should handle empty arrays', () => {
      const table = new Stepper()
      const result = table.outer({
        color: [],
        shape: ['circle'],
      })

      expect(result).toBe(table)
      expect(table.states).toHaveLength(0)
    })

    it('should be chainable', () => {
      const table = new Stepper()
      const result = table
        .outer({
          color: ['red'],
        })
        .outer({
          shape: ['circle'],
        })

      expect(result).toBe(table)
      expect(table.states).toHaveLength(2)
      expect(table.states[0].data).toEqual({ color: 'red' })
      expect(table.states[1].data).toEqual({ shape: 'circle' })
    })

    it('should work on sub-components', () => {
      const table = new Stepper()
      table.append({ type: 'parent' })

      const result = table[0].outer({
        color: ['red', 'blue'],
      })

      expect(result).toBe(table[0])
      expect(table[0].states).toHaveLength(2)
      expect(table[0].states[0].data).toEqual({ color: 'red' })
      expect(table[0].states[1].data).toEqual({ color: 'blue' })
    })
  })

  describe('forEach()', () => {
    it('should iterate over all items', () => {
      const table = new Stepper()
      table.append([
        { type: 'stim', value: 'X' },
        { type: 'stim', value: 'Y' },
      ])

      const visited = []
      const result = table.forEach((item, index) => {
        visited.push({ ...item.data, index })
      })

      expect(result).toBe(table)
      expect(visited).toEqual([
        { type: 'stim', value: 'X', index: 0 },
        { type: 'stim', value: 'Y', index: 1 },
      ])
    })

    it('should allow modifying items', () => {
      const table = new Stepper()
      table.append([
        { type: 'stim', value: 'X' },
        { type: 'stim', value: 'Y' },
      ])

      const result = table.forEach((item) => {
        item.value = item.value.toLowerCase()
      })

      expect(result).toBe(table)
      expect(table.states[0].data).toEqual({ type: 'stim', value: 'x' })
      expect(table.states[1].data).toEqual({ type: 'stim', value: 'y' })
    })

    it('should allow adding new properties', () => {
      const table = new Stepper()
      table.append([
        { type: 'stim', value: 'X' },
        { type: 'stim', value: 'Y' },
      ])

      const result = table.forEach((item) => {
        return { ...item.data, newProp: 'added' }
      })

      expect(result).toBe(table)
      expect(table.states[0].data).toEqual({ type: 'stim', value: 'X', newProp: 'added' })
      expect(table.states[1].data).toEqual({ type: 'stim', value: 'Y', newProp: 'added' })
    })

    it('should be chainable', () => {
      const table = new Stepper()
      table.append([
        { type: 'stim', value: 'X' },
        { type: 'stim', value: 'Y' },
      ])

      const result = table
        .forEach((item) => {
          item.value = item.value.toLowerCase()
        })
        .forEach((item) => {
          return { ...item.data, processed: true }
        })

      expect(result).toBe(table)
      expect(table.states[0].data).toEqual({ type: 'stim', value: 'x', processed: true })
      expect(table.states[1].data).toEqual({ type: 'stim', value: 'y', processed: true })
    })

    it('should work on sub-components', () => {
      const table = new Stepper()
      table.append({ type: 'parent' })
      table[0].append([
        { type: 'child', value: 'A' },
        { type: 'child', value: 'B' },
      ])

      const result = table[0].forEach((item) => {
        return { ...item.data, processed: true }
      })

      expect(result).toBe(table[0])
      expect(table[0].states[0].data).toEqual({ type: 'child', value: 'A', processed: true })
      expect(table[0].states[1].data).toEqual({ type: 'child', value: 'B', processed: true })
    })
  })

  describe('data serialization', () => {
    let stepper

    beforeEach(() => {
      stepper = new Stepper('/')
    })

    it('should serialize and deserialize simple data types', () => {
      const testData = {
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        nestedObject: { a: 1, b: 2 },
      }

      stepper.data = testData
      const serialized = stepper.json
      const newState = new Stepper('/')
      newState.loadFromJSON(serialized)

      expect(newState.data).toEqual(testData)
    })

    it('should handle data serialization in nested nodes', () => {
      const child = stepper.push('child')
      child.data = { childData: 'test' }
      const grandchild = child.push('grandchild')
      grandchild.data = { grandchildData: 123 }

      const serialized = stepper.json
      const newState = new Stepper('/')
      newState.loadFromJSON(serialized)

      expect(newState.getNode('child').data).toEqual({ childData: 'test' })
      expect(newState.getNode('child').getNode('grandchild').data).toEqual({ grandchildData: 123 })
    })

    it('should reload a complex table and set the paths correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')
      const child4 = stepper.push('child4')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child1.push('grandchild3')
      const grandchild4 = child2.push('grandchild4')
      const grandchild5 = child2.push('grandchild5')
      const grandchild6 = child3.push('grandchild6')
      const grandchild7 = child4.push('grandchild7')
      // add greatgrandchild to some of the grandchildren
      const greatgrandchild1 = grandchild1.push('greatgrandchild1')
      const greatgrandchild2 = grandchild2.push('greatgrandchild2')
      const greatgrandchild3 = grandchild3.push('greatgrandchild3')
      const greatgrandchild4 = grandchild3.push('greatgrandchild4')
      const greatgrandchild6 = grandchild7.push('greatgrandchild6')
      const greatgrandchild7 = grandchild7.push('greatgrandchild7')

      stepper.next()
      stepper.next()
      stepper.next()
      stepper.next()
      expect(stepper.currentPaths).toEqual('child2/grandchild4')

      const serialized = stepper.json
      const newState = new Stepper('/')
      newState.loadFromJSON(serialized)

      expect(newState.currentPaths).toEqual('child2/grandchild4')
      expect(grandchild4.pathString).toEqual('child2/grandchild4')

      newState.next()
      newState.next()
      expect(newState.currentPaths).toEqual('child3/grandchild6')
      expect(grandchild6.pathString).toEqual('child3/grandchild6')

      // Verify parent references are maintained after deserialization
      expect(newState.parent).toBeNull() // Root state should have null parent
      expect(newState['child1'].parent).toBe(newState)
    })

    it('should handle non-serializable data types', () => {
      const nonSerializableData = {
        function: () => console.log('hello'),
        vueComponent: { template: '<div></div>', setup: () => ({}) },
        domElement: typeof window !== 'undefined' ? document.createElement('div') : {},
        regexp: /test/,
        undefined: undefined,
      }

      stepper.data = nonSerializableData
      const serialized = stepper.json
      const newState = new Stepper('/')
      newState.loadFromJSON(serialized)

      const deserializedData = newState.data
      expect(deserializedData.function).toBeUndefined()
      expect(deserializedData.undefined).toBeUndefined()
      // DOM elements and RegExp are skipped entirely during serialization
      expect(deserializedData.domElement).toBeUndefined()
      expect(deserializedData.regexp).toBeUndefined()
    })
  })
})
