import DefaultTheme from 'vitepress/theme'

import DarkModeImage from './DarkModeImage.vue'
import GureckisLabText from './GureckisLabText.vue'
import SmileText from './SmileText.vue'
import { Button } from '@/uikit/components/ui/button'
import { Badge } from '@/uikit/components/ui/badge'
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/ui/button-group'
import { Checkbox } from '@/uikit/components/ui/checkbox'
import { Switch } from '@/uikit/components/ui/switch'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('DarkModeImage', DarkModeImage)
    app.component('GureckisLabText', GureckisLabText)
    app.component('SmileText', SmileText)
    app.component('Button', Button)
    app.component('Badge', Badge)
    app.component('ButtonGroup', ButtonGroup)
    app.component('ButtonGroupItem', ButtonGroupItem)
    app.component('Checkbox', Checkbox)
    app.component('Switch', Switch)
  },
}
