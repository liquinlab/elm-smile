# :twisted_rightwards_arrows: Timeline

Web experiments are often composed of several parts presented in sequence. For example, first, we might show a welcome page &rarr; informed consent &rarr;instructions &rarr; etc...
<SmileText /> provides a central "sequencing" or timeline feature which makes it easy to configure, customize, and move through different stages of an experiment.

This page shows how to configure and control <SmileText />'s Timeline implementation, and how to customize it with more complex behaviors. Most of the configuration happens in `src/app_timeline.js` which is short, self-explanatory, and well commented so you jump there if you feel confident.

## Single-page Applications and Routing

Modern apps such as <SmileText/> are known as **Single-page Applications (SPAs)**. These apps load a single HTML page and then use a Javascript framework to control the dynamic interactions of the page including showing and hiding different elements, handling events like clicks, loading data to or from a server, etc... However, it is often useful to be able to directly access different content in an app using URLs. For example, users might want to bookmark the login or settings page of an app and so they need a distinct URL that will pull each of these views up.

Because SPAs load the entire app from a single URL, the solution to this for SPAs is known as a **router**. A router is a piece of software running in the browser which interprets URL requests and programmatically changes the visible content on the webpage, mimicking normal browser requests for specific pages. In <SmileText />, routing is handled by the [Vue Router](https://router.vuejs.org) which is a powerful open-source project built for routing in [Vue](https://vuejs.org) applications.

A simple example of using the Vue router is visible here (adapted from the Vue Router [documentation](https://router.vuejs.org/guide/#javascript)):

```js
// 1. Define route Vue components
// These can be imported from other files
const Welcome = { template: '<div>Welcome</div>' }
const Consent = { template: '<div>Consent</div>' }

// 2. Define some routes
// Each route should map to a component
const routes = [
  { path: '/', component: Welcome }, // maps '/' to 'Welcome'
  { path: '/consent', component: Consent }, // maps '/about' to 'Consent'
]

// 3. Create the router instance and pass the `routes` option
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
})
```

First, we define two simple Vue [components](/components), then we create an array called `routes` which configures each route. Each route is, in effect, a mapping between a particular URL and a component. For example, in this code snippet, `/` on the server is mapped to the `Welcome` component and `/consent` to the `Consent` component.

You can read this as saying "When the user requests the `/` URL on this application, display the `Welcome` component". Specifically, it renders the template of your component in your app in place of where the `<router-view>` tag appears. In Smile, that tag appears in `src/App.vue` which is the starting component for the application.

## URLs and Routes

A quick note about URLs and routes. We will often mention a base path or base URL for a project. This is the full deployment URL to your experiment including the protocol (`http://`), the domain (`exps.gureckislab.org`), as well as subfolders (`/ghuser/repo/branch/`) etc... For example, `http://exps.gureckislab.org/` might be the base path. This is configured via the `VITE_CODE_NAME_DEPLOY_URL` or `VITE_DEPLOY_URL` in the `env/.env.git` file (see the docs on [configuration](/configuration)).

Routes are configured beneath this base URL so `/` means the original base URL but `/about` means `http://exps.gureckislab.org/#/about`. The base URL can also include subfolders so for instance the base route could just as easily be `https://exps.gureckislab.org/ghuser/repo/branch/#/about`. The base folder is where your `index.html` for the SPA is located during deployment or development.

The `#` character in these URLs is not a typo. When you access a URL with slashes on it typically it is interpreted by the browser as a new network request for a particular resource on the webserver. An exception is for content that follows `#` character which indicates a link to different content on the **same page** (e.g., read about the `<a name>` tag also known as [fragment identifiers](https://www.w3.org/TR/html401/intro/intro.html#fragment-uri) in HTML). Changes to this part of the URL do not trigger page reloads ordinarily.

The easiest way to think about it is like this:

![how route URLS are processed](/images/routing.png)

words separate by slashes appearing before the `#` (or if there are no `#`s) are sent by the browser to the web server as resource requests using standard `http` protocol, which triggers a page reload from the server. Things that appear after the `#` do _not_ trigger a page reload. The Vue Router interprets changes appearing after the `#` and parses the content and uses it to determine what Vue components to load (based on the routing table that you configure).[^hash]

[^hash]: The `VueRouter.createWebHashHistory()` call is what tells the router to use the `#` navigation strategy.

In <SmileText/> key steps in the experiment are indexed by routes that map to [page-level components](/components). So `/consent` might load the consent page form and `/debrief` would load the debriefing page form. This is good organization but also helpful for debugging since you can easily jump to different sections of the task.

### The route object

Each route is specified by a javascript object, which usually contains at the following fields:

```js
{
  path: '/my_name',
  name: 'my_name',
  component: MyComponent,
  meta: { ... },  // optional
}
```

The `path` specifies the client-side route, as described above. The `name` offers another way to specify the route for navigation, which can be easier than using the path (see details in the `vue-router` [documentation](https://router.vuejs.org/guide/essentials/named-routes.html)). The `component` field specifies the component that should be loaded when the route is requested.

The `meta` field specifies additional optional information about the route:

- It can be used to specify different previous and next routes, in case the experiment timeline flow branches (see [Branching and randomized flows](#branching-and-randomized-flows) for more details).
- It can be used to specify randomized sub-timelines (see [Randomized flows and complex branching](#randomized-flows-and-complex-branching) for more details).
- It can also be used to allow direct navigation to particular routes, which can allow for unconditional navigation by setting `allowAlways: true` in the `meta`.
- It can be used to block access to particular routes until the user has consented to the study (`requiresConsent: true`) as well as only showing content when the user is "done" with the experiment (`requiresDone: true`).

## Timeline

As just described, the Vue Router is a mapping between different URLs and Vue components to load. However, in experiments, we often want to step through content sequentially. For this purpose, Smile implements a simple Timeline class (see `src/timeline.js`) which acts as a wrapper around the basic Vue Router.

The timeline class allows you to configure a sequence of routes as well as allow for routes that are not part of the sequence:

<img src="/images/timeline.png" width="500" alt="timeline example" style="margin: auto;">

Sequential routes are accessed in a chain/timeline. Non-sequential routes are not part of that timeline.

A timeline is created like this:

```js
import { Timeline } from '@/timeline' // @ resolves to /src in Smile
const timeline = new Timeline()
```

There are four key methods available on the timeline instance:

### `timeline.pushSeqRoute(route_obj)`

Pushes a new route (specified in `route_obj`) into the sequential timeline.
The first call to this function will make the configured route the first route in the sequence. The second call will make it the second route in the sequence and so forth. The format of `route_obj` is what [VueRouter](https://router.vuejs.org/) allows.

### `timeline.pushRoute(route_obj)`

This pushes a new route (specified in `route_obj`) into a nonsequential timeline. This route will exist in the Vue router but will not be in the timeline sequence. This is useful for configuration and debugging routes as well as routes you want to define and even link to but not present in the regular timeline flow.

### `timeline.pushRandomizedTimeline(subtimeline_obj)`

This pushes a new randomized sub-timeline (specified in `subtimeline_obj`) into the sequential timeline. See [Randomized flows and complex branching](#randomized-flows-and-complex-branching) for further details.

### `timeline.build()`

This should be called to construct the sequence. It takes the configured timeline and figures out which route is the successor or predecessor of each (allowing for manual overrides using the `meta` field).

<!-- ### `buildProgress()`

This should be called as the final step.  It takes the configured timeline and configures the progress tracking (for an optional progress bar you can make visible to participants).  The progress tracking counts the total number of routes, and for the sequential routes converts the order into a percentage complete (e.g., if there were three routes each would add 33% to the total as you step through). -->

Here is an example configuring three sequential routes and one non-sequential route:

```js
import { Timeline } from '@/timeline' // @ resolves to /src in Smile
const timeline = new Timeline()

// first route
timeline.pushSeqRoute({
  path: '/',
  name: 'welcome',
  component: WelcomeComponent,
})

// second route
timeline.pushSeqRoute({
  path: '/instructions',
  name: 'instructions',
  component: InstructionsComponent,
})

// third route
timeline.pushSeqRoute({
  path: '/thanks',
  name: 'thanks',
  component: ThanksComponent,
})

// a non sequential route available for debugging
timeline.pushNonSeqRoute({
  path: '/config',
  name: 'config',
  component: ConfigComponent,
})

timeline.build()
```

During development you can, of course, comment out certain routes to help isolate and test particular aspects of your experiment. In addition, since routes are mapped to distinct URLs it is easy to jump between sections of your experiment during development.

Hopefully, you are thinking this sounds super easy to set up, but how do you step from one component/route to the next? To do that we need to introduce the concept of a [stepper](#timelinestepper). But first, let's quickly consider more complex sequential flows.

## Branching and randomized flows

### Simple branching flows

Sometimes you need timeline structures a little more complex than a simple sequence. For example, there might be multiple initial landing pages depending on if you come in from a particular [recruitment](/recruitment) service:

<img src="/images/timeline-flows.png" width="500" alt="timeline example" style="margin: auto;">

To configure this we need multiple routes (1a and 1b in the figure) to all point to the same successor. We can do this using [Vue router meta fields](https://router.vuejs.org/guide/advanced/meta.html). In particular, when we create a sequential route we can configure a specific successor using `meta: {next: 'some_name'}` (or predecessor using `meta: {prev: 'some_name'}`):

```js
// first route
timeline.pushSeqRoute({
  path: '/first',
  name: 'first',
  meta: { next: 'second' }, // this should jump to a specific route (by name)
  component: FirstComponent,
})

// alternative first route
timeline.pushSeqRoute({
  path: '/first_alt',
  name: 'first_alternate',
  meta: { next: 'second' }, // this should jump to a specific route (by name)
  component: AlternativeFirstCompomnet,
})

// second route
timeline.pushSeqRoute({
  path: '/second',
  name: 'second',
  component: SecondComponent,
})

// third route
timeline.pushSeqRoute({
  path: '/third',
  name: 'third',
  component: ThirdComponent,
})

timeline.build()
```

Using this approach you can configure fairly complex branching flows through pages.

The `timeline.build()` method steps through all nodes pushed using `pushSeqRoute()` and makes the `next` point to the successor and `prev` point to the previous route. If this is not what you want (because your routes need more complex flows) you can simply omit the `build` step.

### Randomized flows and complex branching

Sometimes you want to randomize the order or presentation of routes. For example, your experiment might have two tasks, which are presented in a randomized order. Or, you might have four tasks, and you want one group of participants to see two of the tasks and the other group to see the other two tasks. We call these "randomized flows":

<img src="/images/randomizedflows.png" width="500" alt="timeline example" style="margin: auto;">

These randomized flows can be accomplished by creating a <b>randomized sub-timeline</b>.

Let's say you want two tasks to be presented in a random order, following a route called `/exp`. After the two tasks, you want to show the debrief route. Here's what your `app_timeline.js` file might look like:

```js
import RandomSubTimeline from '@/core/subtimeline'
import Timeline from '@/core/timeline'
const timeline = new Timeline()

// exp route
timeline.pushSeqRoute({
  path: '/exp',
  name: 'exp',
  component: Exp,
})

// create randomized sub-timeline
const randTimeline = new RandomSubTimeline()

// push tasks into sub-timeline as "non-sequential" routes
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

// push sub-timeline itself into main timeline
timeline.pushRandomizedTimeline({
  name: randTimeline,
})

// debriefing form
timeline.pushSeqRoute({
  path: '/debrief',
  name: 'debrief',
  component: Debrief,
})

timeline.build()

export default timeline
```

Note that all sub-timelines routes are added with the `pushRoute` method, not the `pushSeqRoute` method. There is no `pushSeqRoute` method for randomized sub-timelines.

The randomized sub-timeline can contain any number of routes. Any routes contained in a sub-timeline get added to the main router. Initially, the `next` and `prev` meta fields for each sub-timeline route automatically point to the routes that come directly before and directly after the sub-timeline. For example, in the router above, both task 1 and task 2 will have `next` set to the `/debrief` route, and `prev` set to the `/exp` route.

However, these meta fields are changed when the [timeline stepper](#timelinestepper)'s `next()` function is used to enter the sub-timeline. When the sub-timeline is identified as the next step in the timeline (for example, when the next button is pressed on the `/exp` route), the sub-timeline's routes are shuffled and the `next` and `prev` meta fields are configured accordingly (e.g., the `next` field for task 2 points to task 1, if task 2 comes first in the shuffled sub-timeline). This is controlled by the function `RandomizeSubTimeline` in `subtimeline.js`, so you can check it out if you're curious. Or you can call the function somewhere else directly if you don't want to shuffle the randomized sub-timeline using the timeline stepper.

By default, all the routes in the randomized sub-timeline will be shuffled using a special random seed set within `RandomizeSubTimeline` (see [Randomization](/randomization) for more on seeded random number generation). However, you can instead optionally specify several fixed route orders based on assigned conditions. For example, if you have two tasks, you might want to assign participants to one of two conditions: `task1_first` and `task2_first`. You can assign participants to these conditions using the procedure documented in [Randomization](/randomization). In the router, you can push the randomized sub-timeline to the main timeline like this:

```js
timeline.pushRandomizedTimeline({
  name: randTimeline,
  meta: { label: 'taskOrder', orders: { task1_first: ['task1', 'task2'], task2_first: ['task2', 'task1'] } },
})
```

In this case, the timeline stepper will look at the entry in <SmileText />'s global store called `conditions`, and will find the value assigned to the property called `taskOrder` (where the value is either `task1_first` or `task2_first`). Then, rather than shuffling task 1 and task 2 at random, it will show them in the order specified by the participant's assigned value.

This technique can also be used to show only a subset of the possible tasks to each participant. For example, you might specify:

```js
timeline.pushRandomizedTimeline({
  name: randTimeline,
  meta: { label: 'taskCondition', orders: { task1: ['task1'], task2: ['task2'] } },
})
```

In this case, the participant will only see task 1 (between the `/exp` and `/debrief` routes) if their assigned `taskCondition` is `task1`, and will only see task 2 (between the `/exp` and `/debrief` routes) if their assigned `taskCondition` is `task2`.

## TimelineStepper

In each component in our router we need to call a method when that component is "finished" and allow the timeline/router to pass control to the next route in the sequence. To do this we use the [composables](https://vuejs.org/guide/reusability/composables.html) feature of Vue. Composables are function that let you re-use logic across multiple components. To step to the next route in the sequence we import the TimelineStepper composable into our component and call the appropriate method when we are done.

The way to import the stepper composable into your component is:

```js
import useTimelineStepper from '@/composables/timelinestepper'
const { next, prev } = useTimelineStepper()
```

This imports the composable, then creates a `next()` and `prev()` which are functions that when they are called provides the `name` of the next route (or `null` if there is no "next" either because you are at the end of the sequence or because it is a non-sequential route). To navigate to the next route just use the `push()` method of the router:

```js
if (next) router.push(next) // go to the next
// or instead
// if(prev) router.push(prev) // go to the prev
```

Here is a complete, simple SFC component that imports the timeline stepper and uses it to advance to the next route in the sequence when the user clicks a button (calling the `finish()` method):

```vue
<script setup>
import { useRoute } from 'vue-router'
import useTimelineStepper from '@/composables/timelinestepper'
import useSmileStore from '@/stores/smiledata' // get access to the global store

const route = useRoute()
const smilestore = useSmileStore()

const { next, prev } = useTimelineStepper()

function finish(goto) {
  if (goto) router.push(goto)
}
</script>

<template>
  <div class="page">
    <h1 class="title is-3">Experiment</h1>
    <button class="button is-success is-light" id="finish" @click="finish(next())">
      next &nbsp;<FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
```

Details about the implementation of the `useTimelineStepper` are quite simple and in `src/composables/timelinestepper.js`.

:::warning IMPORTANT (and helpful!)
One important feature of the stepper is that it calls `saveData()` on the global store prior to route changes. So as a result you can trust that your data will be saved/synchronized with the persistent store (Firestore) whenever you navigated between sequential routes. See the data storage docs on [automatic saving](/datastorage.html#automatic-saving). This only works if you use the TimelineStepper to advance between pages/routes. If you call this manually you need to save manually as well using the `saveData()` method.
:::

### Custom navigation logic

In some cases, you might want to navigate to something other than `next()` or `prev()` as returned by the timeline stepper. One common use case is in an instruction understanding quiz module, where you might want to navigate back to an instructions page if the participant fails the quiz, and only navigate forward if the participant succeeds. Your timeline setup code (in `router.js`) might look like this (note the `meta: {allowAlways: true}` on the instructions route, to allow to return to it from any place in the timeline):

```js
import { Timeline } from '@/timeline' // @ resolves to /src in Smile
const timeline = new Timeline()

timeline.pushSeqRoute({
  path: '/',
  name: 'welcome',
  component: WelcomeComponent,
})

// Consent form, etc., ...

timeline.pushSeqRoute({
  path: '/instructions',
  name: 'instructions',
  component: InstructionsComponent,
  meta: { allowAlways: true }, // allow direct navigation to this route
})

// ...

timeline.pushSeqRoute({
  path: '/quiz',
  name: 'quiz',
  component: QuizComponent,
})

// ...

timeline.pushSeqRoute({
  path: '/thanks',
  name: 'thanks',
  component: ThanksComponent,
})
```

Your quiz module then might implement something like the following:

```vue
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import useTimelineStepper from '@/composables/timelinestepper'
import useSmileStore from '@/stores/smiledata' // get access to the global store

const route = useRoute()
const smilestore = useSmileStore()

const { next, prev } = useTimelineStepper()


quizPassed = computed(() => {...}); // computed property that checks if the quiz was passed

function finish(goto) {
    if(goto) router.push(goto)
}

function checkQuiz() {
    // check quiz answers
    if (quizPassed.value) {
        finish(next())
    } else {
        finish({name: 'instructions'})
    }
}
</script>

<template>
  <div class="page">
    <h1 class="title is-3">Instructions Quiz</h1>
    <button class="button is-success is-light" id="finish" @click="finish()">
      next &nbsp;<FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
```

Note that if your instructions component immediately preceded the quiz, it would be sufficient to call `finish(prev())` to return to the instructions page. However, if there are other routes between the instructions and the quiz, you would need to use `finish({name: 'instructions'})` to navigate back to the instructions page.

## Running custom code before route loading

Sometimes you want to run a little bit of code prior to loading a route. You can do this using [route guards](https://router.vuejs.org/guide/advanced/navigation-guards.html), a feature of the Vue Router. Route guards are traditionally used to prevent navigation to a route or redirect it. Here is an example using the <SmileText /> Timeline object.

```js
// welcome screen
timeline.pushSeqRoute({
  path: '/welcome',
  name: 'welcome',
  component: Advertisement,
  beforeEnter: (to, from) => {
    console.log(to, from)
  },
})
```

The `beforeEnter` method will run before the route is loaded. This can be helpful for doing computation prior to the route loading. For example, after the user consents to the study it might make sense to create a database record for them. So we might add a special method to the route _after_ the consent form to handle that.

It is also possible to register route guards too all routes using the `.beforeEach()` method. In `src/router.js` there is a method `addGuards()` which has examples of registering global guards.

Note that Vue Router provides a variety of lifecycle hooks that you can customize for all or individual routes. See the documentation [here](https://router.vuejs.org/guide/advanced/navigation-guards.html#the-full-navigation-resolution-flow) for a full accounting of the order in which things occur.

## Testing the Timeline

The timeline has a full coverage test in `tests/vitest/timeline.test.js`. You can run that test in isolation with

```
npx vitest timeline
```
