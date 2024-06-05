# :artist: Overview

The following sections describe how to design experiments using the <SmileText/>
project. It covers the basic of programming new task elements, configuring the
timeline/flow of your experiments, and customizing the look and feel of your
experiments.

## :woman_technologist: Developer mode

When learning about <SmileText/> and later developing/debugging your experiment
it is useful to interact with Smile using a web server running on your local
computer (i.e., your laptop or desktop). <SmileText/> provides a special local
developer mode that adds some interface elements to the page that help you debug
and test your experiment. You can learn more about developer mode
[here](/developermode). But the TL;DR is

```
npm run dev
```

in the project folder to get started.

## :gear: Configuring

Every experiment is different and requires different configurations options for
things like the database credentials, etc... In <SmileText/>, configs are set
using `.env` files. Some of these are automatically generated, some are pass
from the [base repo](/labconfig) to child repos, and some need to be customize
for each experiment. [This section](/configuration) of the documentation
explains all the configuration settings avaialble.

## :jigsaw: Components

<img src="/images/components.png" width="50%" align="right">

This section introduces the concept of a [**component**](/components) and how
components help organize code by making it more modular and reusable. Then we
discuss specific features of Vue.js components (e.g.,
[single-file components](/components#single-file-components),
[declarative rendering](/components#declarative-rendering-and-reactivity), and
[reactivity](/components#declarative-rendering-and-reactivity)) that help make
web development code more compact and error-free.

## :twisted_rightwards_arrows: Timeline and Views

Most experiments are made of of several phases (e.g., welcome, informed consent,
instructions, debriefing, etc...). We call the phases "Views" and each major
phase of an experiment is associated with its own Vue component. Learn about
views [here](/timeline#views).

Most experiments require participants to proceed through these phases in a
particular order. For example, informed consent must be provided and agreed to
before we perform the actual experiment. Smile provides a
[timeline](/timeline#timeline) that you use to configure this behavior.

## :bricks: Built-in Views

Smile comes with several [built-in views](/builtins) for common phases of an
experiment. This includes things like obtaining informed consent, presenting
instructions, CAPTCHAs and presenting a thank you page. We describe these
default built-in views and provide an overview of how to customize them for your
own experiment.

## :ladder: Stepping trials

Many experiments are organized into a series of repeated events called "trials".
Trials are different than views (see above) because they often repeat the same
basic structure many times. Smile provides several features for
[organizing and managing trials](/trials). We introduce the concept of a "trial"
and how to programmatically advance through a sequence of trials within a
particular View. The same concept is also used to add sequential build to any
type of view (e.g., a sequence of instructions).

## :writing_hand: Autofill

When developing and debugging your experiment it is useful to have a way to
"fake" data from participants. This can be used to quickly advance through the
experiment to test different parts of the code. Smile provides a way to
[autofill forms](/autofill) with fake data. In addition, you can generate fake,
but realistic data for your experiment. This can help later to test your data
analysis scripts.

## :game_die: Randomization

Almost all experiments require some form of randomization. This could be
randomizing participants to a condition or randomizing the order of trials.
Smile provides several mechanisms for [randomizing](/randomization) the order of
the flow of experiments.

## :framed_picture: Image and Videos

Many experiments preset videos or images to participants. We describe how to
distribute [images and videos](/imagesvideo) with your Smile project, how to
preload them so that they appear immediately when needed, and how to display
them in your experiment.

## :artist: Styling, CSS, and Icons

Smile uses the Bulma CSS framework for help with styling interface elements.
This provides nice looking buttons, tables, and other design elements.
[Here](/style) we describe how to use Bulma to change the look and feel of your
experiments. We also describe how to use icons in your experiments which add
polish and help users understand the interface. Of course, you can style your
components with custom CSS as well or overwrite Smile defaults for your entire
project.

## ::movie_camera:: Saving and Recording Data

The most important function of any web experiment platform is securely saving
data. Smile provides serveral ways to [save and record data](/datastorage). In
addition the Smile API takes care of manny functions for you so you rarely have
to think much about data storage and saving.

## :sos: Dealing with Errors

When running an experiment it is important to handle errors gracefully. Smile
provides several helpful features to deal gracefully with errors.

## :lady_beetle: Automated Testing

When running an experiment it is important to handle errors gracefully. Smile
provides several helpful features to deal gracefully with errors.
