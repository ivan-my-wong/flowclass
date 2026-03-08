import { useState } from 'react'

import constate from 'constate'

const [TabStateProvider, useTabState] = constate(() => {
  const [currentTab, setCurrentTab] = useState<string>('')
  return { currentTab, setCurrentTab }
})

export { TabStateProvider as TabProvider, useTabState as useTabContext }
