/**
 * Maps width classes to their responsive versions for layout components
 * This ensures Tailwind includes all these classes in the build
 */
export const getResponsiveWidthClasses = (leftWidth) => {
  const widthMap = {
    'w-1/12': 'w-full @lg:w-1/12',
    'w-1/6': 'w-full @lg:w-1/6', 
    'w-1/4': 'w-full @lg:w-1/4',
    'w-1/3': 'w-full @lg:w-1/3',
    'w-2/5': 'w-full @lg:w-2/5',
    'w-1/2': 'w-full @lg:w-1/2',
    'w-3/5': 'w-full @lg:w-3/5',
    'w-2/3': 'w-full @lg:w-2/3',
    'w-3/4': 'w-full @lg:w-3/4',
    'w-4/5': 'w-full @lg:w-4/5',
    'w-5/6': 'w-full @lg:w-5/6',
    'w-11/12': 'w-full @lg:w-11/12',
  }
  
  return widthMap[leftWidth] || 'w-full @lg:w-1/3'
}