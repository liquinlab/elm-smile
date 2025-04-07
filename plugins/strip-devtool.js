function removetag(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, 'gi')
  // Repeatedly apply the regex until no more tags are found
  while (pattern.test(html)) {
    html = html.replace(pattern, '')
  }
  return html
}

function removeline(src, tagName) {
  // Create a regular expression that matches any line containing the specified word
  const regex = new RegExp(`^.*${tagName}.*(?:\\r?\\n|\\r)?`, 'gim')
  // Replace all occurrences of lines containing the word with an empty string
  return src.replace(regex, '')
}

export default function stripDevToolPlugin() {
  let config
  const loaderMatch = /(App\.vue|SmileApp\.vue)$/
  return {
    name: 'smile-strip-dev-tool', // name of the plugin
    configResolved(resolvedConfig) {
      // store the resolved config
      config = resolvedConfig
    },

    transform(src, id) {
      if (loaderMatch.test(id)) {
        let clean_src = src

        // Handle App.vue specific removals
        if (id.endsWith('App.vue')) {
          if (config.mode !== 'development') {
            // Remove Notivue related components
            clean_src = removetag(clean_src, 'Notivue')
            clean_src = removeline(clean_src, 'Notivue')
            clean_src = removeline(clean_src, 'notivue')
          }
        }

        // Handle SmileApp.vue specific removals
        if (id.endsWith('SmileApp.vue')) {
          if (config.mode !== 'presentation' && config.mode !== 'development') {
            // Remove toolbar div
            clean_src = clean_src.replace(/<div class="toolbar">[\s\S]*?<\/div>/g, '')
          }

          // Remove presentation components if not in presentation mode
          if (config.mode !== 'presentation') {
            clean_src = removetag(clean_src, 'PresentationNavBar')
            clean_src = removeline(clean_src, 'PresentationNavBar')
          }

          if (config.mode !== 'development') {
            // Remove development components
            clean_src = removetag(clean_src, 'DeveloperNavBar')
            clean_src = removetag(clean_src, 'DevConsoleBar')
            clean_src = removetag(clean_src, 'DevSideBar')
            clean_src = removetag(clean_src, 'Transition')
            clean_src = removetag(clean_src, 'KeyCommandNotification')

            // Remove related imports and lines
            clean_src = removeline(clean_src, 'DeveloperNavBar')
            clean_src = removeline(clean_src, 'DevConsoleBar')
            clean_src = removeline(clean_src, 'DevSideBar')
            clean_src = removeline(clean_src, 'Transition')
            clean_src = removeline(clean_src, 'KeyCommandNotification')
          }
        }

        return { code: clean_src }
      }
    },
  }
}
