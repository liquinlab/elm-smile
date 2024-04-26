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
  const loaderMatch = /App\.vue$/
  return {
    name: 'smile-strip-dev-tool', // name of the plugin
    configResolved(resolvedConfig) {
      // store the resolved config
      config = resolvedConfig
    },

    transform(src, id) {
      if (loaderMatch.test(id)) {
        let clean_src = src
        // remove presentation
        if (config.mode !== 'presentation') {
          clean_src = removetag(clean_src, 'PresentationNavBar')
          clean_src = removeline(clean_src, 'PresentationNavBar')
        }

        if (config.mode !== 'development') {
          // if name is .preload.js

          // remove tags
          clean_src = removetag(clean_src, 'DeveloperNavBar')
          clean_src = removetag(clean_src, 'DevDataBar')
          clean_src = removetag(clean_src, 'Notivue')
          clean_src = removetag(clean_src, 'Transition')

          // remove lines
          clean_src = removeline(clean_src, 'DeveloperNavBar')
          clean_src = removeline(clean_src, 'Notivue')
          clean_src = removeline(clean_src, 'notivue')
          clean_src = removeline(clean_src, 'DevDataBar')
          clean_src = removeline(clean_src, 'Transition')

          return { code: clean_src }
        }
      }
    },
  }
}
