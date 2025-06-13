import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StepperSerializer } from '@/core/stepper/StepperSerializer'
import { Stepper } from '@/core/stepper/Stepper'
import { defineComponent } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import useSmileStore from '@/core/stores/smilestore'

describe('StepperSerializer', () => {
  let stepper
  let root
  let pinia
  let store

  beforeEach(() => {
    // Set up Pinia
    pinia = createPinia()
    setActivePinia(pinia)
    store = useSmileStore()

    // Create a root stepper with mock faker API
    root = new Stepper({ id: '/', parent: null, store })
    root.api = {
      faker: {
        randomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        randomName: () => 'John Doe',
      },
    }
    stepper = new Stepper({ id: 'test', parent: root, store })
  })

  describe('serialization', () => {
    it('should serialize basic data types', () => {
      const data = {
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        nestedObject: { a: 1, b: 2 },
      }
      stepper.data = data

      const serialized = StepperSerializer.serialize(stepper)
      expect(serialized.data).toEqual(data)
    })

    it('should handle faker functions', () => {
      const data = {
        randomNum: () => root.api.faker.randomNumber(1, 10),
        randomName: () => root.api.faker.randomName(),
      }
      stepper.data = data

      const serialized = StepperSerializer.serialize(stepper)
      expect(serialized.data.randomNum).toEqual({
        __fakerFunction: true,
        name: 'randomNumber',
        params: ['1', '10'],
      })
      expect(serialized.data.randomName).toEqual({
        __fakerFunction: true,
        name: 'randomName',
        params: [''],
      })
    })

    it('should handle Vue components', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        template: '<div>Test</div>',
      })

      const data = {
        component: TestComponent,
        type: TestComponent,
      }
      stepper.data = data

      const serialized = StepperSerializer.serialize(stepper)
      expect(serialized.data.component).toEqual({
        __vueComponent: true,
        componentName: 'TestComponent',
      })
      expect(serialized.data.type).toEqual({
        __vueComponent: true,
        componentName: 'TestComponent',
      })
    })

    it('should skip non-serializable data types', () => {
      const data = {
        function: () => console.log('hello'),
        domElement: typeof window !== 'undefined' ? document.createElement('div') : {},
        regexp: /test/,
        undefined: undefined,
      }
      stepper.data = data

      const serialized = StepperSerializer.serialize(stepper)
      expect(serialized.data.function).toBeUndefined()
      expect(serialized.data.domElement).toBeUndefined()
      expect(serialized.data.regexp).toBeUndefined()
      expect(serialized.data.undefined).toBeUndefined()
    })

    it('should serialize nested stepper structure', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const grandchild = child1.push('grandchild')

      const serialized = StepperSerializer.serialize(stepper)
      expect(serialized.states).toHaveLength(2)
      expect(serialized.states[0].id).toBe('child1')
      expect(serialized.states[0].states).toHaveLength(1)
      expect(serialized.states[0].states[0].id).toBe('grandchild')
      expect(serialized.states[1].id).toBe('child2')
    })
  })

  describe('deserialization', () => {
    it('should deserialize basic data types', () => {
      const data = {
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        nestedObject: { a: 1, b: 2 },
      }

      const serialized = {
        id: 'test',
        currentIndex: 0,
        depth: 1,
        states: [],
        shuffled: false,
        data,
      }

      const newStepper = new Stepper({ id: 'test', parent: root, store })
      StepperSerializer.deserialize(serialized, newStepper, root)
      expect(newStepper._data).toEqual(data)
    })

    it('should reconstruct faker functions', () => {
      const serialized = {
        id: 'test',
        currentIndex: 0,
        depth: 1,
        states: [],
        shuffled: false,
        data: {
          randomNum: {
            __fakerFunction: true,
            name: 'randomNumber',
            params: ['1', '10'],
          },
          randomName: {
            __fakerFunction: true,
            name: 'randomName',
            params: [''],
          },
        },
      }

      const newStepper = new Stepper({ id: 'test', parent: root, store })
      StepperSerializer.deserialize(serialized, newStepper, root)

      expect(typeof newStepper._data.randomNum).toBe('function')
      expect(typeof newStepper._data.randomName).toBe('function')
      expect(newStepper._data.randomNum()).toBeGreaterThanOrEqual(1)
      expect(newStepper._data.randomNum()).toBeLessThanOrEqual(10)
      expect(newStepper._data.randomName()).toBe('John Doe')
    })

    it('should handle Vue components', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        template: '<div>Test</div>',
      })

      const serialized = {
        id: 'test',
        currentIndex: 0,
        depth: 1,
        states: [],
        shuffled: false,
        data: {
          component: {
            __vueComponent: true,
            componentName: 'TestComponent',
          },
        },
      }

      const newStepper = new Stepper({ id: 'test', parent: root, store })
      StepperSerializer.deserialize(serialized, newStepper, root)

      expect(newStepper._data.component).toEqual({
        name: 'TestComponent',
        __vueComponent: true,
      })
    })

    it('should handle nested stepper structure', () => {
      const serialized = {
        id: 'test',
        currentIndex: 0,
        depth: 1,
        states: [
          {
            id: 'child1',
            currentIndex: 0,
            depth: 2,
            states: [
              {
                id: 'grandchild',
                currentIndex: 0,
                depth: 3,
                states: [],
                shuffled: false,
                data: {},
              },
            ],
            shuffled: false,
            data: {},
          },
          {
            id: 'child2',
            currentIndex: 0,
            depth: 2,
            states: [],
            shuffled: false,
            data: {},
          },
        ],
        shuffled: false,
        data: {},
      }

      const newStepper = new Stepper({ id: 'test', parent: root, store })
      StepperSerializer.deserialize(serialized, newStepper, root)

      expect(newStepper.states).toHaveLength(2)
      expect(newStepper.states[0].id).toBe('child1')
      expect(newStepper.states[0].states).toHaveLength(1)
      expect(newStepper.states[0].states[0].id).toBe('grandchild')
      expect(newStepper.states[1].id).toBe('child2')
    })

    it('should throw error for invalid data', () => {
      const invalidData = {
        id: 'test',
        // Missing required fields
      }

      const newStepper = new Stepper({ id: 'test', parent: root, store })
      expect(() => StepperSerializer.deserialize(invalidData, newStepper, root)).toThrow(
        'Missing required fields in data'
      )
    })

    it('should throw error for invalid field types', () => {
      const invalidData = {
        id: 123, // Should be string
        currentIndex: '0', // Should be number
        depth: '1', // Should be number
        states: {}, // Should be array
        shuffled: 'false', // Should be boolean
        data: {},
      }

      const newStepper = new Stepper({ id: 'test', parent: root, store })
      expect(() => StepperSerializer.deserialize(invalidData, newStepper, root)).toThrow(
        'Invalid id: Expected string but received number'
      )
    })
  })
})
