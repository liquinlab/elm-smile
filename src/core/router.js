import seedrandom from 'seedrandom'
import { createRouter, createWebHashHistory } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import useSmileStore from '@/core/stores/smilestore' // get access to the global store
import { getQueryParams } from '@/core/utils'
import timeline from '@/user/design'
import useLog from '@/core/stores/log'
const log = useLog()

import useAPI from '@/core/composables/useAPI'
const api = useAPI()
// 3. add navigation guards
//    currently these check if user is known
//    and if they are, they redirect to last route
function addGuards(r) {
  r.beforeEach(async (to, from) => {
    if (api.isResetApp()) {
      log.warn('ROUTER GUARD: Resetting app')
      api.resetLocalState()
    }

    // check if status change on previous
    if (from.meta !== undefined && from.meta.setConsented !== undefined && from.meta.setConsented) {
      api.completeConsent()
    }

    if (from.meta !== undefined && from.meta.setDone !== undefined && from.meta.setDone) {
      api.setDone()
    }

    if (to.meta !== undefined && to.meta.resetApp !== undefined && to.meta.resetApp) {
      api.resetApp() // set reset app on next load
    }

    // Set queries to be combination of from queries and to queries
    // (TO overwrites FROM if there is one with the same key)
    // Also add queries that come before the URL -- this later
    // case might not be necessary but was a old problem with
    // prolific.
    const newQueries = {
      ...from.query,
      ...to.query,
      ...getQueryParams(),
    }
    to.query = newQueries

    // log.debug('query params', to.query)
    // log.debug('loading', to.name)
    // log.debug('from', from.name)
    // log.debug('allowAlways', to.meta.allowAlways)

    const smilestore = useSmileStore()
    // on startup set the page to not autofill by default

    // if the database isn't connected and they're a known user, reload their data
    if (smilestore.isKnownUser && !smilestore.isDBConnected) {
      const res = await smilestore.loadData()
    }

    // if withdrew
    // this is leading to infinite redirects.
    // if (smilestore.isWithdrawn && !smilestore.global.forceNavigate) {
    //   log.debug("withdraw so can't go anywhere")
    //   return {
    //     name: 'withdraw',
    //     replace: true,
    //   }
    // }

    // if you're going to an always-allowed route, allow it
    if (to.meta.allowAlways) {
      log.log(`ROUTER GUARD: Requested navigation (${to.name}) is always allowed, so allowing it.`)
      smilestore.setLastRoute(to.name)
      smilestore.recordRoute(to.name)
      return true
    }

    // if the route requires withdraw and the user has withdrawn
    // then allow it.
    if (to.meta.requiresWithdraw && smilestore.isWithdrawn) {
      log.warn('ROUTER GUARD: Requested withdraw route and is withdrawn so allowing it')
      smilestore.setLastRoute(to.name)
      smilestore.recordRoute(to.name)
      return true
    }

    // // If user is withdraw
    if (smilestore.isWithdrawn) {
      log.warn('ROUTER GUARD: User has withdrawn, redirecting to withdraw page')
      return {
        name: 'withdraw', // this could be lastRoute too
        replace: true,
      }
    }

    // if you're in jumping mode
    // or you're in presentation mode allow the new route
    if (
      (smilestore.config.mode === 'development' && smilestore.global.forceNavigate) ||
      smilestore.config.mode === 'presentation'
    ) {
      log.warn(
        'ROUTER GUARD: Allowing direct, out-of-order navigation to /' +
          to.name +
          //to.meta.allowAlways +,
          '.  This is allowed in development/presentation mode but not in production.'
      )
      smilestore.setLastRoute(to.name)
      smilestore.recordRoute(to.name)
      return true
    }

    // if this is forced
    if (smilestore.global.forceNavigate) {
      log.warn(
        'ROUTER GUARD: Allowing direct, out-of-order navigation to /' +
          to.name +
          //to.meta.allowAlways +,
          '.  This is being forced by api.gotoView().'
      )
      smilestore.setLastRoute(to.name)
      smilestore.recordRoute(to.name)
      return true
    }

    // if the route requires consent and the user hasn't consented
    if (to.meta.requiresConsent && !smilestore.isConsented) {
      log.warn(
        `ROUTER GUARD: This route (${to.name}) requires consent, but the user has not consented (${smilestore.isConsented}).\
         Redirecting to the last route visited. (${smilestore.lastRoute})`
      )
      return {
        name: smilestore.lastRoute, // this could be lastRoute too
        replace: true,
      }
    }

    if (to.meta.requiresDone && !smilestore.isDone) {
      log.warn(
        `ROUTER GUARD: This route (${to.name}) requires being marked as done, but the user is not done.\
        Redirecting to the last route visited. (${smilestore.lastRoute})`
      )
      return {
        name: smilestore.lastRoute,
        replace: true,
      }
    }

    // if you're trying to go to the welcome screen and you're not a known user, allow it
    // if (to.name === 'welcome_anonymous' && from.name === undefined && !smilestore.isKnownUser) {
    //   log.log('ROUTER GUARD: We let anyone see ' + to.name + ' because the users is not known.')
    //   smilestore.setLastRoute(to.name)
    //   smilestore.recordRoute(to.name)
    //   return true
    // }

    // if you're trying to go to the next route
    if (from.meta !== undefined && from.meta.next === to.name && smilestore.dev.current_page_done) {
      log.log(
        'ROUTER GUARD: You are trying to go to the next route from ' +
          from.name +
          ' to ' +
          to.name +
          ' and the current page is done so allowing it.'
      )
      smilestore.setLastRoute(to.name)
      smilestore.recordRoute(to.name)
      return true
    }

    // if you're trying to go to the next route
    if (from.meta !== undefined && from.meta.next === to.name && !smilestore.dev.current_page_done) {
      log.error(
        'ROUTER GUARD: You are trying to go to the next route from ' +
          from.name +
          ' to ' +
          to.name +
          ' but the current page is not marked as done, so returning you to the current page.'
      )
      return {
        name: smilestore.lastRoute,
        replace: true,
      }
    }

    // if you're trying to go to the same route you're already on, allow it
    if (smilestore.lastRoute === to.name) {
      log.log(
        "ROUTER GUARD: You're trying to go to the same route as lastRoute (" +
          smilestore.lastRoute +
          '), so allowing it.'
      )
      return true
    }

    // if you're a known user (and not trying to go to the next or same route), send back to most recent route
    if (from.meta !== undefined && from.meta.next !== to.name && smilestore.isKnownUser) {
      log.error(
        `ROUTER GUARD: You are known and trying to access a route (${to.name}) which is not 'next' \
        on the timeline.  Returning you to the last route you were on (${smilestore.lastRoute}).`
      )
      return {
        name: smilestore.lastRoute,
        replace: true,
      }
    }

    // if you're a known user (and not trying to go to the next or same route), send back to most recent route
    if (smilestore.isKnownUser) {
      log.error(
        "ROUTER GUARD: You are known and trying to access a route you can't see yet.  lastRoute: " +
          smilestore.lastRoute
      )
      return {
        name: smilestore.lastRoute,
        replace: true,
      }
    }

    if (!smilestore.isKnownUser && to.name === 'landing') {
      log.error('ROUTER GUARD: Unknown user trying to go to landing page')
      return {
        name: 'welcome_anonymous',
        replace: true,
      }
    }
    if (to.name !== 'welcome_anonymous') {
      // otherwise (for an unknown user who's not trying to go to next/same route), just send to welcome anonymous screen
      log.error('ROUTER GUARD: Unknown user blocked trying to go to ' + to.name)
      return {
        name: 'welcome_anonymous',
        replace: true,
      }
    }
    return true // is this right? why is the default to allow the navigation?
  })
}

