import { createContext, Dispatch, useReducer } from 'react'

import { ActionTypes, globalErrorReducer, initialState } from '@/reducers/globalError.reducers'

const GlobalErrorContext = createContext([initialState, () => {}] as [
  typeof initialState,
  Dispatch<ActionTypes>
])

export default GlobalErrorContext
export const GlobalErrorContextProvider = ({
  children,
}: {
  children: JSX.Element
}): React.ReactElement => {
  const [state, dispatch] = useReducer(globalErrorReducer, initialState)

  return (
    <GlobalErrorContext.Provider value={[state, dispatch]}>{children}</GlobalErrorContext.Provider>
  )
}
