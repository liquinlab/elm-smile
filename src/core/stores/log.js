import { defineStore } from 'pinia'
import appconfig from '@/core/config'
import { push } from 'notivue'

import useSmileAPI from '@/core/composables/smileapi'

function getLogTrace() {
  // some browsers use 'at ', some use '@'
  const lines = new Error().stack.split('\n').filter((line) => line.includes('at ') || line.includes('@'))
  if (lines.length < 4) {
    return '(could not parse trace)'
  }
  // strip leading 'http://localhost:xxx/.../.../.../' and '?t=xxx' query param, if present
  const regex =
    /(?:at\s|@)(?:.*?\s\()?(http:\/\/localhost:\d+\/\w+\/\w+\/\w+\/)?(?<filePath>.+?)(?:\?.*?)?(?::(?<lineNumber>\d+):(?<columnNumber>\d+))\)?/
  const match = regex.exec(lines[3])
  if (match) {
    return `${match.groups.filePath} (line ${match.groups.lineNumber}, column ${match.groups.columnNumber})`
  } else {
    return '(could not parse trace)'
  }
}

function argsToString(args) {
  return args
    .map((arg) => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg)
        } catch (e) {
          return ''
        }
      } else {
        return String(arg)
      }
    })
    .join(' ')
}

export default defineStore('log', {
  state: () => ({
    history: [],
    page_history: [],
  }),
  actions: {
    add_to_history(msg) {
      this.history.push(msg)
      this.page_history.push(msg)
    },
    clear_page_history() {
      this.page_history = []
    },
    log(...args) {
      const message = argsToString(args)
      const msg = {
        type: 'log',
        time: new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }),
        message: message,
        trace: getLogTrace(),
      }
      this.add_to_history(msg)
    },
    debug(...args) {
      const message = argsToString(args)
      const msg = {
        type: 'debug',
        time: new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }),
        message: message,
        trace: getLogTrace(),
      }
      if (appconfig.mode === 'development') {
        console.log(message)
      }
      this.add_to_history(msg)
    },
    warn(...args) {
      const api = useSmileAPI()
      const message = argsToString(args)
      console.warn(message)
      const msg = {
        type: 'warn',
        time: new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }),
        message: message,
        trace: getLogTrace(),
      }
      if (
        api.dev.notification_filter !== 'None' &&
        appconfig.mode === 'development' &&
        (api.dev.notification_filter == 'Warnings and Errors' || api.dev.notification_filter == 'Warnings only')
      ) {
        push.warning(message)
      }
      console.warn(message)
      this.add_to_history(msg)
    },
    error(...args) {
      const api = useSmileAPI()
      const message = argsToString(args)
      const msg = {
        type: 'error',
        time: new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }),
        message: message,
        trace: getLogTrace(),
      }
      if (
        api.dev.notification_filter !== 'None' &&
        appconfig.mode === 'development' &&
        (api.dev.notification_filter == 'Warnings and Errors' || api.dev.notification_filter == 'Errors only')
      ) {
        push.error(message)
      }
      console.error(message)
      this.add_to_history(msg)
    },
    success(...args) {
      const api = useSmileAPI()

      const message = argsToString(args)
      const msg = {
        type: 'success',
        time: new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }),
        message: message,
        trace: getLogTrace(),
      }
      if (
        api.dev.notification_filter !== 'None' &&
        appconfig.mode === 'development' &&
        (api.dev.notification_filter == 'All' || api.dev.notification_filter == 'Success only')
      ) {
        push.success(message)
      }
      console.log(message)
      this.add_to_history(msg)
    },
  },
})
