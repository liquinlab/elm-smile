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

  const nextRoute = () => {
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

  const prevRoute = () => {
    if (route.meta.prev) {
      return { name: route.meta.prev, query: route.query }
    }
    return null
  }

  const navigateTo = (goto) => {
    // sets the current page as done
    smilestore.dev.current_page_done = true

    if (smilestore.config.auto_save) {
      log.log('TIMELINE STEPPER: Attempting auto saving on navigateTo() navigation')
      smilestore.saveData() // automatically saves data
    }
    if (goto) router.push(goto)
  }

  const stepNextRoute = (fn) => {
    if (fn) fn()
    navigateTo(nextRoute())
  }
  const stepPrevRoute = (fn) => {
    if (fn) fn()
    navigateTo(prevRoute())
  }

  return { stepNextRoute, stepPrevRoute, navigateTo }
}
