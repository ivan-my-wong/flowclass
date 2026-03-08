import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import UnsavedChangesButton from '@/components/Buttons/UnsavedChangesButton'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import TabWithListAndButton, {
  TabData,
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
  SET_IS_CONTACT_UNSAVED_CHANGES,
} from '@/reducers/edit-school.reducers'
import { schoolState } from '@/stores/schoolData'
import { School } from '@/types/school'
import { SocialMediaSetting } from '@/types/settingSocialMedia'

import AddSchoolModal from '../School/CreateSchoolModal'
import SchoolContactSetting from '../School/SchoolContactSetting'
import RegionLanguageSetting from '../Setting/Site/RegionLanguageSetting'
import SocialMediaPage from '../Setting/SocialMediaPage'

const ContactPage = (): JSX.Element => {
  const { useFetchCurrentSchool } = useSchoolData()
  const { t } = useTranslation()
  const [schoolRecoilState, setSchoolRecoilState] = useRecoilState(schoolState)

  const tabWithListAndButtonHandle = useRef<TabWithListAndButtonHandle>(null)
  const saveMethodsRef = useRef<
    Record<
      string,
      (
        data?: SocialMediaSetting[]
      ) => Promise<void | boolean | string | number | SocialMediaSetting[]>
    >
  >({})

  const [state, dispatch] = useReducer(editSchoolReducer, initialState)

  const setIsSaving = useCallback(
    (state: boolean) => {
      dispatch({ type: SET_IS_CONTACT_UNSAVED_CHANGES, payload: state })
    },
    [dispatch]
  )

  const {
    isContactUnsavedChanges,
    isRegionLanguageUnsavedChanges,
    isSaving,
    currentSchool,
  } = state

  const {
    data: newSchool,
    isError,
    isSuccess,
    isIdle,
    isFetching,
  } = useFetchCurrentSchool((newSchool: School): void => {
    if (!schoolRecoilState.currentSchool) {
      setSchoolRecoilState({ ...schoolRecoilState, currentSchool: newSchool })
    }
  })
  useEffect(() => {
    dispatch({
      type: SET_CURRENT_SCHOOL,
      currentSchool: newSchool as School,
    })
  }, [newSchool])
  const schoolTabsData: TabData[] = [
    {
      label: t(`school:tabBar.basic`),
      value: 'contact',
    },
    {
      label: t(`setting:menu.socialMedia`),
      value: 'social',
    },

    {
      label: t(`setting:webpageSetting.internationalization`),
      value: 'regionLanguage',
    },
  ]

  const hasUnsavedChanges = useMemo(() => {
    return isContactUnsavedChanges || isRegionLanguageUnsavedChanges
  }, [isContactUnsavedChanges, isRegionLanguageUnsavedChanges])

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
    (
      tabName: string,
      saveMethod: (data?: SocialMediaSetting[]) => Promise<void>
    ) => {
      saveMethodsRef.current[tabName] = saveMethod
    },
    []
  )

  return (
    <EditSchoolContext.Provider value={[state, dispatch]}>
      <ContentLayout
        leftHeader={
          <Heading>{t('school:contact.contactInformationTitle')}</Heading>
        }
        rightHeader={
          <UnsavedChangesButton
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            handleSave={handleSave}
          />
        }
      >
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
          <>
            <TabWithListAndButton
              ref={tabWithListAndButtonHandle}
              tabData={schoolTabsData}
            >
              <SchoolContactSetting
                tabName="contact"
                allSaveMethods={allSaveMethods}
              />

              {/* <EmailSetting tabName="email" allSaveMethods={allSaveMethods} /> */}

              <RegionLanguageSetting
                tabName="regionLanguage"
                allSaveMethods={allSaveMethods}
              />

              <SocialMediaPage
                tabName="social"
                allSaveMethods={allSaveMethods}
              />
            </TabWithListAndButton>
          </>
        )}
      </ContentLayout>
    </EditSchoolContext.Provider>
  )
}

export default ContactPage
