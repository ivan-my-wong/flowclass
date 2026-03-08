import { School } from '@/types/school'

export const SET_IS_SAVING = 'SET_IS_SAVING'
export const SET_IS_UNSAVED_CHANGES = 'SET_IS_UNSAVED_CHANGES'
export const SET_IS_STYLE_UNSAVED_CHANGES = 'SET_IS_STYLE_UNSAVED_CHANGES'
export const SET_CURRENT_SCHOOL = 'SET_CURRENT_SCHOOL'
export const SET_IS_CONTACT_UNSAVED_CHANGES = 'SET_IS_CONTACT_UNSAVED_CHANGES'
export const SET_IS_REGION_LANGUAGE_UNSAVED_CHANGES =
  'SET_IS_REGION_LANGUAGE_UNSAVED_CHANGES'

export const initialState = {
  isSaving: false,
  isUnsavedChanges: false,
  isStyleUnsavedChanges: false,
  currentSchool: null as School | null | undefined,
  isContactUnsavedChanges: false,
  isRegionLanguageUnsavedChanges: false,
}

export type ActionTypes = {
  type:
    | 'SET_IS_SAVING'
    | 'SET_IS_UNSAVED_CHANGES'
    | 'SET_IS_STYLE_UNSAVED_CHANGES'
    | 'SET_CURRENT_SCHOOL'
    | 'SET_IS_CONTACT_UNSAVED_CHANGES'
    | 'SET_IS_REGION_LANGUAGE_UNSAVED_CHANGES'
  payload?: boolean
  currentSchool?: School | undefined | null
}

export const editSchoolReducer = (
  state: typeof initialState = initialState,
  action: ActionTypes
): typeof initialState => {
  switch (action.type) {
    case SET_IS_SAVING:
      return { ...state, isSaving: !!action.payload }
    case SET_IS_UNSAVED_CHANGES:
      return { ...state, isUnsavedChanges: !!action.payload }
    case SET_IS_STYLE_UNSAVED_CHANGES:
      return { ...state, isStyleUnsavedChanges: !!action.payload }
    case SET_CURRENT_SCHOOL:
      return { ...state, currentSchool: action.currentSchool }
    case SET_IS_CONTACT_UNSAVED_CHANGES:
      return { ...state, isContactUnsavedChanges: !!action.payload }
    case SET_IS_REGION_LANGUAGE_UNSAVED_CHANGES:
      return {
        ...state,
        isRegionLanguageUnsavedChanges: !!action.payload,
      }
    default:
      return state
  }
}
