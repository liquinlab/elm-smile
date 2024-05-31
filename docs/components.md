<script setup>
import SimpleButton from './components/SimpleButton.vue'
import TextInput from './components/TextInput.vue'
</script>

# :jigsaw: Components

A key to making development faster and more fun in <SmileText/> is to organize
parts of the overall user interface into smaller, modular units called
**components**. Using components, the meaningful parts of a complex webpage or
application are broken down into smaller elements which are then built up into a
hierarchy. The code for these smaller elements can, in many cases, be developed
completely independently from the rest of the project or webpage.

![components](/images/components.png)

[Component development](https://www.componentdriven.org) speeds up the process
of designing a new experiment or web application because you don't have to
understand every part of the code to begin adding new interface elements and
logic. Components can show/hide content, verify that input to a form is valid,
collect data from a participant and save it to a database, animate elements of a
page, etc...

Well-designed components are reuseable across projects so that if someone else
develops a useful component you can easily import it into your project.
Component libraries exist which define the logic and behavior of common elements
on a page. For example, [Radix Vue](https://www.radix-vue.com/) and
[PrimeVue](https://primevue.org/) provide libraries of components that provide
functionality like calendar
[date pickers](https://www.radix-vue.com/components/date-picker.html),
[navigation menus](https://www.radix-vue.com/components/navigation-menu), and
hoverable [tooltips](https://www.radix-vue.com/components/tooltip.html). In
addition, novel components are easily built up out of other components
leveraging modularity and code reuse.

Components are somewhat similar to the role that
["plugins"](https://www.jspsych.org/7.2/overview/plugins/) play in a library
like [JSPsych](https://www.jspsych.org/7.2/) but generally, JSPsych plugins
handle single trials of an experiment whereas a Vue.js component might be as
small as a button or as big as an entire webpage or even application. In
addition, components leverage some other concepts in modern web design such as
[reactivity and declarative rendering](/reactive) that make your development and
debugging much easier.

::: warning How are components used in <SmileText/>?

Typically in <SmileText/>, components are used to define trials of an experiment
(i.e., the logic and flow of what is shown in a given trial). Some trials might
be complex and composed of other components that define the look and layout of
stimuli, buttons, etc... Smile provides several built-in components that do
things like collect informed consent or show instructions. In addition, Smile
provides a simple component API which makes it easy to define experiments
composed of sequences of trials.

:::

## Vue.js components

There are many libraries which utilize the concept of components on the web
including [React](https://reactjs.org/), [Angular](https://angular.io/), and
[Svelte](https://svelte.dev/). In <SmileText/>, we use the
[Vue.js](https://vuejs.org) framework.

::: warning Why Vue.js?

Vue.js was for <SmileText/> chosen because it is easy to learn, has a large and
active community, and is one of the few web frameworks not associated with a
major company. In addition, the Vue community has developed strong international
community (e.g., it is the most popular web framework in China). There's a nice
documentary about the leader of the Vue project
[here](https://www.youtube.com/watch?v=OrxmtDw4pVI).

:::

[^why]:

The preferred way to develop components is using a special file format known as
SFC (Single File Component). These files end with an extension `.vue`. The SFC
files combine elements of Javascript, HTML, and CSS/SCSS into a single modular
element that defines your component. These files can be edited best using the
[Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension
for [VSCode](https://code.visualstudio.com) (i.e., it provides syntax
highlighting and other code formatting hints).

Here is an example Vue 3 SFC file called `SimpleButton.vue` which is using the
Vue 3.0 composition API:

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button class="button" @click="count++">Count is: {{ count }}</button>
</template>

<style scoped>
button {
  font-weight: bold;
  background-color: lightblue;
}
</style>
```

Look closely at this example and notice how this example has a `<script>`
section, a `<template>` section, and a `<style>` section. These sections define
the javascript behavior (script), the HTML rendering (template), and the
look/feel of the component (style). These three factors are typical for
interactive websites (e.g., you typically import your javascript code, and style
sheet (CSS) code into your basic HTML document). However, normally you define
these for the entire page not separately for individual pieces of a larger page.
The SFC file format highlights the value of modularity since it helps you group
the code for a particular part of the page with its HTML and CSS styling.

The template for this component has a simple `<button>` element that when
clicked (`@click`) increments a variable called `count`. The current value of
`count` is rendered into the template using the <span v-pre>`{{ count }}`</span>
syntax. The script setup initializes the `count` variable to zero and makes it
reactive (more on that below). Finally the `<style>` section defines that the
text in the button for this component should be bold and the button light blue.
Since the style section has the word `scoped` in it, the styles will only apply
to this component and not to other components on the page (i.e., only this
button will be bolded). Neat!

This documentation website is itself built using Vue.js components. As a result,
we can render the above Vue component directly into this page to see how it
works. Here is the button component in action:

<SimpleButton/>

The way this worked was that at the top of this page we imported the component

```
import SimpleButton from '@/components/SimpleButton.vue'
```

and then in the main text wrote

```
<SimpleButton/>
```

Vue replaced the custom `<SimpleButton/>` tag with the rendered HTML for the
template and the logic for the button.

Try clicking the button and see how the counter is incremented! All the logic
for this was self-contained in the small SFC file above and could be easily
moved into another project just by copying the SFC file and importing it where
needed. In addition, it can be applied multiple times on the same page each
instance of the component will have its own state and behavior.

For example writing

```
<SimpleButton/><br/><br/>
<SimpleButton/>
```

will result in:

<SimpleButton/><br/><br> <SimpleButton/>

Each with a self-contained counter.

## Declarative Rendering and Reactivity

A core concept in Vue.js is the idea of **reactivity** and **declarative
rendering**. There are many useful guides to this include the excellent
[Vue tutorial](https://vuejs.org/tutorial/#step-1) and the
[Vue documentation](https://vuejs.org/guide/introduction.html). However, here is
a quick summary.

Declarative rendering is the idea that you define the structure of your webpage
in a template. The template can refer to variables and functions that are
defined in the script section of the component. When the value of the variable
changes the template automatically is updated.

In the SFC code listing above, try to find where the value of the count variable
is updated in the template. You'll notice there is no such code because it is
**implicitly** updated according to the declaration in the template. This is the
core idea of declarative rendering: you define how the page should look based on
underlying state data and the page automatically updates when the state data
changes.

Of course, the question is how does the page know when the state data changes?
In Vue.js this is handled by the concept of **reactivity**. In the SFC file
above we imported the `ref` function from Vue and used it to define the `count`
variable. This function makes the variable reactive. This means that when the
value of the variable changes, Vue automatically updates the template to reflect
the new value. Any variable you want to have automatically update its displayed
value should be made reactive. Behind the scenes this is done using a system of
notifications where Vue keeps track of which parts of the template depend on
which variables and updates them when the variables change. The important point
from the perspective of a developer is that you don't have to write code to
update the template when the underlying state changes.

An even more interesting version of this can create two-way binding between
elements in a form. For example this component defines a reactive value called
`text`. In the template is defines a text input element `input` which is "bound"
to the value of `text` using the `v-model` directive. This means that when the
the value of the input changes, it automatically updates the value of `text` and
vice versa. This is a powerful feature of Vue.js that can save a lot of time and
code.

```vue
<script setup>
import { ref } from 'vue'
const text = ref('')
</script>

<template>
  <input class="input" v-model="text" placeholder="Type here" />
  <p><b>You typed: </b>{{ text }}</p>
</template>

<style scoped>
.input {
  font-weight: bold;
  background-color: lightgray;
}
</style>
```

An example rendering of this component is here:

<TextInput/>

As you can see ass you type the value of `text` is updated in real time (due to
the onChange event) and since this variable is reactive it also renders into the
template in real time. In this case both retreving the value of the input field
and setting the value of the HTML template are done **implicitly** due to
reactivity and declarative rendering.

### Comparison to traditional Javascript development

This development model is strikingly different than most Javascript development
where you would have to write code to update the text of the button each time
the count variable changes. For example, when writing custom JSPsych plugins the
code for a similar effect might look like this:

```js
plugin.trial = function (display_element, trial) {
  var text = ''

  var html = `<input class="input" name="text" id="myinput" placeholder="Type here" />`
  html += `<p id="message"><b>You typed: </b>${text}</p>`
  display_element.innerHTML = html

  display_element
    .querySelector('#myinput')
    .addEventListener('onchange', function () {
      handle_change()
    })

  function handle_change() {
    let new_text = display_element.querySelector('#myinput').value
    display_element.querySelector('#message').innerHTML =
      `<b>You typed: </b>${new_text}`
  }
}
```

with an additional entry in the global CSS definition like this to style the
input:

```css
#myinput {
  font-weight: bold;
  background-color: lightgray;
}
```

unpacking this code, first we add the input and text to the page using the

```js
var html = `<input class="input" name="text" id="myinput" placeholder="Type here" />`
html += `<p id="message"><b>You typed: </b>${text}</p>`
display_element.innerHTML = html
```

This looks similar to the `<template>` section of the Vue component. However, we
still need to add the event handler to the jsPsych plugin example. We do this by
selecting the `#myinput` element and adding an event listener to to the click
for `onchange` events.

```js
display_element
  .querySelector('#myinput')
  .addEventListener('onchange', function () {
    handle_change()
  })
```

In the Vue component, the event handler which listens to changes was implicitly
registered using the `v-model="text"` directive. Finally in the JSPsych example
we have to handle the change by running a function the reads the current value
of the input field and sets the HTML of the message to the new value.

```js
function handle_change() {
  let new_text = display_element.querySelector('#myinput').value
  display_element.querySelector('#message').innerHTML =
    `<b>You typed: </b>${new_text}`
}
```

This is also implicitly accomplished using the declarative rendering in the Vue
template.

Conceptually these are not radically different -- in both cases we have to think
about how our program reacts to inputs from the user. However, the JSPsych
version, besides being more verbose, requires the programmer to manually
coordinate more of the updating process (retreiving values and setting them in
the display). This can be error-prone.

In addition, this example didn't use it but the CSS styling for a JSPsych plugin
is defined in a different file from the plugin itself which can make it harder
to update (e.g., you have to be careful to not call any other element `#myinput`
if you applied a style to it because CSS classes apply globally, where as in Vue
they can be, optinally, scoped to apply to the current component only).

## Building Vue components

If you are familiar with traditional methods for interactive web development
(e.g., [JQuery](https://jquery.com) or [d3](https://d3js.org)), components can
seem quite mysterious. Usually we develop modular elements of a page by
importing Javascript libraries in the `<head>` of an HTML document and then
using those libraries to write custom functions that modify the webpage (i.e.,
DOM).

Browsers do not know how to natively process Vue SFC files. Instead, Vue
applications use a build system which sort of "compiles" and "bundles" the code
in the SFC into one or more `.html`, `.js`, and `.css` files that work in the
way that browsers can understand. This is the role that
[Vite](https://vitejs.dev) plays in <SmileText/>. Vite is a build tool that can
take the SFC files and turn them into a webpage that can be loaded in a browser.

Building a website might seem like a unnecessary complexity but in fact offers a
number of advantages. First, the build process can optimize the code for quickly
loading (e.g., when Vite processes the SFC files it can remove comments,
whitespace making the imported code smaller and faster to load). Second, the
build process can strip out unused functions from libraries you use. So unlike
traditional development, if you import d3js in a Vite/Vue project it will only
include the parts of d3js that you actually use in your project. Vite can even
automatically break the entire project code up into smaller pieces that can be
loaded on demand such as after the user clicks a button. This has a huge impact
on the speed of your website and is especially important for collecting data
from populations with slow internet connections.

## Learning Vue

Teaching the internals of Vue.js is beyond this particular guide. However,
luckily Vue has a rich ecosystem of documentation and guides which can help (and
also excellent documentation). The following are some useful pointers:

- If you are coming to Vue with experience in jQuery this guide
  [comparing the two is interesting](https://www.smashingmagazine.com/2018/02/jquery-vue-javascript/).
- Vue.js explained in [100 seconds](https://www.youtube.com/watch?v=nhBVL41-_Cw)
- Vue.js documentary about the
  [lead developer](https://www.youtube.com/watch?v=OrxmtDw4pVI)
- The Vue.js [documentation](https://vuejs.org/guide/introduction.html)
- Official Vue.js [tutorial](https://vuejs.org/tutorial/#step-1)
- Online school for learning [Vue](https://learnvue.co)
- [LearnVue](https://www.youtube.com/LearnVue) a YouTube channel devoted to
  teaching Vue
- Long video with a guy walking through the
  [code and thinking of developing a simple game in Vue](https://www.youtube.com/watch?v=WQa9-4K3me4&t=1652s)

One very useful tool for learning about components is the
[Vue Single File Component Playground](https://sfc.vuejs.org/). On this page,
you can write simple components see how they will render in real-time, and even
build slightly larger components that include sub-components. It can be useful
for learning setting up <SmileText/> on your computer and even can help engage
students in the research process.
