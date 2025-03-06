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
import { useHStepper } from '@/core/composables/useHStepper'
import { useStepper } from '@/core/composables/useStepper'

import useLog from '@/core/stores/log'

export default function useAPI() {
  const { goNextView, goPrevView, gotoView } = useTimeline()
  const route = useRoute()
  const router = useRouter()
  const store = useSmileStore()
  const logStore = useLog()

  const api = reactive({
    // Store and logging
    store,
    log: {
      debug: (...args) => logStore.debug(...args),
      log: (...args) => logStore.log(...args),
      warn: (...args) => logStore.warn(...args),
      error: (...args) => logStore.error(...args),
      success: (...args) => logStore.success(...args),
      clear_page_history: () => logStore.clear_page_history(),
      add_to_history: (...args) => logStore.add_to_history(...args),
    },

    // Store data access
    config: store.config,
    data: store.data,
    private: store.private,
    all_data: { private: store.private, data: store.data },
    // local: store.local,
    // global: store.global,
    // dev: store.dev,

    // Router related
    route,
    router,
    goNextView,
    goPrevView,
    gotoView,
    hasNextView: () => !!route.meta.next && route.meta.sequential,
    hasPrevView: () => !!route.meta.prev && route.meta.sequential,

    // Randomization utilities
    faker: faker_distributions,
    randomInt,
    shuffle,
    sampleWithReplacement,
    sampleWithoutReplacement,
    useHStepper,
    useStepper,

    // URL helpers
    urls: store.global.urls,
    getPublicUrl: (name) => import.meta.env.VITE_DEPLOY_BASE_PATH + name,
    getCoreStaticUrl: (name) => new URL(`../../assets/${name}`, import.meta.url).href,
    getStaticUrl: (name) => new URL(`../../user/assets/${name}`, import.meta.url).href,

    // App state management
    resetApp: () => store.resetApp(),
    isResetApp: () => store.local.reset,
    resetStore: () => store.resetLocal(),
    resetLocalState() {
      localStorage.removeItem(api.config.local_storage_key)
      store.resetLocal()
      const url = window.location.href
      window.location.href = url.substring(0, url.lastIndexOf('#/'))
    },

    // App component management
    setAppComponent: (key, value) => {
      if (!store.config.global_app_components) {
        store.config.global_app_components = {}
      }
      store.config.global_app_components[key] = value
    },
    getAppComponent: (key) => {
      if (!store.config.global_app_components || !(key in store.config.global_app_components)) {
        logStore.error('SMILE API: getAppComponent() key not found:', key)
        return undefined
      }
      return store.config.global_app_components[key]
    },

    // Config management
    setRuntimeConfig: (key, value) => {
      if (key in store.config) {
        store.config[key] = value
      } else {
        if (!store.config.runtime) {
          store.config.runtime = {}
        }
        store.config.runtime[key] = value
      }
      const { global_app_components, ...configWithoutComponents } = store.config
      store.data.smile_config = configWithoutComponents
    },
    getConfig: (key) => {
      if (key in store.config) {
        return store.config[key]
      } else if (key in store.config.runtime) {
        return store.config.runtime[key]
      } else {
        logStore.error('SMILE API: getConfig() key not found', key)
        return null
      }
    },

    // User state management
    setKnown: async () => await store.setKnown(),
    setDone: () => store.setDone(),
    setConsented: () => store.setConsented(),
    setWithdrawn: (forminfo) => store.setWithdrawn(forminfo),
    verifyVisibility: (value) => {
      store.data.verified_visibility = value
    },
    saveForm: (name, data) => store.saveForm(name, data),
    getVerifiedVisibility: () => store.verifiedVisibility,

    // Browser checks
    isBrowserTooSmall: () => {
      let val = false
      if (store.config.windowsizer_aggressive === true && store.data.verified_visibility === true) {
        val =
          window.innerWidth < store.config.windowsizer_request.width + 40 ||
          window.innerHeight < store.config.windowsizer_request.height + 40
      }
      return val
    },

    // Development tools
    setPageAutofill: (autofill) => {
      logStore.debug('SMILEAPI: registering autofill function')
      if (store.config.mode === 'development') store.setPageAutofill(autofill)
    },
    removePageAutofill: () => {
      logStore.debug('SMILEAPI: resetting autofill')
      if (store.config.mode === 'development') store.removePageAutofill()
    },

    // Completion and recruitment
    setCompletionCode: (code) => store.setCompletionCode(code),
    getRecruitmentService: () => store.data.recruitment_service,

    // Page tracking
    getPageTracker: (routeName = null) => store.getPageTracker(routeName || route.name),
    getPageTrackerData: (routeName = null) => store.getPageTrackerData(routeName || route.name),
    getPageTrackerIndex: (routeName = null) => store.getPageTrackerIndex(routeName || route.name),
    hasAutofill: () => store.hasAutofill,
    autofill: () => store.autofill(),
    currentRouteName: () => route.name,
    getConditionByName: (name) => store.getConditionByName(name),
    getBrowserFingerprint: () => store.getBrowserFingerprint(),

    // Event and trial management
    recordWindowEvent: (type, event_data = null) => store.recordWindowEvent(type, event_data),
    incrementTrial: () => store.incrementPageTracker(route.name),
    decrementTrial: () => store.decrementPageTracker(route.name),
    resetTrial: () => store.resetPageTracker(route.name),
    saveData: (force) => store.saveData(force),
    recordTrialData: (data) => {
      store.data.trial_num += 1
      store.recordTrialData(data)
      logStore.debug('SMILE API: data ', store.data.study_data)
    },

    // Randomization and conditions
    randomSeed(seed = uuidv4()) {
      seedrandom(seed, { global: true })
    },
    randomAssignCondition(conditionObject) {
      const keys = Object.keys(conditionObject)
      const conditionNames = keys.filter((key) => key !== 'weights')

      if (conditionNames.length > 1) {
        logStore.error('SMILE API: randomAssignCondition() only accepts one condition name at a time')
        return null
      }

      const [name] = conditionNames
      const currentCondition = store.getConditionByName(name)
      if (currentCondition) {
        logStore.debug('SMILE API: condition already assigned', name, currentCondition)
        return currentCondition
      }

      const possibleConditions = conditionObject[name]
      store.local.possibleConditions[name] = possibleConditions

      const hasWeights = keys.includes('weights')
      const weights = hasWeights ? conditionObject.weights : undefined

      if (hasWeights && weights.length !== possibleConditions.length) {
        logStore.error(
          'SMILE API: randomAssignCondition() weights must be the same length as the condition possibilities'
        )
        return null
      }

      const randomCondition = sampleWithReplacement(possibleConditions, 1, weights)[0]
      store.setCondition(name, randomCondition)
      logStore.debug('SMILE API: assigned condition', name, randomCondition)
      return randomCondition
    },
    // Image preloading
    preloadAllImages: () => {
      logStore.debug('Preloading images')
      setTimeout(() => {
        Object.values(
          import.meta.glob('@/user/assets/**/*.{png,jpg,jpeg,svg,SVG,JPG,PNG,JPEG}', {
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
    preloadAllVideos: () => {
      logStore.debug('Preloading videos')
      setTimeout(() => {
        Object.values(
          import.meta.glob('@/user/assets/**/*.{mp4,mov,avi,m4v}', {
            eager: true,
            query: '?url',
            import: 'default',
          })
        ).forEach((url) => {
          const video = document.createElement('video')
          video.src = url
        })
      }, 1)
    },
    completeConsent: async () => {
      api.setConsented()
      if (!api.store.local.knownUser) {
        await api.setKnown()
      }
    },
  })

  return api
}
