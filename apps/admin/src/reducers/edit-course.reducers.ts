import { Classes } from '@/types/classes'
import { Course } from '@/types/course'

export const SET_IS_SAVING = 'SET_IS_SAVING'
export const SET_IS_OPEN_MESSAGE_UNSAVED_CHANGES =
  'SET_IS_OPEN_MESSAGE_UNSAVED_CHANGES'
export const SET_IS_OPEN_CONFIRM_UNSAVED_CHANGES =
  'SET_IS_OPEN_CONFIRM_UNSAVED_CHANGES'
export const SET_IS_UNSAVED_CHANGES = 'SET_IS_UNSAVED_CHANGES'
export const SET_IS_PREREQUISITES_UNSAVED_CHANGES =
  'SET_IS_PREREQUISITES_UNSAVED_CHANGES'
export const SET_IS_COURSE_SETTINGS_UNSAVED_CHANGES =
  'SET_IS_COURSE_SETTINGS_UNSAVED_CHANGES'
export const SET_SHOW_PUBLISH_MODAL = 'SET_SHOW_PUBLISH_MODAL'
export const SET_SHOW_ARCHIVE_MODAL = 'SET_SHOW_ARCHIVE_MODAL'
export const SET_SHOW_LEAVE_EDIT_WITHOUT_SAVE =
  'SET_SHOW_LEAVE_EDIT_WITHOUT_SAVE'
export const SET_CURRENT_COURSE = 'SET_CURRENT_COURSE'
export const SET_MAP_DIRTY_CLASSES = 'SET_MAP_DIRTY_CLASSES'
export const SET_CURRENT_CLASS = 'SET_CURRENT_CLASS'
export const initialState = {
  isSaving: false,
  isUnsavedChanges: false,
  showPublishModal: false,
  showArchiveModal: false,
  isOpenConfirmUnSaveChange: false,
  isOpenMessageUnSavedChanges: false,
  showLeaveEditWithoutSave: false,
  isPrerequisitesUnSaveChange: false,
  isCourseSettingsUnsavedChanges: false,
  currentCourse: null as Course | null | undefined,
  currentClass: null as Classes | null | undefined,
  mapDirtyClasses: {} as Record<number, boolean>,
}
type ClassPayload = { classId: number; data: Partial<Classes> }
export type ActionTypes = {
  type:
    | 'SET_IS_SAVING'
    | 'SET_IS_OPEN_MESSAGE_UNSAVED_CHANGES'
    | 'SET_IS_OPEN_CONFIRM_UNSAVED_CHANGES'
    | 'SET_IS_UNSAVED_CHANGES'
    | 'SET_IS_PREREQUISITES_UNSAVED_CHANGES'
    | 'SET_SHOW_PUBLISH_MODAL'
    | 'SET_SHOW_LEAVE_EDIT_WITHOUT_SAVE'
    | 'SET_CURRENT_COURSE'
    | 'SET_IS_COURSE_SETTINGS_UNSAVED_CHANGES'
    | 'SET_MAP_DIRTY_CLASSES'
    | 'SET_CURRENT_CLASS'
    | 'SET_SHOW_ARCHIVE_MODAL'

  payload?: boolean | ClassPayload | number | Record<number, boolean>
  currentCourse?: Course | undefined | null
  currentClass?: Classes | undefined | null
}

export const editCourseReducer = (
  state: typeof initialState = initialState,
  action: ActionTypes
): typeof initialState => {
  switch (action.type) {
    case SET_IS_SAVING:
      return { ...state, isSaving: !!action.payload }
    case SET_IS_OPEN_MESSAGE_UNSAVED_CHANGES:
      return { ...state, isOpenMessageUnSavedChanges: !!action.payload }
    case SET_IS_OPEN_CONFIRM_UNSAVED_CHANGES:
      return {
        ...state,
        isOpenConfirmUnSaveChange: !!action.payload,
      }
    case SET_SHOW_LEAVE_EDIT_WITHOUT_SAVE:
      return { ...state, showLeaveEditWithoutSave: !!action.payload }
    case SET_IS_UNSAVED_CHANGES:
      return { ...state, isUnsavedChanges: !!action.payload }
    case SET_SHOW_PUBLISH_MODAL:
      return { ...state, showPublishModal: !!action.payload }
    case SET_SHOW_ARCHIVE_MODAL:
      return { ...state, showArchiveModal: !!action.payload }
    case SET_IS_PREREQUISITES_UNSAVED_CHANGES:
      return { ...state, isPrerequisitesUnSaveChange: !!action.payload }
    case SET_CURRENT_COURSE:
      return { ...state, currentCourse: action.currentCourse }
    case SET_IS_COURSE_SETTINGS_UNSAVED_CHANGES:
      return { ...state, isCourseSettingsUnsavedChanges: !!action.payload }
    case SET_MAP_DIRTY_CLASSES:
      return {
        ...state,
        mapDirtyClasses: action.payload as Record<number, boolean>,
      }
    case SET_CURRENT_CLASS:
      return { ...state, currentClass: action.currentClass }
    default:
      return state
  }
}
