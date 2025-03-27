import { library } from '@fortawesome/fontawesome-svg-core'
import { faRobot, faSwatchbook } from '@fortawesome/free-solid-svg-icons'
import { faCircle as farCircle } from '@fortawesome/free-regular-svg-icons'

// Import our icons configuration
import '@/core/icons'

describe('Icon Configuration', () => {
  it('should register solid icons in the library', () => {
    // Check a few sample icons to ensure they're registered
    expect(library.definitions['fas'][faRobot.iconName]).toBeDefined()
    expect(library.definitions['fas'][faSwatchbook.iconName]).toBeDefined()
  })

  it('should register regular icons in the library', () => {
    expect(library.definitions['far'][farCircle.iconName]).toBeDefined()
  })

  it('should not register non-imported icons', () => {
    // Test that an icon we haven't imported isn't registered
    expect(library.definitions['fas']['not-imported-icon']).toBeUndefined()
  })
})
