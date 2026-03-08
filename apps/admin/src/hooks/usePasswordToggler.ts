import { LegacyRef, MutableRefObject, useEffect, useRef, useState } from 'react'

type UsePasswordTogglerResult = {
  ref: LegacyRef<HTMLInputElement>
  isShown: boolean
  togglePassword: () => void
}

const usePasswordToggler = (
  type = 'text',
  ref: MutableRefObject<HTMLInputElement | null | undefined> | Function | null
): UsePasswordTogglerResult => {
  const innerRef = useRef<HTMLInputElement | null>(null)
  const [isShown, setIsShown] = useState(false)

  const togglePassword = () => setIsShown(prev => !prev)

  useEffect(() => {
    if (!ref) return
    if (typeof ref === 'function') ref(innerRef.current)
    // eslint-disable-next-line no-param-reassign
    else ref.current = innerRef.current
  }, [ref])

  useEffect(() => {
    if (!innerRef.current) return
    if (type !== 'password') return
    innerRef.current.type = isShown ? 'text' : 'password'
  }, [isShown, type])

  return {
    ref: innerRef,
    isShown,
    togglePassword,
  }
}

export default usePasswordToggler
