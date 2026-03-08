import { useContext } from 'react'

import GlobalErrorContext from '@/contexts/ErrorContext'
import { GlobalErrorContextValue } from '@/reducers/globalError.reducers'

export const useGlobalError = (): {
  errorState: GlobalErrorContextValue
  setError: (error: GlobalErrorContextValue) => void
  resetError: () => void
} => {
  const [errorContext, dispatch] = useContext(GlobalErrorContext)
  if (!errorContext) {
    throw new Error('useGlobalError should be used within <GlobalError>')
  }

  const setError = (error: GlobalErrorContextValue) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error })
  }
  const resetError = () => {
    dispatch({ type: 'RESET_GLOBAL_ERROR' })
  }

  return { errorState: errorContext, setError, resetError }
}
