import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { plugin, defaultConfig } from '@formkit/vue'
import { useRouter, addGuards } from '@/core/router' // import the router
import { pinia } from '@/core/createpinia'
import { createNotivue } from 'notivue' // drag components
import timeline from '@/user/design'
import '@formkit/themes/genesis'
import App from '@/core/App.vue' // import the main app component
import { createApp } from 'vue'
import VueGtag from 'vue-gtag' // google analytics
import '@/core/icons' // configure fontawesome

/**
 * Initialize the Vue application and router
 * @constant {Vue} app - The main Vue application instance
 * @constant {Router} router - The Vue router instance configured with timeline
 * @description Creates the Vue app and configures the router with:
 * - Timeline configuration from user design
 * - Navigation guards for route protection
 * - Full application routing functionality
 */
const app = createApp(App) // create the app
const router = useRouter(timeline) // use the router
addGuards(router) // add guards to the router

/**
 * Create and configure the notification system
 * @constant {Object} notivue
 * @description Configures the notification system with the following settings:
 * - Position: Top left corner of the screen
 * - Limit: Maximum of 4 notifications shown at once
 * - Enqueue: New notifications are queued when limit is reached
 * - Avoid Duplicates: Prevents duplicate notifications
 * - Global Duration: All notifications last 2000ms by default
 */
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

/**
 * Register and configure Vue plugins and global components
 * @description Sets up the Vue application with required plugins:
 * - Pinia for state management
 * - Vue Router for navigation
 * - FormKit for form handling
 * - Notivue for notifications
 * - Vue-Gtag for Google Analytics
 *
 * Also registers global components and mounts the app
 */

// Register core plugins
app.use(pinia) // State management
app.use(router) // Routing
app.use(plugin, defaultConfig) // FormKit
app.use(notivue) // Notifications

// Configure and register Google Analytics
app.use(
  VueGtag,
  {
    disableScriptLoad: import.meta.env.MODE === 'development', // Disable in dev mode
    pageTrackerExcludedRoutes: ['recruit'], // Exclude recruit route
    config: { id: import.meta.env.VITE_GOOGLE_ANALYTICS },
  },
  router
)

// Register global components
app.component('FAIcon', FontAwesomeIcon) // Font Awesome icons available globally

// Mount the application
app.mount('#app')
