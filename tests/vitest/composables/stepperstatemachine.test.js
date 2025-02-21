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
})
