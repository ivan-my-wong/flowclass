/* eslint-disable import/prefer-default-export */
import { useContext } from 'react'

import EditSchoolContext from '@/contexts/EditSchoolContext'
import {
  SET_CURRENT_SCHOOL,
  SET_IS_CONTACT_UNSAVED_CHANGES,
  SET_IS_REGION_LANGUAGE_UNSAVED_CHANGES,
  SET_IS_SAVING,
  SET_IS_STYLE_UNSAVED_CHANGES,
  SET_IS_UNSAVED_CHANGES,
} from '@/reducers/edit-school.reducers'
import { School } from '@/types/school'

export const useSchoolEditSave = () => {
  const [editSchoolState, dispatch] = useContext(EditSchoolContext)

  const setIsSaving = (state: boolean) => {
    dispatch({ type: SET_IS_SAVING, payload: state })
  }

  const setIsUnsavedChanges = (state: boolean) => {
    dispatch({ type: SET_IS_UNSAVED_CHANGES, payload: state })
  }

  const setIsStyleUnsavedChanges = (state: boolean) => {
    dispatch({ type: SET_IS_STYLE_UNSAVED_CHANGES, payload: state })
  }

  const setCurrentSchool = (school: School | null | undefined) => {
    dispatch({ type: SET_CURRENT_SCHOOL, currentSchool: school })
  }

  const setIsContactUnsavedChanges = (state: boolean) => {
    dispatch({ type: SET_IS_CONTACT_UNSAVED_CHANGES, payload: state })
  }

  const setIsRegionLanguageUnsavedChanges = (state: boolean) => {
    dispatch({ type: SET_IS_REGION_LANGUAGE_UNSAVED_CHANGES, payload: state })
  }

  return {
    ...editSchoolState,
    setIsSaving,
    setIsUnsavedChanges,
    setIsStyleUnsavedChanges,
    currentSchool: editSchoolState.currentSchool,
    setCurrentSchool,
    setIsContactUnsavedChanges,
    setIsRegionLanguageUnsavedChanges,
  }
}
