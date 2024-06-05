import { useRoute, useRouter } from 'vue-router'
import _ from 'lodash'
import { RandomizeSubTimeline } from '@/core/subtimeline'
import useSmileStore from '@/core/stores/smilestore'
import useLog from '@/core/stores/log'

export default function useTimeline() {
  const smilestore = useSmileStore()
  const route = useRoute()
  const router = useRouter()
  const log = useLog()

  const nextView = () => {
    // HANDLE RANDOMIZATION OF SUBTIMELINES
    // if the next thing has a type field of randomized_sub_timeline, then we want to randomize the subtimeline

    if (route.meta.next.type === 'randomized_sub_timeline') {
      // get shuffled routes -- have to just give it the whole router or else there are problems
      const orderedRoutes = RandomizeSubTimeline(route.meta.next, router)

      // return the next route
      return { name: orderedRoutes[0].name, query: route.query }
    }

    // HANDLE REGULAR ROUTES
    // otherwise we're just doing the normal thing
    if (route.meta.next) {
      return { name: route.meta.next, query: route.query }
    }
    return null
  }

  const prevView = () => {
    if (route.meta.prev) {
      return { name: route.meta.prev, query: route.query }
    }
    return null
  }

  const gotoView = async (view, force = true) => {
    // unfortunately this is required because the router
    // doesn't allow you to pass configuration options
    // directly to the router.push() function
    // although there's some plan about it in future
    if (force) {
      smilestore.global.forceNavigate = true
      await router.push({ name: view })
      smilestore.global.forceNavigate = false
    } else {
      await router.push({ name: view })
    }
  }

  // this is the internal function that actually navigates to the next route
  const navigateTo = (goto) => {
    // sets the current page as done
    smilestore.dev.current_page_done = true

    if (smilestore.config.auto_save) {
      log.log('TIMELINE STEPPER: Attempting auto saving on navigateTo() navigation')
      smilestore.saveData() // automatically saves data
    }
    if (goto) router.push(goto)
  }

  const stepNextView = (fn) => {
    if (fn) fn()
    navigateTo(nextView())
  }
  const stepPrevView = (fn) => {
    if (fn) fn()
    navigateTo(prevView())
  }

  return { stepNextView, stepPrevView, gotoView }
}
