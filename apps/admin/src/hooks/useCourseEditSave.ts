/* eslint-disable import/prefer-default-export */
import { useContext, useEffect } from 'react'

import EditCourseContext from '@/contexts/EditCourseContext'
import {
  SET_CURRENT_CLASS,
  SET_CURRENT_COURSE,
  SET_IS_COURSE_SETTINGS_UNSAVED_CHANGES,
  SET_IS_OPEN_CONFIRM_UNSAVED_CHANGES,
  SET_IS_OPEN_MESSAGE_UNSAVED_CHANGES,
  SET_IS_PREREQUISITES_UNSAVED_CHANGES,
  SET_IS_SAVING,
  SET_IS_UNSAVED_CHANGES,
  SET_SHOW_ARCHIVE_MODAL,
  SET_SHOW_LEAVE_EDIT_WITHOUT_SAVE,
  SET_SHOW_PUBLISH_MODAL,
} from '@/reducers/edit-course.reducers'
import { Classes } from '@/types/classes'
import { Course } from '@/types/course'

import { useClassEdit } from './useClassEdit'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCourseEditSave = () => {
  const [editCourseState, dispatch] = useContext(EditCourseContext)
  const { isClassesUnsavedChanges } = useClassEdit()

  useEffect(() => {
    setIsUnSavedChanges(isClassesUnsavedChanges)
  }, [isClassesUnsavedChanges])

  const setIsSaving = (state: boolean) => {
    dispatch({ type: SET_IS_SAVING, payload: state })
  }

  const setIsUnSavedChanges = (state: boolean) => {
    dispatch({ type: SET_IS_UNSAVED_CHANGES, payload: state })
  }

  const setShowLeaveEditWithoutSave = (state: boolean) => {
    dispatch({ type: SET_SHOW_LEAVE_EDIT_WITHOUT_SAVE, payload: state })
  }

  const setShowPublishModal = (state: boolean) => {
    dispatch({ type: SET_SHOW_PUBLISH_MODAL, payload: state })
  }

  const setShowArchiveModal = (state: boolean) => {
    dispatch({ type: SET_SHOW_ARCHIVE_MODAL, payload: state })
  }

  const setIsOpenMessageUnSavedChanges = (state: boolean) => {
    dispatch({ type: SET_IS_OPEN_MESSAGE_UNSAVED_CHANGES, payload: state })
  }

  const setIsOpenConfirmUnsavedChanges = (state: boolean) => {
    dispatch({ type: SET_IS_OPEN_CONFIRM_UNSAVED_CHANGES, payload: state })
  }

  const setIsPrerequisitesUnsavedChanges = (state: boolean) => {
    dispatch({
      type: SET_IS_PREREQUISITES_UNSAVED_CHANGES,
      payload: state,
    })
  }

  const setIsCourseSettingsUnsavedChanges = (state: boolean) => {
    dispatch({
      type: SET_IS_COURSE_SETTINGS_UNSAVED_CHANGES,
      payload: state,
    })
  }

  const setCurrentCourse = (course: Course | null | undefined) => {
    dispatch({ type: SET_CURRENT_COURSE, currentCourse: course })
  }

  const setCurrentClass = (classEntity: Classes) => {
    dispatch({ type: SET_CURRENT_CLASS, currentClass: classEntity })
  }

  return {
    ...editCourseState,
    setIsSaving,
    setIsUnSavedChanges,
    setShowLeaveEditWithoutSave,
    setShowPublishModal,
    setIsOpenMessageUnSavedChanges,
    setIsOpenConfirmUnsavedChanges,
    setIsPrerequisitesUnsavedChanges,
    setIsCourseSettingsUnsavedChanges,
    setCurrentCourse,
    setCurrentClass,
    setShowArchiveModal,
  }
}
