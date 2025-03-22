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
      expect(stepper.next()).toBe('EOS')
      expect(stepper.next()).toBe('EOS')
    })

    it('should traverse backward through states', () => {
      // Move to end first
      stepper.next()
      stepper.next()
      stepper.next()
      stepper.next()
      stepper.next()

      expect(stepper.prev()).toBe('third')
      expect(stepper.prev()).toBe('second')
      expect(stepper.prev()).toBe('first')
      expect(stepper.prev()).toBe('SOS')
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

  describe('visualization', () => {
    it('should generate tree representation', () => {
      stepper.push('A')
      stepper['A'].push('B')
      stepper['A']['B'].push('C')

      const diagram = stepper.treeDiagram
      expect(diagram).toBeTypeOf('string')
      expect(diagram).toContain('A')
      expect(diagram).toContain('B')
      expect(diagram).toContain('C')
    })

    it('should render a tree diagram correctly', () => {
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
      //console.log(stepper.treeDiagram)
      expect(stepper.treeDiagram).toBe(
        '/\n├── SOS\n├── child1\n│   ├── grandchild1\n│   │   └── greatgrandchild1\n│   ├── grandchild2\n│   │   └── greatgrandchild2\n│   └── grandchild3\n│       ├── greatgrandchild3\n│       └── greatgrandchild4\n├── child2\n│   ├── grandchild4\n│   └── grandchild5\n├── child3\n│   └── grandchild6\n├── child4\n│   └── grandchild7\n│       ├── greatgrandchild6\n│       └── greatgrandchild7\n├── EOS\n'
      )
    })

    it('should get the leaf nodes correctly', () => {
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

      expect(stepper.leafNodes).toEqual([
        ['SOS'],
        ['child1', 'grandchild1', 'greatgrandchild1'],
        ['child1', 'grandchild2', 'greatgrandchild2'],
        ['child1', 'grandchild3', 'greatgrandchild3'],
        ['child1', 'grandchild3', 'greatgrandchild4'],
        ['child2', 'grandchild4'],
        ['child2', 'grandchild5'],
        ['child3', 'grandchild6'],
        ['child4', 'grandchild7', 'greatgrandchild6'],
        ['child4', 'grandchild7', 'greatgrandchild7'],
        ['EOS'],
      ])
    })
  })

  describe('current path', () => {
    it('should get current path correctly', () => {
      const child1 = stepper.push('child1')
      const grandchild1 = child1.push('grandchild1')
      const child2 = stepper.push('child2')

      // Initially no path is selected
      expect(stepper.currentPath).toEqual(['SOS'])

      // Navigate through the tree
      stepper.next() // moves to grandchild1
      expect(stepper.currentPath).toEqual(['child1', 'grandchild1'])

      stepper.next() // moves to child1
      expect(stepper.currentPath).toEqual(['child2'])
    })

    it('should get current path correctly when called on a child', () => {
      const child1 = stepper.push('child1')
      const grandchild1 = child1.push('grandchild1')
      const child2 = stepper.push('child2')

      // Initially no path is selected
      expect(stepper.currentPath).toEqual(['SOS'])

      // Navigate through the tree
      stepper.next() // moves to grandchild1
      expect(stepper.currentPath).toEqual(['child1', 'grandchild1'])

      stepper.next() // moves to child1
      expect(stepper.currentPath).toEqual(['child2'])
    })

    it('should get current path string correctly with mixed named and indexed nodes', () => {
      const child1 = stepper.push('child1')
      const autoChild1 = child1.push() // Will be '0'
      const autoChild2 = child1.push() // Will be '1'
      const child2 = stepper.push('child2')
      const namedChild = child2.push('named')

      // Initially no path is selected
      expect(stepper.currentPaths).toBe('SOS')

      // Navigate through the tree
      stepper.next() // moves to first auto-indexed child
      expect(stepper.currentPaths).toBe('child1-0')

      stepper.next() // moves to second auto-indexed child
      expect(stepper.currentPaths).toBe('child1-1')

      stepper.next() // moves to named child
      expect(stepper.currentPaths).toBe('child2-named')
    })
  })

  describe('data management', () => {
    it('should store data during push', () => {
      const data = { test: 'value' }
      stepper.push('first', data)
      expect(stepper['first'].data).toEqual(data)
    })

    it('should allow setting data after creation', () => {
      stepper.push('first')
      const data = { test: 'value' }
      stepper['first'].data = data
      expect(stepper['first'].data).toEqual(data)
    })

    it('should update existing data', () => {
      stepper.push('first', { test: 'value' })
      const newData = { updated: 'value' }
      stepper['first'].data = newData
      expect(stepper['first'].data).toEqual(newData)
    })

    it('should set data at specified path', () => {
      stepper.push('first')
      stepper['first'].push('second')
      const data = { test: 'value' }
      stepper.setDataAtPath(['first', 'second'], data)
      expect(stepper['first']['second'].data).toEqual(data)
    })

    it('should set data using string path', () => {
      stepper.push('first')
      stepper['first'].push('second')
      const data = { test: 'value' }
      stepper.setDataAtPath('first-second', data)
      expect(stepper['first']['second'].data).toEqual(data)
    })

    it('should throw error for invalid path in setDataAtPath', () => {
      expect(() => stepper.setDataAtPath('nonexistent', {})).toThrow('Invalid path')
    })

    it('should return null for nodes without data', () => {
      stepper.push('first')
      expect(stepper['first'].data).toEqual(null)
    })

    it('should get data along the current path', () => {
      stepper.push('first', { data1: 1 })
      stepper['first'].push('second', { data2: 2 })
      stepper['first']['second'].push('third', { data3: 3 })

      // Navigate to the deepest node
      stepper.next()
      stepper['first'].next()
      stepper['first']['second'].next()

      const pathData = stepper['first']['second']['third'].pathdata
      expect(pathData).toEqual([{ data1: 1 }, { data2: 2 }, { data3: 3 }])
    })

    it('should return empty array for path with no data', () => {
      stepper.push('first')
      stepper['first'].push('second')
      stepper['first']['second'].push('third')

      // Navigate to the deepest node
      stepper.next()
      stepper['first'].next()
      stepper['first']['second'].next()

      const pathData = stepper['first']['second']['third'].pathdata
      expect(pathData).toEqual([])
    })

    it('should get current path as hyphen-separated string', () => {
      stepper.push('first')
      stepper['first'].push('second')
      stepper['first']['second'].push('third')

      // Navigate to the deepest node
      stepper.next()
      stepper['first'].next()
      stepper['first']['second'].next()

      expect(stepper['first']['second']['third'].currentPaths).toBe('first-second-third')
    })

    it('should be start of sequence (SOS) for root path', () => {
      expect(stepper.currentPaths).toBe('SOS')
    })
  })

  describe('root reference', () => {
    it('should set _root to self when creating root instance', () => {
      const root = new StepperStateMachine()
      expect(root._root).toStrictEqual(root)
    })

    it('should maintain reference to root through nested instances', () => {
      const root = new StepperStateMachine()
      root.push('level1')
      root['level1'].push('level2')
      root['level1']['level2'].push('level3')

      // Verify each level has reference to the root
      expect(root['level1']._root).toStrictEqual(root)
      expect(root['level1']['level2']._root).toStrictEqual(root)
      expect(root['level1']['level2']['level3']._root).toStrictEqual(root)
    })

    it('should allow operations at root level from nested instances', () => {
      const root = new StepperStateMachine()
      root.push('A')
      root.push('B')

      // Access root's treeDiagram from a nested instance
      const nestedDiagram = root['A']._root.treeDiagram
      const rootDiagram = root.treeDiagram

      expect(nestedDiagram).toBe(rootDiagram)
    })
  })

  describe('serialization', () => {
    it('should serialize and deserialize a simple state machine', () => {
      stepper.push('first')
      stepper.push('second')
      stepper['second'].push('child')
      stepper['second']['child'].data = { test: 'value' }

      const serialized = stepper.json
      const newStepper = new StepperStateMachine()
      newStepper.loadFromJSON(serialized)

      // Verify structure
      expect(newStepper['first']).toBeTruthy()
      expect(newStepper['second']).toBeTruthy()
      expect(newStepper['second']['child']).toBeTruthy()

      // Verify data
      expect(newStepper['second']['child'].data).toEqual({ test: 'value' })
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

      const serialized = stepper.json
      const newStepper = new StepperStateMachine()
      newStepper.loadFromJSON(serialized)

      // Verify navigation state is preserved
      expect(newStepper.currentPath).toEqual(['A', 'B', 'C'])
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
      stepper['test'].data = nonSerializableData

      const serialized = stepper.json
      const newStepper = new StepperStateMachine()
      newStepper.loadFromJSON(serialized)

      const deserializedData = newStepper['test'].data
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

      const serialized = stepper.json
      const newStepper = new StepperStateMachine()
      newStepper.loadFromJSON(serialized)

      // Verify tree structure
      expect(newStepper.treeDiagram).toBe(stepper.treeDiagram)

      // Verify data at all levels
      expect(newStepper['root1'].data).toEqual({ rootData: 1 })
      expect(newStepper['root1']['child1'].data).toEqual({ childData: 1 })
      expect(newStepper['root1']['child2'].data).toEqual({ childData: 2 })
      expect(newStepper['root2'].data).toEqual({ rootData: 2 })
      expect(newStepper['root2']['child3'].data).toEqual({ childData: 3 })
    })
  })
})
