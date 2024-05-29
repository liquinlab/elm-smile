# :wave: Welcome to Smile!

The <SmileText/> project is a web-based platform designed to make it easy and
fun to collect behavioral data online.

Smile prioritizes both the developer experience -- making your experiment coding
tasks more fun -- while also enabling more complex and friendly experiments for
your participants.

The [Smile philosophy](/principles) is to use leverage the power of modern
open-source web technologies, including heavily supported frameworks like
[Vue.js](https://vuejs.org) and [Vite](https://vitejs.dev) along with CSS
frameworks like [Bulma](https://bulma.io), to make it easier to create and run
online experiments. The platform is designed for programmers with a reasonable
understanding of Javascript and modern web design^[Beginners might find
[jspych](https://www.jspsych.org/), [Gorilla](https://gorilla.sc/),
[Google Forms](https://forms.google.com) easier to start with.].

### Key features:

- Fast and fun front-end interface development with [Vue.js](https://vuejs.org)
  and [Bulma](https://bulma.io). Make complex games, animations, and surveys
  with relative ease.
- Rapid iteration and testing leveraging the speed and customizability of
  [Vite](https://vitejs.dev). Changes to your code immediately appear in the
  browser without having to refresh the page.
- Developer [mode](/developing) which makes it easier to debug and develop
  experiments. It's like brain surgery for your experiment. Jump between
  sections without endless clicking, autofill forms, generate realistic but fake
  data, monitor database status, and more.
- Presentation [mode](/presentation) which makes it easy to make an interactive
  demo site you can share with reviewers and collaborators.
- Intuitive [dashboard GUI](/dashboard) for monitoring data collection and
  performing quality control.
- Built-in support for multiple [recruitment services](/recruitment) including
  Prolific, MTurk, CloudResearch, and more.
- Automatic and secure data storage and retrieval using a simple and flexible
  [database](/datastorage) system based on
  [Google Firestore and and Real-time Database ](https://firebase.google.com).
- Modular design includes built-in support for common experiment needs like
  consent forms, captchas, instructions, surveys, randomization, and data
  storage. Just add your custom experiment logic and start collecting data.
- Automatic deployment of the latest code to the web using
  [GitHub Actions](https://github.com/features/actions). No worries about
  remembering to upload your latest code.
- Automated testing framework including unit tests and end-to-end tests using
  [Cypress.io](https://www.cypress.io/). Make sure your code is reliable and
  bug-free.
- Integrates with the rest of your research life including Slack notifications,
  automatic generation of QR codes for posters and representations, and more.
- Great looking docs if we do say so ourselves!

The current development is happening at
[https://github.com/nyuccl/smile](https://github.com/nyuccl/smile).

Want to learn more? Continue [here](/requirements).

---

::: warning What we assume

Generally this project assumes you know basic to intermediate modern
[Javascript](https://javascript.info/), have some familiarity with typing
commands in a terminal program, git, [GitHub](https://github.com), and
understand basic concepts about web servers and web design. Some helpful
websites to address deficiencies:

- [Modern Javascript](https://javascript.info) - a great resource for learning
  Javascript
- [The missing semester of your CS education](https://missing.csail.mit.edu) -
  how to use the shell/terminal program, git, security concepts/encryption
- [Shell.how](https://www.shell.how) - helps you learn and interpret different
  shell/terminal commands
- [Git for beginners](https://medium.com/dwarsoft/git-for-beginners-part-i-basic-git-concepts-a7beb5a136d)
- [Interneting is hard](https://www.internetingishard.com) - Friendly web
  development tutorials for complete beginners
- [Learn Vue](https://learnvue.co) - useful website for learning the Vue.js
  framework
- [Vuejs tutorial](https://vuejs.org/tutorial/#step-1)
- [Vuejs docs](https://vuejs.org/guide/introduction.html)

:::
