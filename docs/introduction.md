# :wave: Introduction

The goal of <SmileText/> is to make it easy and fun to collect behavioral data
online. Smile prioritizes both the developer experience (DX) while enabling more
complex experiments. It is designed for programmers with a solid understanding
of Javascript.

Key features:

- Fast and fun user interface development with [Vue.js](https://vuejs.org).
- Rapid iteration and testing leveraging the speed of
  [Vite](https://vitejs.dev).
- "Developer mode" which make it easier to debug and develop experiments.
- Easy to use and understand API.
- Built-in support for common experiment needs like consent forms, captchas,
  instructions, simple surveys, randomization, and data storage.
- Automatic deployment of latest code to the web.
- Automated testing framework including unit tests and end-to-end tests using
  [Cypress.io](https://www.cypress.io/).
- Intuitive dashboard for monitoring data collection and performing quality
  control.
- Built-in support for multiple recruitment services including Prolific, MTurk,
  CloudResearch, and more.
- Support for multi-player/dyadic social experiments.

The current development is happening at
[https://github.com/nyuccl/smile](https://github.com/nyuccl/smile).

---

There are two ways to get started with Smile depending on your situation.

1. If you are already using Smile in your lab, install the
   [required software](/requirements) to get started developing your own
   experiments.
1. If you are setting up Smile for the first time use in your lab, jump to the
   [lab config](/labconfig) docs for configuring your services.

The design choices in Smile were made so that it is relatively painless for
developers to make new experiments after your lab performs the one-time setup.
This handy flow chart gives an overview of the process:

![Starting pathway](/images/starting-pathways.png)

---

::: warning What we assume

Generally this project assumes you have some familiarity with typing commands in
a terminal program, git, [GitHub](https://github.com), and basic concepts about
web servers and web design. Some helpful websites to address deficiencies:

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
