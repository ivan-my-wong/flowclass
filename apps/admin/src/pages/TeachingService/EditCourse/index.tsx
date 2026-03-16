/* eslint-disable no-underscore-dangle */
import { ChangeEvent, useCallback, useMemo, useReducer, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import { FloatingButtonHandle } from '@/components/Buttons/FloatingButton'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import TabWithListAndButton, {
  TabData,
  TabWithListAndButtonHandle,
} from '@/components/TabWithListAndButton/TabWithListAndButton'
import { Button } from '@/components/ui/Button'
import EditCourseContext from '@/contexts/EditCourseContext'
import useCourseData from '@/hooks/useCourseData'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import {
  editCourseReducer,
  initialState,
  SET_CURRENT_COURSE,
  SET_IS_SAVING,
  SET_SHOW_ARCHIVE_MODAL,
  SET_SHOW_LEAVE_EDIT_WITHOUT_SAVE,
} from '@/reducers/edit-course.reducers'
import { courseState } from '@/stores/courseData'
import { Course } from '@/types/course'

import EnrollmentFormList from './ApplicationForm/EnrollmentFormList'
import Basic from './Basic'
import Class from './Class'
import CourseSettings from './CourseSettings'
import Message from './Message'
import CoursePageContent from './PageContent'

// Hook to handle course publishing
const usePublishCourseHandlingDeprecated = (
  editCourseState: any,
  dispatch: any,
  courseRecoilState: any,
  setCourseRecoilState: any
) => {
  const handlePublishCourse = useCallback(
    (archive: boolean): void => {
      const { currentCourse } = courseRecoilState
      if (currentCourse) {
        const updatedCourse = { ...currentCourse, isArchived: archive }
        setCourseRecoilState(
          (prevState: {
            currentCourse: Course | null
            courses?: Course[]
          }) => ({
            ...prevState,
            currentCourse: updatedCourse,
            courses: (prevState.courses ?? []).map(c =>
              c.id === updatedCourse.id ? updatedCourse : c
            ),
          })
        )
        dispatch({
          type: SET_CURRENT_COURSE,
          currentCourse: updatedCourse as Course,
        })

        if (archive) {
          setGtmEvent({
            courseId: currentCourse.id,
            event: GtmEvent.updateCoursePublish,
          })
        }
      }
    },
    [courseRecoilState, setCourseRecoilState]
  )

  return { handlePublishCourse }
}

const useArchiveCourseHandling = (
  editCourseState: any,
  dispatch: any,
  courseRecoilState: any,
  setCourseRecoilState: any
) => {
  const handleArchiveCourse = useCallback(
    (archive: boolean): void => {
      const { currentCourse } = courseRecoilState
      if (currentCourse) {
        const updatedCourse = { ...currentCourse, isArchived: archive }
        setCourseRecoilState((prevState: { currentCourse: Course | null }) => ({
          ...prevState,
          currentCourse: updatedCourse,
        }))
        if (archive) {
          setGtmEvent({
            courseId: currentCourse.id,
            event: GtmEvent.updateCoursePublish,
          })
        }
      }
    },
    [courseRecoilState, setCourseRecoilState]
  )

  return { handleArchiveCourse }
}

// Hook to handle saving
const useSaveHandling = (
  setIsSaving: any,
  tabWithListAndButtonHandle: any,
  saveMethodsRef: any
) => {
  const handleSave = useCallback(async () => {
    const activeTab = tabWithListAndButtonHandle.current?.getCurrentTab()

    if (!activeTab || !saveMethodsRef.current[activeTab]) return
    setIsSaving(true)
    await saveMethodsRef.current[activeTab]?.(saveMethodsRef)
    setIsSaving(false)
  }, [setIsSaving, tabWithListAndButtonHandle, saveMethodsRef])

  const allSaveMethods = useCallback(
    (tabName: string, saveMethod: () => Promise<void>) => {
      // eslint-disable-next-line no-param-reassign
      saveMethodsRef.current[tabName] = saveMethod
    },
    []
  )

  return { handleSave, allSaveMethods }
}

// Hook to handle tab data
const useTabData = (t: any) => {
  const tabsData: TabData[] = useMemo(
    () => [
      {
        label: t(`teachingService:tabBar.basic`),
        value: 'basic',
      },
      {
        label: t(`teachingService:tabBar.class`),
        value: 'class',
      },
      {
        label: t(`teachingService:tabBar.description`),
        value: 'description',
      },
      {
        label: t(`teachingService:tabBar.message`),
        value: 'message',
      },
      {
        label: t(`teachingService:tabBar.settings`),
        value: 'settings',
      },
    ],
    [t]
  )

  return { tabsData }
}

const EditCourse = (): JSX.Element => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'basic'

  const navigate = useNavigate()

  const {
    courseData,
    useFetchCurrentCourse,
    useArchiveCourse,
    useUnArchiveCourse,
  } = useCourseData()

  const [editCourseState, dispatch] = useReducer(
    editCourseReducer,
    initialState
  )
  const [courseRecoilState, setCourseRecoilState] = useRecoilState(courseState)

  const floatingButtonHandle = useRef<FloatingButtonHandle>(null)
  const tabWithListAndButtonHandle = useRef<TabWithListAndButtonHandle>(null)
  const saveMethodsRef = useRef<{ [key: string]: () => Promise<void> }>({})

  const setIsSaving = useCallback(
    (state: boolean) => {
      dispatch({ type: SET_IS_SAVING, payload: state })
    },
    [dispatch]
  )

  const { handleArchiveCourse } = useArchiveCourseHandling(
    editCourseState,
    dispatch,
    courseRecoilState,
    setCourseRecoilState
  )

  const { handleSave, allSaveMethods } = useSaveHandling(
    setIsSaving,
    tabWithListAndButtonHandle,
    saveMethodsRef
  )
  const { tabsData } = useTabData(t)

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const { id, value } = event.target
      dispatch({
        type: SET_CURRENT_COURSE,
        currentCourse: {
          ...editCourseState.currentCourse,
          [id]: value,
        } as Course,
      })
    },
    [dispatch, editCourseState.currentCourse]
  )

  const { isLoading, isError, isSuccess, isIdle } = useFetchCurrentCourse(
    useCallback(
      (newCourse: Course | null) => {
        if (!newCourse) return
        dispatch({
          type: SET_CURRENT_COURSE,
          currentCourse: newCourse,
        })
      },
      [dispatch]
    )
  )

  const archiveCourseResult = useArchiveCourse(() => handleArchiveCourse(true))
  const unArchiveCourseResult = useUnArchiveCourse(() =>
    handleArchiveCourse(false)
  )

  const hasUnsavedChanges = useMemo(() => {
    const {
      isUnsavedChanges,
      isOpenConfirmUnSaveChange,
      isOpenMessageUnSavedChanges,
      isPrerequisitesUnSaveChange,
      isCourseSettingsUnsavedChanges,
    } = editCourseState

    return (
      isUnsavedChanges ||
      isOpenConfirmUnSaveChange ||
      isOpenMessageUnSavedChanges ||
      isPrerequisitesUnSaveChange ||
      isCourseSettingsUnsavedChanges
    )
  }, [editCourseState])

  const handleLeaveEditCourseCheck = useCallback(() => {
    if (hasUnsavedChanges) {
      dispatch({
        type: SET_SHOW_LEAVE_EDIT_WITHOUT_SAVE,
        payload: true,
      })
    } else {
      navigate('/teaching-service')
    }
  }, [dispatch, hasUnsavedChanges, navigate])

  const headerBackButton: HeaderBackButtonStatus = useMemo(
    () => ({
      title: t(`teachingService:allCourses`),
      mode: 'backWithWords',
      action: handleLeaveEditCourseCheck,
    }),
    [t, handleLeaveEditCourseCheck]
  )

  return (
    <EditCourseContext.Provider value={[editCourseState, dispatch]}>
      <ContentLayout
        headerBackButton={headerBackButton}
        rightHeader={
          <div className="box-row-full">
            {editCourseState.currentCourse && (
              <>
                <div className="flex justify-end items-center gap-2 text-gray-600">
                  {hasUnsavedChanges && (
                    <span className="text-sm flex-nowrap">
                      *{t('school:haveUnSavedChanges')}
                    </span>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || editCourseState.isSaving}
                    data-testid="save-changes-btn"
                    loading={editCourseState.isSaving}
                  >
                    {t('school:saveSchool')}
                  </Button>
                </div>
              </>
            )}

            <CustomedAlertDialog
              open={editCourseState.showArchiveModal}
              setOpen={value =>
                dispatch({
                  type: SET_SHOW_ARCHIVE_MODAL,
                  payload: value,
                })
              }
              alertType={AlertTypes.CONFIRM}
              description={
                editCourseState.currentCourse?.isArchived
                  ? t(
                      'teachingService:publishCourse.unarchiveCourseDescription'
                    )
                  : t('teachingService:publishCourse.archiveCourseDescription')
              }
              title={
                editCourseState.currentCourse?.isArchived
                  ? t('teachingService:publishCourse.unarchiveCourseTitle')
                  : t('teachingService:publishCourse.archiveCourseTitle')
              }
              cancelText={t('teachingService:createCourseModal.cancel')}
              actionText={t('teachingService:session.confirm')}
              onActionClick={() => {
                if (!editCourseState.currentCourse?.id) return

                if (editCourseState.currentCourse?.isArchived) {
                  unArchiveCourseResult.mutate(
                    editCourseState.currentCourse?.id
                  )
                } else {
                  archiveCourseResult.mutate(editCourseState.currentCourse?.id)
                }
                dispatch({ type: SET_SHOW_ARCHIVE_MODAL, payload: false })
                dispatch({
                  type: SET_CURRENT_COURSE,
                  currentCourse: {
                    ...editCourseState.currentCourse,
                    isArchived: !editCourseState.currentCourse.isArchived,
                  },
                })
              }}
            />
            <CustomedAlertDialog
              open={editCourseState.showLeaveEditWithoutSave}
              setOpen={(value: boolean) =>
                dispatch({
                  type: SET_SHOW_LEAVE_EDIT_WITHOUT_SAVE,
                  payload: value,
                })
              }
              alertType={AlertTypes.WARN}
              description={t('school:alertmsg.leaveWithoutSaved')}
              title={t('school:alertmsg.haveUnSavedChanges')}
              cancelText={t('common:action.cancel')}
              actionText={t('common:action.confirm')}
              onActionClick={() => navigate('/teaching-service')}
            />
          </div>
        }
      >
        {isIdle && <FullScreenAlertBox text={t(`teachingService:noCourse`)} />}
        {isLoading && <FullScreenLoading />}
        {isError && (
          <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
        )}
        {isSuccess &&
          courseRecoilState.currentCourse &&
          Object.keys(courseRecoilState.currentCourse).length > 0 && (
            <>
              <TabWithListAndButton
                ref={tabWithListAndButtonHandle}
                tabData={tabsData}
                defaultValue={activeTab}
              >
                <Basic
                  tabName="basic"
                  handleChange={handleChange}
                  allSaveMethods={allSaveMethods}
                />
                <CoursePageContent
                  tabName="description"
                  allSaveMethods={allSaveMethods}
                />
                <Class tabName="class" allSaveMethods={allSaveMethods} />
                <Message tabName="message" allSaveMethods={allSaveMethods} />
                <EnrollmentFormList
                  tabName="enrollment"
                  allSaveMethods={allSaveMethods}
                />
                <CourseSettings
                  tabName="settings"
                  allSaveMethods={allSaveMethods}
                />
              </TabWithListAndButton>
            </>
          )}
      </ContentLayout>
    </EditCourseContext.Provider>
  )
}

export default EditCourse
