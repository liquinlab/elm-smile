import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useSmileStore from '@/core/stores/smilestore'
import useTimeline from '@/core/composables/useTimeline'
import seedrandom from 'seedrandom'
import { v4 as uuidv4 } from 'uuid'

// import seeded randomization function for this component/route
// random seeding is unique to each component/route
import {
  randomInt,
  shuffle,
  sampleWithReplacement,
  sampleWithoutReplacement,
  faker_distributions,
} from '@/core/randomization'

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
  const api = reactive({
    config: smilestore.config,
    data: smilestore.data,
    private: smilestore.private,
    all_data: { private: smilestore.private, data: smilestore.data },
    local: smilestore.local,
    global: smilestore.global,
    dev: smilestore.dev,
    route: route,
    router: router,
    stepNextView: stepNextView,
    stepPrevView: stepPrevView,
    gotoView: gotoView,
    faker: faker_distributions,
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
    resetApp: () => {
      smilestore.resetApp()
    },
    isResetApp: () => {
      return smilestore.local.reset
    },
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
    setKnown: async () => {
      await smilestore.setKnown()
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
      log.debug('SMILEAPI: registering autofill function')
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
    getConditionByName: (name) => {
      return smilestore.getConditionByName(name)
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
      smilestore.data.trial_num += 1
      smilestore.saveTrialData(data)
      log.debug('SMILE API: data ', smilestore.data.study_data)
    },
    randomSeed(seed = uuidv4()) {
      // sets new global seed(will remain in use until next route)
      seedrandom(seed, { global: true })
    },
    randomAssignCondition(conditionObject) {
      // get conditionobject keys
      const keys = Object.keys(conditionObject)

      // Try to find the condition name
      const conditionNames = keys.filter((key) => key !== 'weights')
      let randomCondition

      // if condition name is longer than one element, error
      if (conditionNames.length > 1) {
        log.error('SMILE API: randomAssignCondition() only accepts one condition name at a time')
        return null
      }

      const [name] = conditionNames
      const currentCondition = smilestore.getConditionByName(name)
      if (currentCondition) {
        log.debug('SMILE API: condition already assigned', name, currentCondition)
        return currentCondition
      }

      // if we haven't assigned the condition name, set the possible condition values
      const possibleConditions = conditionObject[name]
      smilestore.local.possibleConditions[name] = possibleConditions

      // Check if we're doing weighted or unweighted randomization
      const hasWeights = keys.includes('weights')
      let weights

      if (hasWeights) {
        // if weights are provided
        weights = conditionObject.weights
        // make sure weights is the same length as the condition possibilities
        if (weights.length !== possibleConditions.length) {
          log.error('SMILE API: randomAssignCondition() weights must be the same length as the condition possibilities')
          return null
        }
      }
      // get random condition from conditionobject[name]
      randomCondition = sampleWithReplacement(possibleConditions, 1, weights)[0]

      // set the condition in the store
      smilestore.setCondition(name, randomCondition)
      log.debug('SMILE API: assigned condition', name, randomCondition)

      // Returning to allow immediate use if assigned
      return randomCondition
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
    completeConsent: async () => {
      api.setConsented()
      if (!api.local.knownUser) {
        await api.setKnown() // set new user and add document, then assign conditions
      }
    },
  })

  return api
}
