# :twisted_rightwards_arrows: Timeline and Design

Web experiments are often composed of several parts presented in sequence. For
example, we might show a welcome page &rarr; informed consent &rarr;
instructions &rarr; etc. <SmileText /> provides a central "sequencing" or
timeline feature which makes it easy to configure, customize, and move through
different stages of an experiment.

The timeline feature is more than just a way to control the presentation order
of different phases. It also acts as a way to prevent subjects from doing things
in the tasks that you might not want. For example, in many web-based experiments
if the subject reloads the webpage the task will start over. Although
researchers often add a warning about this, it would allow subjects to repeat
the instructions after seeing the task, accidentally participate in multiple
conditions, or start over if they make a mistake to increase their bonus.
Smile's timeline logic prevents this by controlling the flow of the experiment
even across reloads of the webpage. For instance, when properly configured, a
subject in a Smile experiment can close their browser, restart their computer,
and come back to the experiment on the **same trial** they left off on.

This page shows how to configure and control <SmileText />'s Timeline
implementation, and how to customize it with more complex behaviors.

## The Design File (`user/design.js`)

Perhaps the most important user-configurable file in a <SmileText /> experiment
is the design file located in `src/user/design.js`. This file is where you
configure the timeline of your experiment. You can take a look at the
[default version](https://github.com/NYUCCL/smile/blob/main/src/user/design.js)
of this file which is short, self-explanatory, and well commented.

The design file sets up the sequence of [Views](/views) that the participant
will encounter, and can configure randomized branching if needed to create
different experimental conditions. **It is very likely you will need to edit
this file to create your experiment**!

The following sections of this page describe the technical details of the
Timeline object and how to configure your design file.

## Single-page Applications and Routing

Moany modern apps such as <SmileText/> are what are known as **Single-page
Applications (SPAs)**. Rather than having content spread across multiple HTML
pages, these apps load a single HTML page and then use a Javascript framework to
control the dynamic interactions of the page including showing and hiding
different elements, handling events like clicks, loading data to or from a
server, etc... However, it is often useful to be able to directly access
different content in an app using URLs. For example, users might want to
bookmark the login or settings page of an app and so they need a distinct URL
that will pull each of these views up.

Because SPAs load the entire app from a single URL, the solution to this for
SPAs is known as a **router**. A router is a piece of software running in the
browser which interprets URL requests and programmatically changes the visible
content on the webpage, mimicking normal browser requests for specific pages. In
<SmileText/>, routing is handled by the [Vue Router](https://router.vuejs.org)
which is a powerful open-source project built for routing in
[Vue](https://vuejs.org) applications.

A simple example of using the Vue router is visible here (adapted from the Vue
Router [documentation](https://router.vuejs.org/guide/#javascript)):

```js
// 1. Define route Vue components
// These can be imported from other files
const WelcomeView = { template: '<div>Welcome</div>' }
const ConsentView = { template: '<div>Consent</div>' }

// 2. Define some routes
// Each route should map to a component
const routes = [
  { path: '/', component: WelcomeView }, // maps '/' to 'Welcome'
  { path: '/consent', component: ConsentView }, // maps '/about' to 'Consent'
]

// 3. Create the router instance and pass the `routes` option
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
})
```

First, we define two simple Vue [components](/components) (here we used a
short-hand technique which avoided even needing a Single-File Component), then
we create an array called `routes` which configures each route. Each route is,
in effect, a mapping between a particular URL and a component. For example, in
this code snippet, `/` on the server is mapped to the `Welcome` component and
`/consent` to the `Consent` component.

You can read this as saying "When the user requests the `/` URL on this
application, display the `Welcome` component". Specifically, it renders the
template of your component in your app in place of where the `<router-view>` tag
appears. In Smile, that tag appears in `src/core/App.vue` which is the starting
component for the application.

## URLs and Routes

A quick note about URLs and routes. We will often mention a base path or base
URL for a project. This is the full deployment URL to your experiment including
the protocol (`http://`), the domain (`exps.gureckislab.org`), as well as
subfolders (`/ghuser/repo/branch/`) etc... For example,
`http://exps.gureckislab.org/` might be the base path. This is configured via
the `VITE_CODE_NAME_DEPLOY_URL` or `VITE_DEPLOY_URL` in the `env/.env.git` file
(see the docs on [configuration](/configuration)).

Routes are configured beneath this base URL so `/` means the original base URL
but `/about` means `http://exps.gureckislab.org/#/about`. The base URL can also
include subfolders so for instance the base route could just as easily be
`https://exps.gureckislab.org/ghuser/repo/branch/#/about`. The base folder is
where your `index.html` for the SPA is located during deployment or development.

The `#` character in these URLs is not a typo. When you access a URL with
slashes on it typically it is interpreted by the browser as a new network
request for a particular resource on the webserver. An exception is for content
that follows `#` character which indicates a link to different content on the
**same page** (e.g., read about the `<a name>` tag also known as
[fragment identifiers](https://www.w3.org/TR/html401/intro/intro.html#fragment-uri)
in HTML). Changes to this part of the URL do not trigger page reloads
ordinarily.

The easiest way to think about it is like this:

![how route URLS are processed](/images/routing.png)

words separate by slashes appearing before the `#` (or if there are no `#`s) are
sent by the browser to the web server as resource requests using standard `http`
protocol, which triggers a page reload from the server. Things that appear after
the `#` do _not_ trigger a page reload. The Vue Router interprets changes
appearing after the `#` and parses the content and uses it to determine what Vue
components to load (based on the routing table that you configure).[^hash]

[^hash]:
    The `VueRouter.createWebHashHistory()` call is what tells the router to use
    the `#` navigation strategy.

In <SmileText/> key steps in the experiment are indexed by routes that map to
page-level components called [Views](/views). So `/consent` might load the
consent View and `/debrief` would load the debriefing View. This is good
organization but also helpful for [debugging/developing](/developermode) since
you can easily jump to different sections of the task.

## Timeline

As just described, the Vue Router is a mapping between different URLs and Vue
components (i.e., Views) to load. However, in experiments, we often want to step
through content sequentially. For this purpose, Smile implements a simple
Timeline class (see `src/timeline.js`) which acts as a wrapper around the basic
Vue Router.

The timeline class allows you to configure a sequence of routes as well as allow
for routes that are not part of a sequence:

<img src="/images/timeline.png" width="500" alt="timeline example" style="margin: auto;">

Sequential routes are accessed in a timeline. Non-sequential routes are not part
of that timeline.

### The route object

Each route is specified by a javascript object, which usually contains at least
the following fields:

```js
{
  name: 'my_name',
  component: MyViewComponent,
  meta: { ... },  // optional
}
```

By default, if you do not provide a `path` in the object (as in the example
above), the client-side route will be automatically set to match the name. For
example, the path in the example above would be set to `/my_name`. See details
in the `vue-router`
[documentation](https://router.vuejs.org/guide/essentials/named-routes.html) for
more information on `name` vs. `path`. The `component` field specifies the
[View component](/views) that should be loaded when the route is requested.

If you'd like to specify a different path (that doesn't match the name), you can
do that:

```js
{
  name: 'my_name',
  path: '/testcomponent'
  component: MyViewComponent,
  meta: { ... },  // optional
}
```

The `meta` field specifies additional optional information about the route:

- It can be used to specify different previous and next routes, in case the
  experiment timeline flow branches (see
  [Branching and randomized flows](#branching-and-randomized-flows) for more
  details).
- It can also be used to allow direct navigation to particular routes, which can
  allow for unconditional navigation by setting `allowAlways: true` in the
  `meta`.
- It can be used to block access to particular routes until the user has
  consented to the study (`requiresConsent: true`) as well as only showing
  content when the user is "done" with the experiment (`requiresDone: true`).
  Another option (`requiresWithdraw: true`) requires the participant to have
  withdrawn from the page before showing.

### Navigation permissions

In developer mode any view can be accessed in any order. However, in live mode,
the timeline enforces a strict order of views. This is to prevent participants
from re-starting the experiment or skipping ahead to the end. However, there are
some exceptions to this rule. For example, it is possible to configure any
particular view to the reachable from any other view using the `meta` field
(`allowAlways: true`).

In addition, certain programmatic navigations are always allowed. For example,
if the subject had already read the instructions then if a button or link was
provided like this:

```vue
<a href="/#instructions" class="button">Instructions</a>
```

It would be disallowed in live mode because the subject would be skipping back
using a browser navigation event (it appears the same as if the subject modified
the URL in the browser). However, if the same link was implemented using the
internal API navigation method it would be always allowed:

```js
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

function go_to_instructions() {
  console.log('go')
  api.gotoView('instructions')
}
```

```vue
<button class="button" @click="go_to_instructions()">
  Jump to instructions
</button>
```

The premise here is that if the programmer set up a situation where navigation
was requested progamatically it should be allowed. The first link type means
that either the programmer or the participant constructed the request and so it
is disallowed.

### Creating a timeline

A timeline is created like this:

```js
import Timeline from '@/core/timeline' // note that the '@' resolves to /src in Smile
const timeline = new Timeline()
```

There are four key methods available on the timeline instance:

### `timeline.pushSeqView(route_obj)`

Pushes a new route (specified in `route_obj`) into the sequential timeline. The
first call to this function will make the configured route the first route in
the sequence. The second call will make it the second route in the sequence and
so forth. The format of `route_obj` is what
[VueRouter](https://router.vuejs.org/) allows.

### `timeline.registerView(route_obj)`

This registers a new route (specified in `route_obj`) without adding it to the
timeline. This route will exist in the Vue router but will not be in the
timeline sequence. This is useful for configuration and debugging routes as well
as routes you want to define and even link to but not present in the regular
timeline flow. The notation `registerView`, as opposed to the `push...` methods,
is meant to indicate that the route is not part of the sequence.

### `timeline.build()`

This should be called to construct the sequence. It takes the configured
timeline and figures out which route is the successor or predecessor of each
(allowing for manual overrides using the `meta` field).

<!-- ### `buildProgress()`

This should be called as the final step.  It takes the configured timeline and configures the progress tracking (for an optional progress bar you can make visible to participants).  The progress tracking counts the total number of routes, and for the sequential routes converts the order into a percentage complete (e.g., if there were three routes each would add 33% to the total as you step through). -->

Here is an example configuring three sequential routes and one non-sequential
route:

```js
import Timeline from '@/core/timeline'
const timeline = new Timeline()

// first route
timeline.pushSeqView({
  path: '/',
  name: 'welcome',
  component: WelcomeComponent,
})

// second route
timeline.pushSeqView({
  path: '/instructions',
  name: 'instructions',
  component: InstructionsComponent,
})

// third route
timeline.pushSeqView({
  path: '/thanks',
  name: 'thanks',
  component: ThanksComponent,
})

// a non-sequential route available for debugging
timeline.registerView({
  path: '/config',
  name: 'config',
  component: ConfigComponent,
})

timeline.build()
```

During development you can, of course, comment out certain routes to help
isolate and test particular aspects of your experiment. In addition, since
routes are mapped to distinct URLs it is easy to jump between sections of your
experiment during development (especially using the
[developer mode](/developermode) tools).

## Branching and randomized flows

### Simple branching flows

Sometimes you need timeline structures a little more complex than a simple
sequence. For example, there might be multiple initial landing pages depending
on if you come in from a particular [recruitment](/recruitment) service:

<img src="/images/timeline-flows.png" width="500" alt="timeline example" style="margin: auto;">

To configure this we need multiple routes (1a and 1b in the figure) to all point
to the same successor. We can do this using
[Vue router meta fields](https://router.vuejs.org/guide/advanced/meta.html). In
particular, when we create a sequential route we can configure a specific
successor using `meta: {next: 'some_name'}` (or predecessor using
`meta: {prev: 'some_name'}`):

```js
// first route
timeline.pushSeqView({
  name: 'first',
  meta: { next: 'second' }, // this should jump to a specific route (by name)
  component: FirstComponent,
})

// alternative first route
timeline.pushSeqView({
  name: 'first_alternate',
  meta: { next: 'second' }, // this should jump to a specific route (by name)
  component: AlternativeFirstCompomnet,
})

// second route
timeline.pushSeqView({
  name: 'second',
  component: SecondComponent,
})

// third route
timeline.pushSeqView({
  name: 'third',
  component: ThirdComponent,
})

timeline.build()
```

Using this approach you can configure fairly complex branching flows through
pages.

The `timeline.build()` method steps through all nodes pushed using
`pushSeqView()` and makes the `next` point to the successor and `prev` point to
the previous route. If this is not what you want (because your routes need more
complex flows) you can simply omit the `build` step.

### Alternative flows and branching

Sometimes you want to randomize the order or presentation of routes. For
example, your experiment might have two tasks, which are presented in a
randomized order. Or, you might have four tasks, and you want one group of
participants to see two of the tasks and the other group to see the other two
tasks. We call these "alternative flows":

<img src="/images/randomizedflows.png" width="500" alt="timeline example" style="margin: auto;">

These alternative flows can be accomplished by adding <b>nodes</b>, which you
can think of as containing several paths of views and guiding participants along
one of those paths. There are two types of nodes: <i>randomized</i> and
<i>conditional</i>.

#### Randomized nodes

Let's say you want participants to see a page of instructions and then complete
two tasks, which should be presented in a random order across participants.
After the two tasks, you want to show the debrief route. Here's what your
`src/design.js` file might look like:

```js
import RandomSubTimeline from '@/core/subtimeline'
import Timeline from '@/core/timeline'
const timeline = new Timeline()

// push instructions
timeline.pushSeqView({
  name: 'instructions',
  component: Instructions,
})

// register tasks
randTimeline.registerView({
  name: 'task1',
  component: Task1,
})

randTimeline.registerView({
  name: 'task2',
  component: Task2,
})

// push randomized node with the two orderings
timeline.pushRandomizedNode({
  name: 'randomOrder',
  options: [
    ['task1', 'task2'],
    ['task2', 'task1'],
  ],
})

// push debriefing form
timeline.pushSeqView({
  name: 'debrief',
  component: Debrief,
})

timeline.build()
```

Note that the views that make up the node are <i>registered</i> (added with the
`registerView` method), not <i>pushed</i> (with the `pushSeqView` method). The
node that contains them <i>is</i> pushed (with the `pushRandomizedNode` method).

You can adjust the probabilities of the paths by specifying weights—if you want
the first path to be twice as likely as the second path, for example, you could
do that like this:

```js
timeline.pushRandomizedNode({
  name: 'randomOrder',
  options: [
    ['task1', 'task2'],
    ['task2', 'task1'],
  ],
  weights: [2, 1],
})
```

Note that the weights are automatically normalized, so [2/3, 1/3] or [4, 2]
would generate the same distribution.

#### Conditional nodes

The view order can be set by which condition the participant is in. This can be
more useful than a simple randomized node if other aspects of the experiment
will depend on the condition. Here's an example:

```js
import Timeline from '@/core/timeline'
const timeline = new Timeline()

// assign participants to condition specifying task order
api.randomAssignCondition({
  taskOrder: ['AB', 'BA'],
})

// push instructions
timeline.pushSeqView({
  path: '/instructions',
  name: 'instructions',
  component: Instructions,
})

// push tasks into timeline as "non-sequential" routes
randTimeline.registerView({
  name: 'taskA',
  component: TaskA,
})

randTimeline.registerView({
  name: 'taskB',
  component: TaskB,
})

timeline.pushConditionalNode({
  name: 'ConditionalRandom',
  taskOrder: {
    AB: ['taskA', 'taskB'],
    BA: ['taskB', 'taskA'],
  },
})

timeline.build()
```

And to access the value of the condition elsewhere (e.g., in the instructions
component), you can do:

```js
api.getConditionByName(taskOrder)
```

It's also possible to have nested nodes. In the example below, participants are
counterbalanced—half are assigned to taskorder AB vs BA, and half are assigned
to see task C vs D afterward:

```js
import Timeline from '@/core/timeline'
const timeline = new Timeline()

api.randomAssignCondition({
  taskOrder: ['AB', 'BA'],
})

api.randomAssignCondition({
  variation: ['C', 'D'],
})

// the tasks (registered)
timeline.registerView({
  name: 'taskA',
  component: TaskA,
})

timeline.registerView({
  name: 'taskB',
  component: TaskB,
})

timeline.registerView({
  name: 'taskC',
  component: TaskC,
})

timeline.registerView({
  name: 'taskD',
  component: TaskD,
})

timeline.registerConditionalNode({
  name: 'InnerConditionalRandom',
  variation: {
    C: ['taskC'],
    D: ['taskD'],
  },
})

// the outer node (pushed)
timeline.pushConditionalNode({
  name: 'ConditionalRandom',
  taskOrder: {
    AB: ['taskA', 'taskB', 'InnerConditionalRandom'],
    BA: ['taskB', 'taskA', 'InnerConditionalRandom'],
  },
})

timeline.build()
```

## Using the Timeline

In each component in our router we need to call a method when that component is
"finished" and allow the timeline/router to pass control to the next route in
the sequence. To do this we use the
[composables](https://vuejs.org/guide/reusability/composables.html) feature of
Vue. Composables are function that let you re-use logic across multiple
components. To step to the next route in the sequence we import the useTimeline
composable into our component and call the appropriate method when we are done.

The way to import the useTimeline composable into your component is:

```js
import useTimeline from '@/composables/useTimeline'
const { stepNextView, stepPrevView, gotoView } = useTimeline()
```

This imports the composable, then import three methods (`stepNextView()`,
`stepPrevView()`, and `gotoView`) which are functions that when they are called
provides the `name` of the next route (or `null` if there is no "next" either
because you are at the end of the sequence or because it is a non-sequential
route). To navigate to the next route just use the `push()` method of the
router:

```js
if (next) router.push(next) // go to the next
// or instead
// if(prev) router.push(prev) // go to the prev
```

Here is a complete, simple SFC component that imports the timeline stepper and
uses it to advance to the next route in the sequence when the user clicks a
button (calling the `finish()` method):

```vue
<script setup>
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

function finish(goto) {
  api.stepNextView()
}
</script>

<template>
  <div class="page">
    <h1 class="title is-3">Experiment</h1>
    <button class="button is-success is-light" id="finish" @click="finish()">
      next &nbsp;<FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
```

Details about the implementation of the `useTimeline` are quite simple and in
`src/composables/useTimeline.js`.

:::warning IMPORTANT (and helpful!)

One important feature of the timeline is that it calls `saveData()` on the
global store prior to View/route changes. So as a result you can trust that your
data will be saved/synchronized with the persistent store (Firestore) whenever
you navigated between sequential routes. See the data storage docs on
[automatic saving](/datastorage.html#automatic-saving). This only works if you
use the API to advance between pages/routes.

:::

### Custom navigation logic

In some cases, you might want to navigate to something other than `next()` or
`prev()` as returned by the timeline stepper. One common use case is in an
instruction understanding quiz module, where you might want to navigate back to
an instructions page if the participant fails the quiz, and only navigate
forward if the participant succeeds. Your timeline setup code (in `router.js`)
might look like this (note the `meta: {allowAlways: true}` on the instructions
route, to allow to return to it from any place in the timeline):

```js
import Timeline from '@/core/timeline'
const timeline = new Timeline()

timeline.pushSeqView({
  path: '/',
  name: 'welcome',
  component: WelcomeComponent,
})

// Consent form, etc., ...

timeline.pushSeqView({
  path: '/instructions',
  name: 'instructions',
  component: InstructionsComponent,
  meta: { allowAlways: true }, // allow direct navigation to this route
})

// ...

timeline.pushSeqView({
  path: '/quiz',
  name: 'quiz',
  component: QuizComponent,
})

// ...

timeline.pushSeqView({
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
import useTimeline from '@/composables/useTimeline'
import useSmileStore from '@/stores/smilestore' // get access to the global store

const route = useRoute()
const smilestore = useSmileStore()

const { next, prev } = useTimeline()


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

Note that if your instructions component immediately preceded the quiz, it would
be sufficient to call `finish(prev())` to return to the instructions page.
However, if there are other routes between the instructions and the quiz, you
would need to use `finish({name: 'instructions'})` to navigate back to the
instructions page.

## Running custom code before route loading

Sometimes you want to run a little bit of code prior to loading a route. You can
do this using
[route guards](https://router.vuejs.org/guide/advanced/navigation-guards.html),
a feature of the Vue Router. Route guards are traditionally used to prevent
navigation to a route or redirect it. Here is an example using the <SmileText />
Timeline object.

```js
// welcome screen
timeline.pushSeqView({
  path: '/welcome',
  name: 'welcome',
  component: Advertisement,
  beforeEnter: (to, from) => {
    console.log(to, from)
  },
})
```

The `beforeEnter` method will run before the route is loaded. This can be
helpful for doing computation prior to the route loading. For example, after the
user consents to the study it might make sense to create a database record for
them. So we might add a special method to the route _after_ the consent form to
handle that.

It is also possible to register route guards too all routes using the
`.beforeEach()` method. In `src/router.js` there is a method `addGuards()` which
has examples of registering global guards.

Note that Vue Router provides a variety of lifecycle hooks that you can
customize for all or individual routes. See the documentation
[here](https://router.vuejs.org/guide/advanced/navigation-guards.html#the-full-navigation-resolution-flow)
for a full accounting of the order in which things occur.

## Testing the Timeline

The timeline has a full coverage test in `tests/vitest/timeline.test.js`. You
can run that test in isolation with

```
npx vitest timeline
```
