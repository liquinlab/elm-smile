import { createApp } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { plugin, defaultConfig } from '@formkit/vue'
import '@formkit/themes/genesis'
import VueGtag from 'vue-gtag' // google analytics
// import with an @ symbol are resolved by vite to ./src directory

import App from '@/core/App.vue' // import the main app component
import timeline from '@/user/design'
import { useRouter, addGuards } from '@/core/router' // import the router
import { pinia } from '@/core/createpinia'
import '@/core/icons' // configure fontawesome

// drag components
//import VueDraggableResizable from 'vue-draggable-resizable'
import { createNotivue } from 'notivue'

// Create the app and the data store
// const pinia = createPinia() // create the data store
const app = createApp(App) // create the app
const router = useRouter(timeline)
addGuards(router)
const notivue = createNotivue({
  position: 'top-left',
  limit: 4,
  enqueue: true,
  avoidDuplicates: true,
  notifications: {
    global: {
      duration: 2000,
    },
  },
})
// register plugins
app.use(pinia) // tell the app to use the data store
app.use(router) // tell the app to use the router
app.use(plugin, defaultConfig)
app.use(notivue)
app.use(
  VueGtag,
  {
    disableScriptLoad: import.meta.env.MODE === 'development', // disable script load in development
    pageTrackerExcludedRoutes: ['recruit'], // ignore the recruit route
    config: { id: import.meta.env.VITE_GOOGLE_ANALYTICS },
  },
  router
)

// load any global components (these will be available in all other components)
app.component('FAIcon', FontAwesomeIcon)

// add the ability to drag and resize elements
//app.component('vue-draggable-resizable', VueDraggableResizable)

// you "mount the app starting at the #app element"
app.mount('#app') // start the app!