const { routes } = timeline

// 4. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
export const router = createRouter({
  history: createWebHashHistory(), // We are using the hash history for now/simplicity
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
})
addGuards(router) // add the guards defined above
log.log('Vue Router initialized')

// add additional guard to set global seed before
router.beforeResolve((to) => {
  const smilestore = useSmileStore()
  smilestore.removePageAutofill()

  if (smilestore.local.useSeed) {
    // if we're using a seed
    const seedID = smilestore.getSeedID
    const seed = `${seedID}-${to.name}`
    seedrandom(seed, { global: true })
    log.log('ROUTER GUARD: Seed set to ' + seed)
  } else {
    // if inactive, just re-seed with a random seed on every route entry
    api.randomSeed()
    log.log('ROUTER GUARD: Not using participant-specific seed; seed set randomly to ' + newseed)
  }
  log.clear_page_history()
  smilestore.dev.page_provides_trial_stepper = false // by default
  smilestore.dev.current_page_done = false // set the current page to done
  log.log('ROUTER GUARD: Router navigated to /' + to.name)
})

// Check if the next route has a preload function, and if so, run it asynchronously
router.afterEach(async (to, from) => {
  if (to.meta !== undefined && to.meta.next !== undefined) {
    const fullTo = router.resolve({ name: to.meta.next })

    if (fullTo.meta !== undefined && fullTo.meta.preload !== undefined) {
      await fullTo.meta.preload()
    }
  }
})

// they are defined in a function like this for the testing harness
export { routes, addGuards }

export default router
