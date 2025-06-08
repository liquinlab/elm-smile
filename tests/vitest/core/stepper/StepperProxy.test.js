import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import Stepper from '@/core/stepper/Stepper'

describe('StepperProxy', () => {
  let proxy
  let pinia

  beforeEach(() => {
    // Create pinia instance and set it as active
    pinia = createTestingPinia({ stubActions: true })
    setActivePinia(pinia)

    // Create a new Stepper instance which will be wrapped by StepperProxy

    // // Add some test states
    // stepper.append([
    //   { id: 'state1', data: 'state1' },
    //   { id: 'state2', data: 'state2' },
    //   { id: 'state3', data: 'state3' },
    // ])

    // // Add some test nodes
    // stepper.push('node1', { id: 'node1' })
    // stepper.push('node2', { id: 'node2' })

    // // Add some test properties and methods
    // stepper.someProperty = 'value'
    // stepper.someMethod = () => 'method result'
  })

  describe('array-like access', () => {
    it.only('should handle positive indices with SOS/EOS adjustment at depth 0', () => {
      // The proxy is automatically created by the Stepper constructor
      const stepper = new Stepper({ id: '/' })

      console.log(
        'each state',
        stepper._states.forEach((state) => state.id)
      )

      stepper.insert('state1', -2)
      stepper.insert('state2', -2)
      stepper.insert('state3', -2)
      // At depth 0, indices are adjusted by +1 to skip SOS state

      expect(stepper.depth).toBe(0)
      expect(stepper[0].id).toBe('state1')

      // the first state is SOS
      expect(stepper.states[0].id).toBe('SOS')
      expect(stepper[1].id).toBe('state2')
      expect(stepper[2].id).toBe('state3')
    })

    it('should handle negative indices', () => {
      // Negative indices are adjusted relative to array length
      expect(proxy[-1].data).toBe('state3')
      expect(proxy[-2].data).toBe('state2')
      expect(proxy[-3].data).toBe('state1')
      expect(proxy[-4]).toBeUndefined()
    })

    it('should return undefined for out of bounds indices', () => {
      expect(proxy[3]).toBeUndefined()
      expect(proxy[-4]).toBeUndefined()
    })

    it('should handle string number indices', () => {
      // String numbers are converted to actual numbers
      expect(proxy['0'].data).toBe('state1')
      expect(proxy['1'].data).toBe('state2')
      expect(proxy['-1'].data).toBe('state3')
    })
  })

  describe('property access', () => {
    it('should access properties of the target object', () => {
      expect(proxy.someProperty).toBe('value')
    })

    it('should access methods of the target object', () => {
      expect(proxy.someMethod()).toBe('method result')
    })

    it('should return undefined for non-existent properties', () => {
      expect(proxy.nonExistentProperty).toBeUndefined()
    })
  })

  describe('node access', () => {
    it('should access nodes through getNode method', () => {
      expect(proxy.node1.data).toEqual({ id: 'node1' })
      expect(proxy.node2.data).toEqual({ id: 'node2' })
    })

    it('should return undefined for non-existent nodes', () => {
      expect(proxy.nonExistentNode).toBeUndefined()
    })
  })

  describe('depth handling', () => {
    it('should adjust indices at depth 0', () => {
      // At depth 0, indices are adjusted by +1 to skip SOS state
      expect(proxy[0].data).toBe('state1')
      expect(proxy[1].data).toBe('state2')
      expect(proxy[2].data).toBe('state3')
    })

    it('should not adjust indices at other depths', () => {
      // Create a child stepper at depth 1
      const childStepper = stepper.push('child')
      childStepper.append([
        { id: 'state1', data: 'state1' },
        { id: 'state2', data: 'state2' },
        { id: 'state3', data: 'state3' },
      ])

      // At non-zero depth, no index adjustment
      expect(childStepper[0].data).toBe('state1')
      expect(childStepper[1].data).toBe('state2')
      expect(childStepper[2].data).toBe('state3')
      expect(childStepper[3]).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should handle empty states array', () => {
      const emptyStepper = new Stepper({ id: '/', parent: null })
      expect(emptyStepper[0]).toBeUndefined()
      expect(emptyStepper[-1]).toBeUndefined()
    })

    it('should handle non-string/number properties', () => {
      const symbol = Symbol('test')
      expect(proxy[symbol]).toBeUndefined()
    })
  })
})
