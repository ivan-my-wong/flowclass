import { useEffect, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'

const useNavigateDialogPage = (
  back: string,
  onBack?: () => void
): {
  isOpen: boolean
  navigate: NavigateFunction
  setIsOpen: (isOpen: boolean) => void
} => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(true)
  useEffect(() => {
    if (!isOpen) {
      navigate(back)
      onBack?.()
    }
  }, [isOpen, navigate, back, onBack])
  return {
    isOpen,
    navigate,
    setIsOpen,
  }
}

export default useNavigateDialogPage
