import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import UnsavedChangesButton from '@/components/Buttons/UnsavedChangesButton'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import TabWithListAndButton, {
  TabWithListAndButtonHandle,
} from '@/components/TabWithListAndButton/TabWithListAndButton'
import Heading from '@/components/Texts/Heading'
import EditSchoolContext from '@/contexts/EditSchoolContext'
import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'
import {
  editSchoolReducer,
  initialState,
  SET_CURRENT_SCHOOL,
  SET_IS_SAVING,
} from '@/reducers/edit-school.reducers'
import { schoolState } from '@/stores/schoolData'
import { School } from '@/types/school'

import TermsConditions from '../Setting/TermsConditions'

import Basic from './Basic'
import AddSchoolModal from './CreateSchoolModal'
import Description from './Description'
import Gallery from './Gallery'
import SchoolSettings from './SchoolSettings'

const defaultSectionValue = '<p><br></p>'

const isSchoolNotHaveDescription = (currentSchool?: School): boolean => {
  if (!currentSchool || !currentSchool.description) {
    return true
  }

  return currentSchool.description.every(
    item => item.content === '' || item.content === defaultSectionValue
  )
}

const SchoolPage = (): JSX.Element => {
  const { useFetchCurrentSchool, currentSchool } = useSchoolData()
  const { t } = useTranslation()
  const tabWithListAndButtonHandle = useRef<TabWithListAndButtonHandle>(null)

  const [state, dispatch] = useReducer(editSchoolReducer, initialState)

  const setIsSaving = useCallback(
    (state: boolean) => {
      dispatch({ type: SET_IS_SAVING, payload: state })
    },
    [dispatch]
  )

  // const floatingButtonHandle = useRef<FloatingButtonHandle>(null)
  const [schoolRecoilState, setSchoolRecoilState] = useRecoilState(schoolState)
  const { isUnsavedChanges, isSaving, isStyleUnsavedChanges } = state
  const saveMethodsRef = useRef<Record<string, () => Promise<void>>>({})

  const basicInfoEmpty = (): boolean => {
    return currentSchool?.name === '' || currentSchool?.url === ''
  }

  const { isError, isSuccess, isIdle, isFetching, refetch } =
    useFetchCurrentSchool((newSchool: School) => {
      if (!schoolRecoilState.currentSchool) {
        dispatch({
          type: SET_CURRENT_SCHOOL,
          currentSchool: newSchool as School,
        })
        setSchoolRecoilState({ ...schoolRecoilState, currentSchool: newSchool })
      } else {
        dispatch({
          type: SET_CURRENT_SCHOOL,
          currentSchool: schoolRecoilState.currentSchool as School,
        })
      }
    })

  useEffect(() => {
    refetch()
  }, [])

  const hasUnsavedChanges = useMemo(() => {
    return isUnsavedChanges || isStyleUnsavedChanges
  }, [isUnsavedChanges, isStyleUnsavedChanges])

  const handleSave = useCallback(async () => {
    const activeTab = tabWithListAndButtonHandle.current?.getCurrentTab()

    if (!activeTab || !saveMethodsRef.current[activeTab]) return
    setIsSaving(true)

    try {
      await saveMethodsRef.current[activeTab]?.()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }, [setIsSaving])

  const allSaveMethods = useCallback(
    (tabName: string, saveMethod: () => Promise<void>) => {
      saveMethodsRef.current[tabName] = saveMethod
    },
    []
  )

  return (
    <EditSchoolContext.Provider value={[state, dispatch]}>
      {isIdle && (
        <FullScreenAlertBox
          text={t(`teachingService:noSchool`)}
          content={<AddSchoolModal />}
        />
      )}
      {isFetching && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess && currentSchool && (
        <ContentLayout
          leftHeader={<Heading>{t('component:menubar.homepage')}</Heading>}
          rightHeader={
            <UnsavedChangesButton
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              handleSave={handleSave}
            />
          }
        >
          <TabWithListAndButton
            ref={tabWithListAndButtonHandle}
            tabData={[
              {
                label: t(`school:tabBar.basic`),
                value: 'basic',
                status: basicInfoEmpty() ? 'error' : 'normal',
              },
              {
                label: t(`school:tabBar.description`),
                value: 'description',
                status: isSchoolNotHaveDescription(currentSchool)
                  ? 'error'
                  : 'normal',
              },
              // {
              //   label: t(`school:tabBar.contact`),
              //   value: 'contact',
              //   status: checkSchoolContact() === 0 ? 'error' : 'normal',
              // },
              {
                label: t(`school:tabBar.gallery`),
                value: 'gallery',
              },
              {
                label: t(`school:tabBar.terms`),
                value: 'terms',
              },

              {
                label: t(`school:tabBar.settings`),
                value: 'settings',
              },
            ]}
          >
            <Basic tabName="basic" allSaveMethods={allSaveMethods} />
            <Description
              tabName="description"
              allSaveMethods={allSaveMethods}
            />
            {/* <Contact
              tabName="contact"
              currentSchool={currentSchool}
              setCurrentSchool={setCurrentSchool}
            /> */}
            <Gallery tabName="gallery" allSaveMethods={allSaveMethods} />
            <SchoolSettings
              tabName="settings"
              allSaveMethods={allSaveMethods}
            />
            <TermsConditions tabName="terms" allSaveMethods={allSaveMethods} />
          </TabWithListAndButton>
        </ContentLayout>
      )}
    </EditSchoolContext.Provider>
  )
}

export default SchoolPage
