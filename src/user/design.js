import { processQuery } from '@/core/utils'
import RandomSubTimeline from '@/core/subtimeline'

// 1. Import route components
import RecruitmentChooser from '@/components/recruitment/RecruitmentChooserView.vue'
import PresentationModeHomePage from '@/components/presentation_mode/PresentationModeHomePage.vue'
import MTurk from '@/components/recruitment/MTurkRecruitView.vue'
import Advertisement from '@/components/recruitment/AdvertisementView.vue'
import Consent from '@/components/consent/ConsentView.vue'
import DemographicSurvey from '@/components/demographic_survey/DemographicSurveyView.vue'
import Captcha from '@/components/captcha/CaptchaView.vue'
import Instructions from '@/components/instructions/InstructionsView.vue'
import Debrief from '@/components/debrief/DebriefView.vue'
import Thanks from '@/components/thanks/ThanksView.vue'
import Withdraw from '@/components/withdraw/WithdrawView.vue'
import WindowSizer from '@/components/window_sizer/WindowSizerView.vue'

// user parts
import Exp from '@/components/tasks/ExpView.vue'
import Task1 from '@/components/tasks/Task1View.vue'
import Task2 from '@/components/tasks/Task2View.vue'
import StroopExp from '@/user/components/stroop_exp/StroopView.vue'

// add new routes here.  generally these will be things in components/pages/[something].vue

import useSmileAPI from '@/core/composables/useSmileAPI'
const api = useSmileAPI()

import Timeline from '@/core/timeline'
const timeline = new Timeline()

// 2. Define some routes to the timeline
// Each route should map to a component.
// Each needs a name
// these routes can be accessed in any order generally
// but for most experiment they go in sequence from begining
// to the end of this list

// by default routes have meta.requiresConsent = true (so you need to manually override it)
// by default routes have meta.requiresDone = false (so you need to manually override it)

// add the recruitment chooser if in development mode
if (api.config.mode === 'development') {
  timeline.pushRoute({
    path: '/',
    name: 'recruit',
    component: RecruitmentChooser,
    meta: { allowAlways: true, requiresConsent: false },
  })
} else if (api.config.mode === 'presentation') {
  timeline.pushRoute({
    path: '/',
    name: 'presentation_home',
    component: PresentationModeHomePage,
    meta: { allowAlways: true, requiresConsent: false },
  })
} else {
  // auto refer to the anonymous welcome page
  timeline.pushRoute({
    path: '/',
    name: 'landing',
    redirect: {
      name: 'welcome_anonymous',
    },
    meta: { allowAlways: true, requiresConsent: false },
  })
}

// welcome screen for non-referral
timeline.pushSeqRoute({
  path: '/welcome',
  name: 'welcome_anonymous',
  component: Advertisement,
  meta: { prev: undefined, next: 'consent', allowAlways: true, requiresConsent: false }, // override what is next
  beforeEnter: (to) => {
    api.getBrowserFingerprint()
  },
})

// welcome screen for referral
timeline.pushSeqRoute({
  path: '/welcome/:service',
  name: 'welcome_referred',
  component: Advertisement,
  meta: {
    prev: undefined,
    next: 'consent',
    allowAlways: true,
    requiresConsent: false,
  }, // override what is next
  beforeEnter: (to) => {
    processQuery(to.query, to.params.service)
    api.getBrowserFingerprint()
  },
})

console.log(Advertisement)

// consent
timeline.pushSeqRoute({
  path: '/consent',
  name: 'consent',
  component: Consent,
  meta: {
    requiresConsent: false,
    preload: async () => {
      // can you figure that out yourself
      console.log('PRELOADING DATA from AdvertisementPage.preload.js')
      let data = await import('@/components/recruitment/AdvertisementView.preload.js')
      console.log('DATA LOADED', data.default)
    },
  },
})

// demographic survey
timeline.pushSeqRoute({
  path: '/demograph',
  name: 'demograph',
  component: DemographicSurvey,
})

// windowsizer
timeline.pushSeqRoute({
  path: '/windowsizer',
  name: 'windowsizer',
  component: WindowSizer,
})

// captcha
timeline.pushSeqRoute({
  path: '/captcha',
  name: 'captcha',
  component: Captcha,
})

// instructions
timeline.pushSeqRoute({
  path: '/instructions',
  name: 'instructions',
  component: Instructions,
})

// main experiment
timeline.pushSeqRoute({
  path: '/exp',
  name: 'exp',
  component: Exp,
})

// create subtimeline for randomization
const randTimeline = new RandomSubTimeline()

randTimeline.pushRoute({
  path: '/task1',
  name: 'task1',
  component: Task1,
})

randTimeline.pushRoute({
  path: '/task2',
  name: 'task2',
  component: Task2,
})

// if you want fixed orders based on conditions, uncomment meta line
// commented out, this will shuffle the routes at random
timeline.pushRandomizedTimeline({
  name: randTimeline, // TODDQ: why name is the carrier here?
  // meta: { label: "taskOrder", orders: {AFirst: ["task1", "task2"], BFirst: ["task2", "task1"]} }
})

// stroop exp
timeline.pushSeqRoute({
  path: '/stroop',
  name: 'stroop',
  component: StroopExp,
})

// debriefing form
timeline.pushSeqRoute({
  path: '/debrief',
  name: 'debrief',
  component: Debrief,
})

// thanks/submit page
timeline.pushSeqRoute({
  path: '/thanks',
  name: 'thanks',
  component: Thanks,
  meta: { requiresDone: true },
})

// this is a special page that is for a withdraw
timeline.pushRoute({
  path: '/withdraw',
  name: 'withdraw',
  meta: { requiresWithdraw: true },
  component: Withdraw,
})

// this is a the special page that loads in the iframe on mturk.com
timeline.pushRoute({
  path: '/mturk',
  name: 'mturk',
  component: MTurk,
  meta: { requiresConsent: false },
  beforeEnter: (to) => {
    processQuery(to.query, 'mturk')
  },
})

timeline.build()

export default timeline
