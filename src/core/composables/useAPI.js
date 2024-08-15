import { useRoute, useRouter } from 'vue-router'
import useSmileStore from '@/core/stores/smilestore'
import useTimeline from '@/core/composables/useTimeline'
// import seeded randomization function for this component/route
// random seeding is unique to each component/route
import { randomInt, shuffle, sampleWithReplacement, sampleWithoutReplacement  } from '@/core/randomization'

// import the trial stepper functionality which advances linearly through
// a set of trials
import { useStepper } from '@/core/composables/useStepper'

import useLog from '@/core/stores/log'

export default function useAPI() {
  const { stepNextView, stepPrevView, gotoView } = useTimeline()
  const route = useRoute()
  const router = useRouter()
  const smilestore = useSmileStore()
  const log = useLog()
  const api = {
    config: smilestore.config,
    data: smilestore.data,
    local: smilestore.local,
    global: smilestore.global,
    dev: smilestore.dev,
    route: route,
    router: router,
    stepNextView: stepNextView,
    stepPrevView: stepPrevView,
    gotoView: gotoView,
    hasNextView: () => route.meta.next && route.meta.sequential,
    hasPrevView: () => route.meta.prev && route.meta.sequential,
    randomInt: randomInt,
    shuffle: shuffle,
    sampleWithReplacement: sampleWithReplacement,
    sampleWithoutReplacement: sampleWithoutReplacement,
    useStepper: useStepper,
    // isKnownUser: smilestore.local.knownUser,
    // isDone: smilestore.local.done,
    // isConsented: smilestore.local.consented,
    // isWithdrawn: smilestore.local.withdrawn,
    urls: smilestore.global.urls,
    resetStore: () => {
      smilestore.resetLocal()
    },
    resetLocalState() {
      localStorage.removeItem(api.config.local_storage_key) // delete the local store
      // localStorage.removeItem(`${appconfig.local_storage_key}-seed_id`)
      // localStorage.removeItem(`${appconfig.local_storage_key}-seed_set`)
      smilestore.resetLocal() // reset all the data even

      // go back to the landing page (don't use router because it won't refresh the page and thus won't reset the app)
      const url = window.location.href
      window.location.href = url.substring(0, url.lastIndexOf('#/'))
    },
    setKnown: () => {
      smilestore.setKnown()
    },
    setDone: () => {
      smilestore.setDone()
    },
    setConsented: () => {
      smilestore.setConsented()
    },
    setWithdrawn: (forminfo) => {
      smilestore.setWithdrawn(forminfo)
    },
    verifyVisibility: (value) => {
      smilestore.data.verified_visibility = value
    },
    saveForm: (name, data) => {
      smilestore.saveForm(name, data)
    },
    getVerifiedVisibility: () => {
      return smilestore.verifiedVisibility
    },
    isBrowserTooSmall: () => {
      let val = false
      if (smilestore.config.windowsizer_aggressive === true && smilestore.data.verified_visibility === true) {
        val =
          window.innerWidth < smilestore.config.windowsizer_request.width + 40 ||
          window.innerHeight < smilestore.config.windowsizer_request.height + 40
      }
      return val
    },
    setPageAutofill: (autofill) => {
      log.debug('SMILEAPI: setting autofill')
      if (smilestore.config.mode === 'development') smilestore.setPageAutofill(autofill)
    },
    removePageAutofill: () => {
      log.debug('SMILEAPI: resetting autofill')
      if (smilestore.config.mode === 'development') smilestore.removePageAutofill()
    },
    setCompletionCode: (code) => {
      smilestore.setCompletionCode(code)
    },
    getRecruitmentService: () => {
      return smilestore.data.recruitment_service
    },
    getPageTracker: (routeName) => {
      return smilestore.getPageTracker(routeName)
    },
    hasAutofill: () => {
      return smilestore.hasAutofill
    },
    autofill: () => {
      return smilestore.autofill()
    },
    currentRouteName: () => {
      return route.name
    },
    getCurrentTrial: () => {
      return smilestore.getPage[route.name]
    },
    getBrowserFingerprint: () => {
      return smilestore.getBrowserFingerprint()
    },
    recordWindowEvent: (type, event_data = null) => {
      smilestore.recordWindowEvent(type, event_data)
    },
    incrementTrial: () => {
      smilestore.incrementPageTracker(route.name)
    },
    decrementTrial: () => {
      smilestore.decrementPageTracker(route.name)
    },
    resetTrial: () => {
      smilestore.resetPageTracker(route.name)
    },
    saveData: (force) => {
      smilestore.saveData(force)
    },
    log: (...message) => {
      log.log(message)
    },
    debug: (...message) => {
      log.debug(message)
    },
    warn: (...message) => {
      log.warn(message)
    },
    error: (...message) => {
      log.error(message)
    },
    getPublicUrl: (name) => {
      return import.meta.env.VITE_DEPLOY_BASE_PATH + name
    },
    getCoreStaticUrl: (name) => {
      return new URL(`../../assets/${name}`, import.meta.url).href
    },
    getStaticUrl: (name) => {
      return new URL(`../../user/assets/${name}`, import.meta.url).href
    },
    saveTrialData: (data) => {
      smilestore.saveTrialData(data)
      log.debug('SMILE API: data ', smilestore.data.study_data)
    },
    randomAssignCondition(conditionobject){
      // get conditionobject keys
      const keys = Object.keys(conditionobject)
      
      // split up keys: does it include 'weights'?
      const hasweights = keys.includes('weights')

      // get the rest of the keys
      const conditionname = keys.filter(key => key !== 'weights')
      let randomCondition;
      let weights = undefined;

      // if condition name is longer than one element, error
      if (conditionname.length > 1) {
        log.error('SMILE API: randomAssignCondition() only accepts one condition name at a time')
        return;
      } 
      
      const name = conditionname[0];
      const currentCondition = smilestore.getConditionByName(name);

      const possibleConditions = conditionobject[name]
      smilestore.local.possibleConditions[name] = possibleConditions
      
      if (hasweights) { // if weights are provided
        weights = conditionobject['weights']
        // make sure weights is the same length as the condition possibilities
        if (weights.length !== possibleConditions.length) {
          log.error('SMILE API: randomAssignCondition() weights must be the same length as the condition possibilities')
          return;
        }
      } 
      // get random condition from conditionobject[name]
      randomCondition = sampleWithReplacement(possibleConditions, 1, weights)[0]

      // set the condition in the store
      smilestore.setCondition(name, randomCondition)
      log.log('SMILE API: assigned condition', name, randomCondition)
      

    },
    preloadAllImages: () => {
      log.debug('Preloading images')
      setTimeout(() => {
        Object.values(
          import.meta.glob('@/assets/**/*.{png,jpg,jpeg,svg,SVG,JPG,PNG,JPEG}', {
            eager: true,
            query: '?url',
            import: 'default',
          })
        ).forEach((url) => {
          const image = new Image()
          image.src = url
        })
      }, 1)
    },
    completeConsent: () => {
      if (!api.local.knownUser) {
        api.setKnown() // set new user and add document, then assign conditions
      }
      api.setConsented()
    },
  }

  return api
}
