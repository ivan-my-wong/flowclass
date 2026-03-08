import { useEffect, useRef } from 'react'

import type React from 'react'

export function useForwardedRef<T>(forwardedRef: React.ForwardedRef<T>) {
  const innerRef = useRef<T>(null)

  useEffect(() => {
    if (!forwardedRef) return

    if (typeof forwardedRef === 'function') {
      forwardedRef(innerRef.current)
    } else {
      const ref = forwardedRef
      ref.current = innerRef.current
    }
  }, [forwardedRef])

  return innerRef
}
