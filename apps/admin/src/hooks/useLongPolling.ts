import { useEffect } from 'react'

// Utility function for implementing polling
const useLongPolling = ({
  refetchFn,
  dependencyArray = [],
  isEnabled = false,
}: {
  refetchFn: () => Promise<any>
  dependencyArray?: any[]
  isEnabled?: boolean
}): void => {
  useEffect(() => {
    if (!isEnabled) return () => {}

    let isActive = true
    const poll = async () => {
      if (!isActive) return
      await refetchFn()
      if (isActive) {
        setTimeout(poll, 1000)
      }
    }
    poll()

    return () => {
      isActive = false
    }
  }, dependencyArray)
}

export default useLongPolling
