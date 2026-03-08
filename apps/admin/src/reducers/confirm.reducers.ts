export const SHOW_CONFIRM = 'SHOW_CONFIRM'
export const HIDE_CONFIRM = 'HIDE_CONFIRM'
export const SET_CONFIRM_CONTENT = 'SET_CONFIRM_CONTENT'
export const SET_LOADING_CONFIRM = 'SET_LOADING_CONFIRM'

export enum AlertTypes {
  WARN = 'warn',
  CONFIRM = 'confirm',
}

export type ConfirmOptionsType = {
  loading?: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  alertType?: AlertTypes
  onConfirm?: () => void
}

export const initialState = {
  show: false,
  loading: false,
  content: {} as ConfirmOptionsType,
}

export type ActionTypes = {
  type:
    | 'SHOW_CONFIRM'
    | 'HIDE_CONFIRM'
    | 'SET_CONFIRM_CONTENT'
    | 'SET_LOADING_CONFIRM'
  payload?: ConfirmOptionsType | boolean
}

export const reducer = (
  state: typeof initialState = initialState,
  action: ActionTypes
): typeof initialState => {
  switch (action.type) {
    case SHOW_CONFIRM:
      return {
        ...state,
        show: true,
      }
    case SET_LOADING_CONFIRM:
      return {
        ...state,
        loading: action.payload as boolean,
      }
    case HIDE_CONFIRM:
      return {
        ...state,
        show: false,
      }
    case SET_CONFIRM_CONTENT:
      return {
        ...state,
        content: action.payload as ConfirmOptionsType,
      }
    default:
      return state
  }
}
