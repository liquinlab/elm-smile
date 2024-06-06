// design.js
// This file configures the overall logic of your experiment.
// The critical part is the timeline, which is a list of phases
// the experiment goes through.  This file configues which phase
// occurs in the sequence.  In addition, this can configure things like
// preloading images, etc...

// The key documentation for this file
// Views: https://smile.gureckislab.org/views.html
// Timeline: https://smile.gureckislab.org/timeline.html
// Randomization: https://smile.gureckislab.org/randomization.html
// Preloading: https://smile.gureckislab.org/imagesvideo.html#preloading

import { processQuery } from '@/core/utils'
import RandomSubTimeline from '@/core/subtimeline'

// 1. Import main built-in View components
import Advertisement from '@/builtins/advertisement/AdvertisementView.vue'
import MTurk from '@/builtins/mturk/MTurkRecruitView.vue'
import Consent from '@/builtins/simple-consent/InformedConsentView.vue'
import DemographicSurvey from '@/builtins/demographic_survey/DemographicSurveyView.vue'
import DeviceSurvey from '@/builtins/device_survey/DeviceSurveyView.vue'
import Captcha from '@/builtins/captcha/CaptchaView.vue'
import Instructions from '@/builtins/instructions/InstructionsView.vue'
import Debrief from '@/builtins/debrief/DebriefView.vue'
import Thanks from '@/builtins/thanks/ThanksView.vue'
import Withdraw from '@/builtins/withdraw/WithdrawView.vue'
import WindowSizer from '@/builtins/window_sizer/WindowSizerView.vue'

// 2. Import user View components
import Exp from '@/builtins/tasks/ExpView.vue'
import Task1 from '@/builtins/tasks/Task1View.vue'
import Task2 from '@/builtins/tasks/Task2View.vue'
import StroopExp from '@/user/components/stroop_exp/StroopView.vue'
import InstructionJumperView from '@/user/components/InstructionJumperView.vue'

// #3. Import smile API and timeline
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

import Timeline from '@/core/timeline'
const timeline = new Timeline()

// #4. Define some routes to the timeline
// Each route should map to a View component.
// Each needs a name
// but for most experiment they go in sequence from begining
// to the end of this list

// by default routes have meta.requiresConsent = true (so you need to manually override it)
// by default routes have meta.requiresDone = false (so you need to manually override it)

// IMPORTANT: A least one route needs to be called 'welcome_anonymous'
// to handle the landing case for someone not coming from a recruitment services

// First welcome screen for non-referral
timeline.pushSeqView({
  path: '/welcome',
  name: 'welcome_anonymous',
  component: Advertisement,
  meta: { prev: undefined, next: 'consent', allowAlways: true, requiresConsent: false }, // override what is next
  beforeEnter: (to) => {
    api.getBrowserFingerprint()
  },
})

// welcome screen for referral from a service (e.g., prolific)
timeline.pushSeqView({
  path: '/welcome/:service',
  name: 'welcome_referred',
  component: Advertisement,
  meta: {
    prev: undefined,
    next: 'consent',
    allowAlways: true,
    requiresConsent: false,
  },
  beforeEnter: (to) => {
    // processes info to get the service-specific
    // participant info (e.g., Profilic ID)
    processQuery(to.query, to.params.service)
    api.getBrowserFingerprint()
  },
})

// this is a the special page that loads in the iframe on mturk.com
timeline.pushView({
  path: '/mturk',
  name: 'mturk',
  component: MTurk,
  meta: { allowAlways: true, requiresConsent: false },
  beforeEnter: (to) => {
    processQuery(to.query, 'mturk')
  },
})

// consent
timeline.pushSeqView({
  path: '/consent',
  name: 'consent',
  component: Consent,
  meta: {
    requiresConsent: false,
    preload: async () => {
      // can you figure that out yourself
      console.log('PRELOADING DATA from AdvertisementPage.preload.js')
      let data = await import('@/builtins/advertisement/AdvertisementView.preload.js')
      console.log('DATA LOADED', data.default)
    },
  },
})

// demographic survey
timeline.pushSeqView({
  path: '/demograph',
  name: 'demograph',
  component: DemographicSurvey,
})

// windowsizer
timeline.pushSeqView({
  path: '/windowsizer',
  name: 'windowsizer',
  component: WindowSizer,
})

// captcha
timeline.pushSeqView({
  path: '/captcha',
  name: 'captcha',
  component: Captcha,
})

// instructions
timeline.pushSeqView({
  path: '/instructions',
  name: 'instructions',
  component: Instructions,
})

// main experiment
timeline.pushSeqView({
  path: '/exp',
  name: 'exp',
  component: Exp,
})

timeline.pushSeqView({
  path: '/instruction_jumper',
  name: 'instruction_jumper',
  component: InstructionJumperView,
})

// create subtimeline for randomization
const randTimeline = new RandomSubTimeline()

randTimeline.pushView({
  path: '/task1',
  name: 'task1',
  component: Task1,
})

randTimeline.pushView({
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
timeline.pushSeqView({
  path: '/stroop',
  name: 'stroop',
  component: StroopExp,
})

// debriefing form
timeline.pushSeqView({
  path: '/debrief',
  name: 'debrief',
  component: Debrief,
})

// device survey
timeline.pushSeqView({
  path: '/device',
  name: 'device',
  component: DeviceSurvey,
})

// thanks/submit page
timeline.pushSeqView({
  path: '/thanks',
  name: 'thanks',
  component: Thanks,
  meta: { requiresDone: true },
})

// this is a special page that is for a withdraw
timeline.pushView({
  path: '/withdraw',
  name: 'withdraw',
  meta: { requiresWithdraw: true },
  component: Withdraw,
})

timeline.build()

export default timeline
