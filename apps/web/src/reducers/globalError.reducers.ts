export const SET_GLOBAL_ERROR = 'SET_GLOBAL_ERROR'
export const RESET_GLOBAL_ERROR = 'RESET_GLOBAL_ERROR'

export type GlobalErrorContextValue = {
  isError: boolean
  message: string
  statusCode: string
}

export const initialState = {
  isError: false,
  message: '',
  statusCode: '',
} as GlobalErrorContextValue

export type ActionTypes = {
  type: 'SET_GLOBAL_ERROR' | 'RESET_GLOBAL_ERROR'
  payload?: GlobalErrorContextValue
}

export const globalErrorReducer = (
  state: typeof initialState = initialState,
  action: ActionTypes
): typeof initialState => {
  switch (action.type) {
    case RESET_GLOBAL_ERROR:
      return { isError: false, message: '', statusCode: '' }
    case SET_GLOBAL_ERROR:
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}
