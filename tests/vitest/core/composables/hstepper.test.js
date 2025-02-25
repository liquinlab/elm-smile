import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useHStepper } from '@/core/composables/useHStepper'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import useSmilestore from '@/core/stores/smilestore'

// Add this mock
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => ({
      name: 'test-route',
    }),
  }
})

describe.skip('useHStepper', () => {
  let router
  let app

  beforeEach(async () => {
    // Create Vue app
    app = createApp({})

    // Setup Pinia
    const pinia = createPinia()
    setActivePinia(pinia)
    app.use(pinia)

    // Register page tracker in smilestore
    const smilestore = useSmilestore()
    smilestore.registerPageTracker('test-route')
  })

  it('initializes with an empty root state', async () => {
    const step = useHStepper([])
    //console.log('step', step)
    expect(step.index()).toBe(0)
    expect(step.current()).toBeUndefined()
  })

  // it('can push top-level states', () => {
  //   const timeline = new TimelineStateMachine()
  //   timeline.push('1')
  //   timeline.push('2')
  //   timeline.push('3')
  //   expect(timeline.length).toBe(3)
  // })

  // it('can create nested states', () => {
  //   const timeline = new TimelineStateMachine()
  //   timeline.push('1')
  //   timeline[0].push('a')
  //   timeline[0].push('b')

  //   expect(timeline.length).toBe(1)
  //   expect(timeline[0].states.length).toBe(2)
  // })

  // it('navigates through states correctly', () => {
  //   const timeline = new TimelineStateMachine()
  //   timeline.push('1')
  //   timeline[0].push('a')
  //   timeline[0].push('b')

  //   expect(timeline.next()).toBe('a') // First child of '1'
  //   expect(timeline.next()).toBe('b') // Second child of '1'
  //   expect(timeline.prev()).toBe('a') // Back to first child
  // })

  // it('returns null when no more next states', () => {
  //   const timeline = new TimelineStateMachine()
  //   timeline.push('1')
  //   timeline[0].push('a')

  //   timeline.next() // Move to 'a'
  //   expect(timeline.next()).toBe(null)
  // })

  // it('can peek at next and previous states without moving', () => {
  //   const timeline = new TimelineStateMachine()
  //   timeline.push('1')
  //   timeline[0].push('a')
  //   timeline[0].push('b')

  //   timeline.next() // Move to 'a'
  //   expect(timeline.peekNext()).toBe('b')
  //   expect(timeline.getCurrentPath()).toEqual(['1', 'a']) // Position unchanged
  // })

  // it('can get current path', () => {
  //   const timeline = new TimelineStateMachine()
  //   timeline.push('1')
  //   timeline[0].push('a')
  //   timeline[0].states[0].push('x')

  //   timeline.next() // Move to 'a'
  //   timeline.next() // Move to 'x'
  //   expect(timeline.getCurrentPath()).toEqual(['1', 'a', 'x'])
  // })

  // it('can set position by path', () => {
  //   const timeline = new TimelineStateMachine()
  //   timeline.push('1')
  //   timeline[0].push('a')
  //   timeline[0].states[0].push('x')
  //   timeline[0].states[0].push('y')

  //   timeline.setPosition('1-a-y')
  //   expect(timeline.getCurrentPath().join('-')).toBe('1-a-y')
  // })

  // it('can be serialized and deserialized', () => {
  //   const timeline = new TimelineStateMachine()
  //   timeline.push('1')
  //   timeline[0].push('a')
  //   timeline[0].states[0].push('x')

  //   const serialized = timeline.toString()
  //   const newTimeline = TimelineStateMachine.fromString(serialized)

  //   expect(newTimeline.length).toBe(timeline.length)
  //   expect(newTimeline[0].states[0].states[0].value).toBe('x')
  // })

  // it('can get leaf nodes', () => {
  //   const timeline = new TimelineStateMachine()
  //   timeline.push('1')
  //   timeline[0].push('a')
  //   timeline[0].push('b')
  //   timeline[0].states[0].push('x')
  //   timeline[0].states[0].push('y')

  //   const leafNodes = timeline.getLeafNodes()
  //   expect(leafNodes).toContainEqual(['1', 'a', 'x'])
  //   expect(leafNodes).toContainEqual(['1', 'a', 'y'])
  //   expect(leafNodes).toContainEqual(['1', 'b'])
  // })

  // it('throws error when setting invalid position', () => {
  //   const timeline = new TimelineStateMachine()
  //   timeline.push('1')
  //   timeline[0].push('a')

  //   expect(() => timeline.setPosition('1-b-x')).toThrow('Invalid position')
  // })
})
