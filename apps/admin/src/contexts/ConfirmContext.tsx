import { createContext, Dispatch, useReducer } from 'react'

import { ActionTypes, initialState, reducer } from '@/reducers/confirm.reducers'

const ConfirmContext = createContext([initialState, () => {}] as [
  typeof initialState,
  Dispatch<ActionTypes>
])

export default ConfirmContext
export const ConfirmContextProvider = ({
  children,
}: {
  children: JSX.Element
}): React.ReactElement => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <ConfirmContext.Provider value={[state, dispatch]}>
      {children}
    </ConfirmContext.Provider>
  )
}
