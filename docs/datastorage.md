# :package: Data Storage

Data recording and storage are critical functions of an experiment that enables
[analysis](/analysis). When a user participates in an experiment we would like a
centralized place to organize the data from each participant. We would like this
storage system to be secure, robust, scalable, and fault tolerant.

Depending on your experiment design you may need to develop custom data storage
code (e.g., real-time multiplayer games). But in most cases that cover
"experimental cognitive science on individuals", <SmileText/> provides a robust
solution that requires little to no configuration or code. Dealing with data is
so important,
[it isn't something you should even have to think about](/philosophy.html#no-code-is-the-best-code)!

This document describes the basics of <SmileText/> data storage including how to
configure the system, how to use the data storage techniques manually in your
code, the overall logic behind how it works, and how to set it up for a new lab.

## Getting started quickly

If you start your project using the <SmileText /> Github template, and are in
the gureckislab and follow the [starting a new project](/starting) guide then
there's nothing else for you to do. Your application already has the ability to
save data to a password protected lab database and will begin saving the data
from your experiment as participants progress through your task!

As a result, you can jump immediately to either:

- [Accessing your data](#accessing-the-data-from-your-experiments)
- [How to save data in your experiment](#recording-data)

In addition to these sections, the rest of the document includes an in-depth
guide to understanding how data is managed in <SmileText />, how to customize
aspects of the data processing system, and how to set up a new system for a new
lab.

## Accessing the data from your experiments

It may be weird to start first with how to access your data rather than
discussing how to save it but it turns out the default <SmileText />
configuration takes you pretty far to begin with on the saving side with no
configuration, so we can start with accessing the saved data. There are two ways
to monitor your data and export it for later analysis: the <SmileText /> command
line tool and the Firebase console.

### Exporting data using the command line tool

When you are ready to export your data for analysis you can use the
<SmileText /> command line tool. Simply run:

```
npm run getdata
```

in a terminal from the root directory of your project and an interactive script
will guide you through the options of downloading different subsets of data.
Data is typically output as a `.json` file in the `data/` folder but is
something configured via the interactive prompts. From here you can begin
[data analysis](/analysis).

### Viewing data in the Firebase console

Data from your experiment is stored, long-term, in a
[Google Firestore database](https://cloud.google.com/firestore). You can read
more of the details about this below. However, in terms of looking at this data
and monitoring it during development, Google provides a web-based console that
allows you to view the data from your experiment in real-time. To access the
console, you first need permission to access your project/labs Firestore from
your Google Account. Once you are added to the project go to
[https://console.firebase.google.com/](https://console.firebase.google.com/) and
you should see something similar to this:

![Firebase projects](/images/firebase-projects.png)

Here there is one project named `smile-db-test` and yours might be different.
Whatever it is, click the project name and you will be presented with a project
overview looking similar to this:

![Firebase project overview](/images/firebase-project-overview.png)

Next, click the "Firestore Database" on the left-hand menu under "Project
Shortcuts" and you will get the interface to the database:

![Firebase project overview](/images/firebase-viewer.png)

This is a live view of the database that updates automatically as new data comes
in. Data is organized into documents and collections which act similar to
folders and files on your computer. At the top (root) level of a <SmileText />
project is two collections called `real` and `testing`. The `testing` collection
is where data goes anytime you are running your experiment in
[development mode](/developing). The `real` collection is where data goes
anytime you are running your experiment on a live [deployment](/deploying).

Under the top level collection is a list of documents, one for each experiment
in the lab. The names of these documents reflect the
`${VITE_GIT_OWNER}-${VITE_GIT_REPO_NAME}-${VITE-GIT-BRANCH}` for your project.
Refer to the documentation on
[organizing versions of your experiment](/deploying.html#organizing-versions-of-your-experiment)
for more information. Suffice to say that this is automatically configured and
places your data into "folders" based on the current branch of your code in
which you are working or deployed.

Within each folder is a new collection called `data` which contains records for
each participant who started your experiment. It looks like this:

![Firebase data listing](/images/firebase-data-listing.png)

Each participant in your study is automatically assigned a random id which is
the name of the document (e.g., `57Af2dq105RgzFqqgcZS` in the screenshot).
Clicking on that document shows its contents which is a structured JSON-like
representation of the data from your experiment.

![Firebase data record](/images/firebase-data-record.png)

You can use this web interface to delete data, and also watch as it fills in
real-time. This can be helpful to check that things are working and also that
the data has the structure you expected.

## Recording data

The default project template of <SmileText /> automatically records and saves
many relevant data fields including logging if participants agreed to provide
informed consent, the current version of the code that the participant is
interacting with, etc... However, invariably you will want to record and save
the data from your actual experiment design including aspects of the
instructions and task or trials that might be custom to your task. It is
extremely simple to do this but it is helpful to understand the concepts
involved first.

### The concept of "state"

State refers to one or more variables organized into a collection that captures
the moment-by-moment details of your application. The state of your application
changes over time as users interact with it (e.g., clicking on buttons), as well
as based on network requests that load data and information from other APIs or
databases.

As an everyday example, the state of a light switch in your home can be either
`light=on` or `light=off`. When you take actions (click a button or flick a
switch) the state changes. In an electrical circuit this state is implemented as
a physical switch that either allows or blocks the flow of current. However, in
a web application state is much more complex and might include things like "user
is logged in" (`logged_in=true` or `logged_in=false`), or even things with
values like username (`username=linustorvalds` or `username=thurstonmoore`).
Each of these states also change based on actions the user of the software
takes.

The central question in developing web experiments is managing this state and
using the state to display the correct information to the user (e.g., we should
show the person a login page if they haven't yet logged in, or otherwise their
account information for their username). Although <SmileText /> is not
necessarily a complex web application with login forms, etc... it is
sufficiently complex that the code for managing the overall application state is
distributed into different modules which generally have different properties.

![overview ](/images/storage-statediagram.png)

### Local states, global state, and persistance

A <SmileText /> experiment is made up of various [components](/components) which
are controlled programmatically. Each component has what is known as **state**
which is data reflecting the current component. Ideally, state is local to each
component allowing for modularity (users of a component don't have to know the
internal workings). Example of local state might be "is the participant on page
1, 2, or 3 of the instructions?" Or "what are the values of various form
fields?" or "What is the x,y position of the mouse currently?" In most cases
these types of values do not need to be globally available all components.

However, there are times where it makes sense for there to be a **global state**
which is shared by all components. You can think of this as a global
"whiteboard" that any component can access. This is where you place information
that is common to all components and is a natural place to put data from human
participants in your study (because data might be generated from several
different components over the entire experiment). In <SmileText /> this global
state is known as a **store** and is managed by the
[Pinia](https://pinia.vuejs.org) plugin. Stores are slightly more general than
state because while they maintain a global state, they provide methods for
manipulating that state as well as additional debugging tools (see Pinia).

A final issue concerns the **persistance of state**. Some state information
(e.g., information local to a component) is "in memory" in the sense that it
only exists inside the temporary memory storage of the browser while it is
viewing your experiment. If you close the browser window, press reload, navigate
to a new page then press back, or the browser unexpectedly crashes, the state is
lost. Another name for this type of state information is **ephemeral**. In
contrast we can make some types of state **persistant** by synchronizing it with
various tools for data storage. In <SmileText />, we set up a system that
persists the global application state in several ways but the most important one
is storing data from our participant's behavior in Google Firestore (which is a
NoSQL database solution hosted on the Google Cloud). We also make use of state
persistance features of the browser such as
[local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
which is similar to cookies.

A graphical overview of this is provided above. Individual components usually
have ephemeral states which capture information that doesn't need to be shared
or recorded/persisted. Components in <SmileText /> can, when necessary, write
information into the global store. Other components are able to read this
information. In addition, <SmileText/>'s global storage state provides methods
for easily persisting values of the state by writing them either to Google
Firebase/Firestore or the LocalStorage in the browser.

## Writing Data to the Global Store

The preferred way to write data to the store is to use the [Smile API](/api):

```vue
<script setup>
import SmileAPI from '@/core/composables/useAPI'
const api = SmileAPI()

api.recordData({
        trialnum: step_index.value,
        word: step.value.word,
        color: step.value.color,
        condition: step.value.condition,
        response: e.key,
      })
```

The API provides several useful methods for saving data to the store (see the
[full docs](/api)).

An alternative way to write data to the store is to use the `smilestore` object
Writing to the global store is as simple as updating a Javascript object in
memory. In any Vue component simple write

```vue
<script setup>
import { useSmileStore } from '@/core/stores/smilestore'
const smilestore = useSmileStore()

// sets a new variable called 'something' to 'true' in the global store
smilestore.data.something = true
<script>
```

You can also add custom setter and getter methods for your data type in
`src/core/stores/smilestore.js`. For example, in that file

```js
isConsented: (state) => state.data.consented
```

which returns the value of `state.data.consented`. In your component code then
you call `smilestore.isConsented()` to check if the use has agreed to the
consent form yet.

## Automatically recorded data

In addition to data that you manually record <SmileText /> automatically tracks
additional information about the browser state during your experiment.
Specifically, it records window resize events, and changes in focus (blur means
when someone clicks on a window other than the current browser and focus is an
even when the window is brought back to the front). These fields can sometimes
be used to detect odd behaviors such as using another window to search for
answers or dual-tasking. The data is tracked in `smilestore.data.browserData` in
a easy to parse JSON structure.

## Automatic saving/persistance

You can configure automatic saving whenever a page change happens using the
TimelineStepper using `env/.env` using option `VITE_AUTO_SAVE_DATA`.

:::warning

This only works if you use the `TimelineStepper` to move between pages. If you
advance to new pages on your own you need to call `api.saveData()` manually.

:::

## Google Firebase/Firestore

Fully explaining Google Firebase/Firestore is beyond the scope of this document
but there are many helpful videos and documentation websites:

- Video introduction to
  [Google Cloud Firestore](https://www.youtube.com/watch?v=QcsAb2RR52c&list=PLl-K7zZEsYLmOF_07IayrTntevxtbUxDL)
- The [Cloud Firestore Console](https://console.firebase.google.com/u/0/)

## Limitations

One thing to be aware of is that Firebase has some limits on writing to
documents. In particular, documents cannot be larger than 1MB. In addition, each
write costs some money. Finally, you can only write to a document once per
second. To prevent problems with this, the smilestore object has a few
configuration options (configured in `env/.env`).

These include `VITE_MAX_WRITES` which configures the maximum number of writes
allowed for any run of your experiment (meaning a single load of your experiment
by a participant). By default, this is set to 1000 and is meant to prevent an
accident where your code runs in a loop writing data endlessly. After 1000
writes, subsequent writes will be ignored. Second, there is
`VITE_MIN_WRITE_INTERVAL` which configures how many milliseconds need to pass
between writes. By default this is set to 2000 which is roughly double the rate
limiting of the Firebase. This works pretty well though with the Automatic
Saving described earlier since each step on the timeline typically will take a
while (e.g., filling out a form or reading some instructions). However, during
testing if you click through things quickly several of your writes might be
skipped by this throttling.

## Local storage

In addition to the persistence of data from the application state in Firebase,
Smile makes use of persisted data in the browser as well using a feature known
as Local Storage which is similar to "browser cookies". Basically, local storage
is a way for a website to write small amounts of data to the users computer and
access it at a later time. In <SmileText/> this is used to track things across
page reloads. For example, if a subject reloads the page in the middle of an
experiment, we'd like them to pick up where they left off. In addition, that
subject needs to "reconnect" to the Firebase database document that they were
currently working from. To persist data like this, which is specific to the
user, across page reloads or restarts of the browser we sync a few key values
with the browser's local storage. The data which is synced to local storage is
in `smilestore.local` (see `smilestore.js`).

## Setting up Google Firestore

[TO BE WRITTEN -- HOW TO CREATE A NEW FIREBASE INSTANCE]

- Create a new project
- Create a web app
- Enable anonymous login
- Change the privacy settings

## SmileStore API

`stores/smilestore.js`

```vue
<script setup>
import { useSmileStore } from '@/core/stores/smilestore'
const smileStore = useSmileStore()
<script>
```

<img src="/images/pinialogo.svg" width="70px">

### createStore

This describes this method

- **Arguments**

- **Details**

Somethign about it

### saveData

This describes this method

- **Arguments**

- **Details**

Firebase has several limits on document writing. Documents can't be larger than
1MB. In addition, you can't write to the same document faster than once per
second. Since billing is based on writes it also is a bad idea to allow
unlimited writes since code can live running in a user's browser for a long time
if they do not close the window. As a result, this function has an upper limit
on the number of writes allowed. This is
[configured](configuration.html#experiment-options-env) using `VITE_MAX_WRITES`.
By default, it is 1000 but can be adjusted if you need more writes for your
experiment. In addition, the code doesn't allow this method to be called faster
than once every two seconds. This is
[configured](configuration.html#experiment-options-env) using
`VITE_MIN_WRITE_INTERVAL`.

```
service cloud.firestore {
    match /databases/{database}/documents {
        match /real/{expId} {
            match data/{dataId} {

            }
        }
        match /testing/{expId} {
            match data/{dataId} {

            }
        }
    }
}
```
