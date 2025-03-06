import { describe, it, expect, beforeEach } from 'vitest'
import { StepState } from '@/core/composables/StepState'

describe('StepState', () => {
  let stepper

  beforeEach(() => {
    stepper = new StepState('/')
  })

  describe.skip('basic interactive checks', () => {
    it('should make sense to use', () => {
      const a = stepper.push('a')
      const a1 = a.push()
      const a2 = a.push()

      const b = stepper.push('b')
      const c = stepper.push('c')
      console.log(stepper.getTreeDiagram())

      stepper.reset()
      console.log(a2.getPath())
      console.log(stepper.getNodeDepth())
      console.log(a2.getNodeDepth())
      console.log('tree depth at', stepper.getTreeDepth())
      console.log('tree depth at', a.getTreeDepth())
      console.log('tree depth at', a2.getTreeDepth())
      console.log('tree depth at', b.getTreeDepth())
      stepper.reset()
      console.log(stepper.next()) // 0
      console.log(stepper.next()) // 1
      console.log(stepper.next()) // b
      console.log(stepper.next()) // c
      console.log(stepper.next()) //null
      console.log(stepper.next()) //null
      console.log(stepper.prev()) // b
      console.log(stepper.prev()) // a
    })
  })

  describe('basic operations', () => {
    it('should create a root state with correct initial values', () => {
      expect(stepper.value).toBe('/')
      expect(stepper.states).toEqual([])
      expect(stepper.currentIndex).toBe(-1)
      expect(stepper.parent).toBeNull()
      expect(stepper.getNodeDepth()).toBe(0)
    })

    it('should push new named states correctly', () => {
      const child = stepper.push('child')
      expect(stepper.states.length).toBe(1)
      expect(child.value).toBe('child')
      expect(child.parent).toBe(stepper)
      expect(stepper.getNodeDepth()).toBe(0)
      expect(stepper.getTreeDepth()).toBe(1)
      expect(child.getNodeDepth()).toBe(1)
      expect(child.getTreeDepth()).toBe(0)
    })

    it('should push new numbered states correctly', () => {
      const child = stepper.push()
      expect(stepper.states.length).toBe(1)
      const child2 = stepper.push()
      expect(stepper.states.length).toBe(2)
      expect(child.value).toBe(0)
      expect(child.parent).toBe(stepper)
      expect(child2.value).toBe(1)
      expect(child2.parent).toBe(stepper)
    })

    it('should reset state correctly', () => {
      const child = stepper.push('child')
      child.push('grandchild')
      stepper.currentIndex = 0
      child.currentIndex = 0

      stepper.reset()
      expect(stepper.currentIndex).toBe(-1)
      expect(child.currentIndex).toBe(-1)
    })

    it('should not allow pushing duplicate values', () => {
      const root = new StepState()
      root.push('A')

      // Attempt to push duplicate value should throw error
      expect(() => root.push('A')).toThrow('State with value "A" already exists in this node')

      // Verify auto-generated values still work
      expect(() => root.push()).not.toThrow()
      expect(() => root.push()).not.toThrow()

      // Verify different values still work
      expect(() => root.push('B')).not.toThrow()
    })
  })

  describe('path operations', () => {
    it('should get correct path', () => {
      const child = stepper.push('child')
      const grandchild = child.push('grandchild')
      expect(grandchild.getPath()).toEqual(['child', 'grandchild'])
    })

    it('should get correct depth', () => {
      const child = stepper.push('child')
      const grandchild = child.push('grandchild')
      expect(grandchild.getNodeDepth()).toBe(2)
    })

    it('should get current path correctly', () => {
      const child1 = stepper.push('child1')
      const grandchild1 = child1.push('grandchild1')
      const child2 = stepper.push('child2')

      // Initially no path is selected
      expect(stepper.getCurrentPath()).toEqual([])

      // Navigate through the tree
      stepper.next() // moves to grandchild1
      expect(stepper.getCurrentPath()).toEqual(['child1', 'grandchild1'])

      stepper.next() // moves to child1
      expect(stepper.getCurrentPath()).toEqual(['child2'])
    })

    it('should get current path string correctly with mixed named and indexed nodes', () => {
      const child1 = stepper.push('child1')
      const autoChild1 = child1.push() // Will be '0'
      const autoChild2 = child1.push() // Will be '1'
      const child2 = stepper.push('child2')
      const namedChild = child2.push('named')

      // Initially no path is selected
      expect(stepper.getCurrentPathStr()).toBe('')

      // Navigate through the tree
      stepper.next() // moves to first auto-indexed child
      expect(stepper.getCurrentPathStr()).toBe('child1-0')

      stepper.next() // moves to second auto-indexed child
      expect(stepper.getCurrentPathStr()).toBe('child1-1')

      stepper.next() // moves to named child
      expect(stepper.getCurrentPathStr()).toBe('child2-named')
    })
  })

  describe('navigation', () => {
    it('should navigate forward correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')

      expect(stepper.next()).toBe('child1')
      expect(stepper.next()).toBe('child2')
      expect(stepper.next()).toBeNull()
    })

    it('should navigate backward correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')

      stepper.next() // child1
      stepper.next() // child2

      expect(stepper.prev()).toBe('child1')
      expect(stepper.prev()).toBeNull()
    })

    it('should navigate a complex tree correctly', () => {
      // create a complex tree with 4 children of the
      // root node with various depths for each child
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
      //console.log(stepper.getTreeDiagram())

      // now navigate through the tree
      expect(stepper.next()).toBe('greatgrandchild1')
      expect(stepper.next()).toBe('greatgrandchild2')
      expect(stepper.next()).toBe('greatgrandchild3')
      expect(stepper.next()).toBe('greatgrandchild4')
      expect(stepper.next()).toBe('grandchild4')
      expect(stepper.next()).toBe('grandchild5')
      expect(stepper.next()).toBe('grandchild6')
      expect(stepper.next()).toBe('greatgrandchild6')
      expect(stepper.next()).toBe('greatgrandchild7')
      expect(stepper.next()).toBeNull()

      // now navigate backward
      //expect(stepper.prev()).toBe('greatgrandchild7')  // this is not output because we stop on last node
      expect(stepper.prev()).toBe('greatgrandchild6')
      expect(stepper.prev()).toBe('grandchild6')
      expect(stepper.prev()).toBe('grandchild5')
      expect(stepper.prev()).toBe('grandchild4')
      expect(stepper.prev()).toBe('greatgrandchild4')
      expect(stepper.prev()).toBe('greatgrandchild3')
      expect(stepper.prev()).toBe('greatgrandchild2')
      expect(stepper.prev()).toBe('greatgrandchild1')
      expect(stepper.prev()).toBeNull()
      expect(stepper.next()).toBe('greatgrandchild1')
    })

    it('should peek next correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')

      expect(stepper.peekNext()).toBe('child1')
      expect(stepper.currentIndex).toBe(-1) // Should not change position
    })

    it('should peek prev correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')

      stepper.next() // child1
      stepper.next() // child2

      expect(stepper.peekPrev()).toBe('child1')
      expect(stepper.currentIndex).toBe(1) // Should not change position
    })
  })

  describe('visualization', () => {
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
      //console.log(stepper.getTreeDiagram())
      expect(stepper.getTreeDiagram()).toBe(
        '/\n' +
          '├── child1\n' +
          '│   ├── grandchild1\n' +
          '│   │   └── greatgrandchild1\n' +
          '│   ├── grandchild2\n' +
          '│   │   └── greatgrandchild2\n' +
          '│   └── grandchild3\n' +
          '│       ├── greatgrandchild3\n' +
          '│       └── greatgrandchild4\n' +
          '├── child2\n' +
          '│   ├── grandchild4\n' +
          '│   └── grandchild5\n' +
          '├── child3\n' +
          '│   └── grandchild6\n' +
          '└── child4\n' +
          '    └── grandchild7\n' +
          '        ├── greatgrandchild6\n' +
          '        └── greatgrandchild7\n'
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

      expect(stepper.getLeafNodes()).toEqual([
        ['child1', 'grandchild1', 'greatgrandchild1'],
        ['child1', 'grandchild2', 'greatgrandchild2'],
        ['child1', 'grandchild3', 'greatgrandchild3'],
        ['child1', 'grandchild3', 'greatgrandchild4'],
        ['child2', 'grandchild4'],
        ['child2', 'grandchild5'],
        ['child3', 'grandchild6'],
        ['child4', 'grandchild7', 'greatgrandchild6'],
        ['child4', 'grandchild7', 'greatgrandchild7'],
      ])
    })
  })

  describe('node access', () => {
    it('should get node by index and value correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')

      // Test getting by index
      expect(stepper.getNode(0)).toBe(child1)
      expect(stepper.getNode(1)).toBe(child2)
      expect(stepper.getNode(2)).toBe(child3)
      expect(stepper.getNode(3)).toBeNull()

      // Test getting by value
      expect(stepper.getNode('child1')).toBe(child1)
      expect(stepper.getNode('child2')).toBe(child2)
      expect(stepper.getNode('child3')).toBe(child3)
      expect(stepper.getNode('nonexistent')).toBeNull()
    })
  })

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const child = stepper.push('child')
      child.push('grandchild')
      stepper.next() // Advance to create some state

      const serialized = stepper.toJSON()
      const newState = new StepState('root')
      newState.loadFromJSON(serialized)

      expect(newState.toJSON()).toEqual(serialized)
    })

    it('should preserve navigation state after serialization', () => {
      // Create a simple tree and advance through it
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')
      const child4 = stepper.push('child4')
      stepper.next() // to child1
      stepper.next() // to child2

      // Serialize and deserialize
      const serialized = stepper.toJSON()
      const newState = new StepState('/')
      newState.loadFromJSON(serialized)

      // Verify navigation works as expected
      expect(newState.next()).toBe('child3') // Can go backwards
      expect(newState.prev()).toBe('child2') // Can go backwards
      expect(newState.next()).toBe('child3') // Can go forwards
      expect(newState.next()).toBe('child4') // Preserves end of sequence
    })
  })

  describe('data management', () => {
    it('should initialize with null data', () => {
      expect(stepper.getData()).toBeNull()
    })

    it('should store and retrieve data', () => {
      const data = { test: 'value' }
      stepper.setData(data)
      expect(stepper.getData()).toEqual(data)
    })

    it('should update existing data', () => {
      stepper.setData({ initial: 'data' })
      const newData = { updated: 'value' }
      stepper.setData(newData)
      expect(stepper.getData()).toEqual(newData)
    })

    it('should allow null data', () => {
      stepper.setData({ test: 'value' })
      stepper.setData(null)
      expect(stepper.getData()).toBeNull()
    })
  })

  describe('data serialization', () => {
    let stepper

    beforeEach(() => {
      stepper = new StepState('/')
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

      stepper.setData(testData)
      const serialized = stepper.toJSON()
      const newState = new StepState('/')
      newState.loadFromJSON(serialized)

      expect(newState.getData()).toEqual(testData)
    })

    it('should handle data serialization in nested nodes', () => {
      const child = stepper.push('child')
      child.setData({ childData: 'test' })
      const grandchild = child.push('grandchild')
      grandchild.setData({ grandchildData: 123 })

      const serialized = stepper.toJSON()
      const newState = new StepState('/')
      newState.loadFromJSON(serialized)

      expect(newState.getNode('child').getData()).toEqual({ childData: 'test' })
      expect(newState.getNode('child').getNode('grandchild').getData()).toEqual({ grandchildData: 123 })
    })

    it('should handle non-serializable data types', () => {
      const nonSerializableData = {
        function: () => console.log('hello'),
        vueComponent: { template: '<div></div>', setup: () => ({}) },
        domElement: typeof window !== 'undefined' ? document.createElement('div') : {},
        regexp: /test/,
        undefined: undefined,
      }

      stepper.setData(nonSerializableData)
      const serialized = stepper.toJSON()
      const newState = new StepState('/')
      newState.loadFromJSON(serialized)

      const deserializedData = newState.getData()
      expect(deserializedData.function).toBeUndefined()
      expect(deserializedData.undefined).toBeUndefined()
      // DOM elements become empty objects
      expect(deserializedData.domElement).toEqual({})
      // RegExp becomes an empty object
      expect(deserializedData.regexp).toEqual({})
    })
  })
})

// flatten this string
