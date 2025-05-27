/**
 * @fileoverview Main entry point for the SMILE application that imports core dependencies
 */

/**
 * Core imports for the SMILE application including:
 * - Vue and Vue plugins (FormKit, Router, Pinia, Notivue, Google Analytics)
 * - UI components and styling (FontAwesome, FormKit theme)
 * - Application configuration (timeline, icons)
 */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { plugin, defaultConfig } from '@formkit/vue'
import { useRouter, addGuards } from '@/core/router'
import { pinia } from '@/core/stores/createPinia'
import { createNotivue } from 'notivue'
import timeline from '@/user/design'
import '@formkit/themes/genesis'
import App from '@/core/App.vue'
import { createApp } from 'vue'
import VueGtag from 'vue-gtag'
import '@/core/utils/icons'

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
