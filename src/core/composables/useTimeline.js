import { useRoute, useRouter } from 'vue-router'
import _ from 'lodash'
import useSmileStore from '@/core/stores/smilestore'
import useLog from '@/core/stores/log'

export default function useTimeline() {
  const smilestore = useSmileStore()
  const route = useRoute()
  const router = useRouter()
  const log = useLog()

  const lookupNext = (routeName) => {
    // Get all routes from the router
    const routes = router.getRoutes()

    // Find the specified route
    const currentRoute = routes.find((r) => r.name === routeName)
    if (!currentRoute) return null

    // If the route has a next property, find that route
    if (currentRoute.meta?.next) {
      const nextRoute = routes.find((r) => r.name === currentRoute.meta.next)
      if (nextRoute) {
        return {
          name: nextRoute.name,
          query: route.query,
        }
      }
    }
    return null
  }

  const nextView = () => {
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

  const goToView = async (view, force = true) => {
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

  const goNextView = (fn) => {
    if (fn) fn()
    navigateTo(nextView())
  }
  const goPrevView = (fn) => {
    if (fn) fn()
    navigateTo(prevView())
  }

  return { goNextView, goPrevView, goToView, lookupNext }
}
