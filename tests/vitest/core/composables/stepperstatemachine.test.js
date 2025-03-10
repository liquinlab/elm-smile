import { describe, it, expect, beforeEach } from 'vitest'
import { StepperStateMachine } from '@/core/composables/StepperStateMachine'

describe('StepperStateMachine', () => {
  let stepper

  beforeEach(() => {
    stepper = new StepperStateMachine()
  })

  describe('push', () => {
    it('should add a new state with a value', () => {
      const state = stepper.push('test')
      expect(state).toBeTruthy()
    })

    it('should throw error when pushing duplicate value', () => {
      stepper.push('test')
      expect(() => stepper.push('test')).toThrow('Push failed')
    })

    it('should allow pushing null values', () => {
      const state = stepper.push()
      expect(state).toBeTruthy()
    })
  })

  describe('navigation', () => {
    beforeEach(() => {
      stepper.push('first')
      stepper.push('second')
      stepper.push('third')
    })

    it('should traverse forward through states', () => {
      expect(stepper.next()).toBe('first')
      expect(stepper.next()).toBe('second')
      expect(stepper.next()).toBe('third')
      expect(stepper.next()).toBeNull()
    })

    it('should traverse backward through states', () => {
      // Move to end first
      stepper.next()
      stepper.next()
      stepper.next()

      expect(stepper.prev()).toBe('second')
      expect(stepper.prev()).toBe('first')
      expect(stepper.prev()).toBeNull()
    })

    it('should reset to initial state', () => {
      stepper.next()
      stepper.next()
      stepper.reset()
      expect(stepper.next()).toBe('first')
    })
  })

  describe('proxy behavior', () => {
    it('should allow chained access to nested states', () => {
      stepper.push('parent')
      stepper['parent'].push('child')
      expect(stepper['parent']).toBeTruthy()
      expect(stepper['parent']['child']).toBeTruthy()
    })

    it('should support deep nested state access and manipulation', () => {
      // Create a deep chain: level1 -> level2 -> level3 -> level4
      stepper.push('level1')
      stepper['level1'].push('level2')
      stepper['level1']['level2'].push('level3')
      stepper['level1']['level2']['level3'].push('level4')

      // Verify each level exists and can be accessed
      expect(stepper['level1']).toBeTruthy()
      expect(stepper['level1']['level2']).toBeTruthy()
      expect(stepper['level1']['level2']['level3']).toBeTruthy()
      expect(stepper['level1']['level2']['level3']['level4']).toBeTruthy()

      // Verify we can add a sibling at a deep level
      stepper['level1']['level2']['level3'].push('level4sibling')
      expect(stepper['level1']['level2']['level3']['level4sibling']).toBeTruthy()

      // Verify non-existent paths at deep levels return undefined
      expect(stepper['level1']['level2']['nonexistent']).toBeUndefined()
      expect(stepper['level1']['level2']['level3']['nonexistent']).toBeUndefined()
    })

    it('should return undefined for non-existent paths', () => {
      expect(stepper['nonexistent']).toBeUndefined()
    })
  })

  describe('tree diagram', () => {
    it('should generate tree representation', () => {
      stepper.push('A')
      stepper['A'].push('B')
      stepper['A']['B'].push('C')

      const diagram = stepper.getTreeDiagram()
      expect(diagram).toBeTypeOf('string')
      expect(diagram).toContain('A')
      expect(diagram).toContain('B')
      expect(diagram).toContain('C')
    })
  })

  describe('data management', () => {
    it('should store data during push', () => {
      const data = { test: 'value' }
      stepper.push('first', data)
      expect(stepper['first'].getData()).toEqual([data])
    })

    it('should allow setting data after creation', () => {
      stepper.push('first')
      const data = { test: 'value' }
      stepper['first'].setData(data)
      expect(stepper['first'].getData()).toEqual([data])
    })

    it('should update existing data', () => {
      stepper.push('first', { test: 'value' })
      const newData = { updated: 'value' }
      stepper['first'].setData(newData)
      expect(stepper['first'].getData()).toEqual([newData])
    })

    it('should set data at specified path', () => {
      stepper.push('first')
      stepper['first'].push('second')
      const data = { test: 'value' }
      stepper.setDataAtPath(['first', 'second'], data)
      expect(stepper['first']['second'].getData()).toEqual([data])
    })

    it('should set data using string path', () => {
      stepper.push('first')
      stepper['first'].push('second')
      const data = { test: 'value' }
      stepper.setDataAtPath('first-second', data)
      expect(stepper['first']['second'].getData()).toEqual([data])
    })

    it('should throw error for invalid path in setDataAtPath', () => {
      expect(() => stepper.setDataAtPath('nonexistent', {})).toThrow('Invalid path')
    })

    it('should return empty array for nodes without data', () => {
      stepper.push('first')
      expect(stepper['first'].getData()).toEqual([])
    })
  })

  describe('serialization', () => {
    it('should serialize and deserialize a simple state machine', () => {
      stepper.push('first')
      stepper.push('second')
      stepper['second'].push('child')
      stepper['second']['child'].setData({ test: 'value' })

      const serialized = stepper.toJSON()
      const newStepper = new StepperStateMachine()
      newStepper.loadFromJSON(serialized)

      // Verify structure
      expect(newStepper['first']).toBeTruthy()
      expect(newStepper['second']).toBeTruthy()
      expect(newStepper['second']['child']).toBeTruthy()

      // Verify data
      expect(newStepper['second']['child'].getData()).toEqual([{ test: 'value' }])
    })

    it('should preserve navigation state after serialization', () => {
      // Create a complex tree and navigate through it
      stepper.push('A')
      stepper['A'].push('B')
      stepper['A']['B'].push('C')
      stepper.push('D')
      stepper['D'].push('E')

      // Navigate through the tree
      stepper.next() // to A
      stepper['A'].next() // to B
      stepper['A']['B'].next() // to C

      const serialized = stepper.toJSON()
      const newStepper = new StepperStateMachine()
      newStepper.loadFromJSON(serialized)

      // Verify navigation state is preserved
      expect(newStepper.getCurrentPath()).toEqual(['A', 'B', 'C'])
    })

    it('should handle non-serializable data in nested nodes', () => {
      const nonSerializableData = {
        function: () => console.log('hello'),
        vueComponent: { template: '<div></div>', setup: () => ({}) },
        domElement: typeof window !== 'undefined' ? document.createElement('div') : {},
        regexp: /test/,
        undefined: undefined,
      }

      stepper.push('test')
      stepper['test'].setData(nonSerializableData)

      const serialized = stepper.toJSON()
      const newStepper = new StepperStateMachine()
      newStepper.loadFromJSON(serialized)

      const deserializedData = newStepper['test'].getData()
      expect(deserializedData.function).toBeUndefined()
      expect(deserializedData.undefined).toBeUndefined()
      expect(deserializedData.domElement).toBeUndefined()
      expect(deserializedData.regexp).toBeUndefined()
    })

    it('should preserve tree structure and data after serialization', () => {
      // Create a complex tree with data at various levels
      stepper.push('root1', { rootData: 1 })
      stepper['root1'].push('child1', { childData: 1 })
      stepper['root1'].push('child2', { childData: 2 })
      stepper.push('root2', { rootData: 2 })
      stepper['root2'].push('child3', { childData: 3 })

      const serialized = stepper.toJSON()
      const newStepper = new StepperStateMachine()
      newStepper.loadFromJSON(serialized)

      // Verify tree structure
      expect(newStepper.getTreeDiagram()).toBe(stepper.getTreeDiagram())

      // Verify data at all levels
      expect(newStepper['root1'].getData()).toEqual([{ rootData: 1 }])
      expect(newStepper['root1']['child1'].getData()).toEqual([{ childData: 1 }])
      expect(newStepper['root1']['child2'].getData()).toEqual([{ childData: 2 }])
      expect(newStepper['root2'].getData()).toEqual([{ rootData: 2 }])
      expect(newStepper['root2']['child3'].getData()).toEqual([{ childData: 3 }])
    })
  })
})
