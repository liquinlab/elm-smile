/**
 * Removes all occurrences of a specified HTML tag and its contents from a string
 * @param {string} html - The HTML string to process
 * @param {string} tagName - The name of the tag to remove
 * @returns {string} The HTML string with all instances of the specified tag removed
 */
function removetag(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, 'gi')
  // Repeatedly apply the regex until no more tags are found
  while (pattern.test(html)) {
    html = html.replace(pattern, '')
  }
  return html
}

/**
 * Removes all lines containing a specified string from a source text
 * @param {string} src - The source text to process
 * @param {string} tagName - The string to search for in each line
 * @returns {string} The source text with all lines containing the search string removed
 */
function removeline(src, tagName) {
  // Create a regular expression that matches any line containing the specified word
  const regex = new RegExp(`^.*${tagName}.*(?:\\r?\\n|\\r)?`, 'gim')
  // Replace all occurrences of lines containing the word with an empty string
  return src.replace(regex, '')
}

/**
 * Creates a Vite plugin that strips development tools and components based on build mode
 * @returns {import('vite').Plugin} A Vite plugin object that transforms App.vue and SmileApp.vue files
 */
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
        console.log('  ➜  stripping dev/present mode components from', id.split('/').slice(-3).join('/'))
        let clean_src = src

        // Handle App.vue specific removals
        if (id.endsWith('App.vue')) {
          if (config.mode !== 'development') {
            // Remove Notivue related components
            clean_src = removetag(clean_src, 'Notivue')
            clean_src = removeline(clean_src, 'Notivue')
            clean_src = removeline(clean_src, 'notivue')
            clean_src = removeline(clean_src, 'DevAppSidebar')
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
