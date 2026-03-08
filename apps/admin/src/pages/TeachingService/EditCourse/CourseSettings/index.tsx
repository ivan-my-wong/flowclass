import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import BoxWithToggleGroup from '@/components/ToggleGroup/BoxWithToggleGroup'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'
import { AssignFeeColumn } from '@/pages/Setting/AdditionalFee/AssignFee'

import EnrollmentFormList from '../ApplicationForm/EnrollmentFormList'
import Prerequisites from '../Prerequisites'

import CourseTags from './CourseTags'
import EmailSettings from './EmailSettings'
import PrivacySettings from './PrivacySettings'
import SEOSettings from './SEOSettings'

enum CourseSettingsSections {
  SEO = 'seo',
  PRE_REQUISITES = 'prerequisites',
  TAGS = 'tags',
  APPLICATION_FORM = 'applicationForm',
  ADDITIONAL_FEE = 'additionalFee',
  PRIVACY = 'privacy',
  EMAIL_SETTINGS = 'emailSettings',
}

const CourseSettings = ({
  tabName,
  allSaveMethods,
}: {
  tabName: string
  allSaveMethods: (tabName: string, saveMethod: () => Promise<void>) => void
}): React.ReactElement => {
  const { t } = useTranslation()
  const seoSettingsRef = useRef<any>(null)
  const prerequisitesRef = useRef<any>(null)
  const courseTagsRef = useRef<any>(null)
  const enrollmentFormRef = useRef<any>(null)
  const privacySettingsRef = useRef<any>(null)
  const emailSettingsRef = useRef<any>(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const panelParam = searchParams.get('panel')

  // Use panel param if present, otherwise fallback to label param, otherwise default
  const initialSection =
    (panelParam as CourseSettingsSections) ||
    CourseSettingsSections.APPLICATION_FORM

  const [currentSection, setCurrentSection] =
    useState<CourseSettingsSections>(initialSection)

  // When the panel changes, update the URL param
  const handleSetCurrentSection = (section: CourseSettingsSections) => {
    setCurrentSection(section)
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('panel', section)
      return newParams
    })
  }

  useEffect(() => {
    // If the panel param changes externally, update the state
    if (panelParam && panelParam !== currentSection) {
      setCurrentSection(panelParam as CourseSettingsSections)
    }
  }, [panelParam])

  const { setIsCourseSettingsUnsavedChanges } = useCourseEditSave()

  const handleSaveAll = useCallback(async () => {
    switch (currentSection) {
      case CourseSettingsSections.SEO:
        await seoSettingsRef.current?.submitForm()
        break
      case CourseSettingsSections.PRE_REQUISITES:
        await prerequisitesRef.current?.submitForm()
        break
      case CourseSettingsSections.TAGS:
        await courseTagsRef.current?.submitForm()
        break
      case CourseSettingsSections.APPLICATION_FORM:
        await enrollmentFormRef.current?.submitForm()
        break
      case CourseSettingsSections.PRIVACY:
        await privacySettingsRef.current?.submitForm()
        break
      case CourseSettingsSections.EMAIL_SETTINGS:
        await emailSettingsRef.current?.submitForm()
        break
      default:
        break
    }
    setIsCourseSettingsUnsavedChanges(false)
  }, [currentSection])

  useEffect(() => {
    allSaveMethods(tabName, handleSaveAll)
  }, [allSaveMethods, tabName, handleSaveAll])

  return (
    <div id={tabName}>
      <BoxWithToggleGroup
        title="Course Settings"
        toggleGroupLabels={[
          {
            label: t('teachingService:courseSettings.applicationForm'),
            value: CourseSettingsSections.APPLICATION_FORM,
          },
          {
            label: t('teachingService:courseSettings.additionalFee'),
            value: CourseSettingsSections.ADDITIONAL_FEE,
          },
          {
            label: t('teachingService:courseSettings.prerequisites'),
            value: CourseSettingsSections.PRE_REQUISITES,
          },
          {
            label: t('teachingService:courseSettings.privacy'),
            value: CourseSettingsSections.PRIVACY,
          },
          {
            label: t('teachingService:courseSettings.seo'),
            value: CourseSettingsSections.SEO,
          },
          {
            label: t('teachingService:courseSettings.tags'),
            value: CourseSettingsSections.TAGS,
          },
          {
            label: t('teachingService:courseSettings.emailSettings'),
            value: CourseSettingsSections.EMAIL_SETTINGS,
          },
        ]}
        currentSection={currentSection}
        setCurrentSection={handleSetCurrentSection}
      >
        {currentSection === CourseSettingsSections.SEO && (
          <SEOSettings ref={seoSettingsRef} />
        )}

        {currentSection === CourseSettingsSections.PRE_REQUISITES && (
          <Prerequisites ref={prerequisitesRef} />
        )}
        {currentSection === CourseSettingsSections.TAGS && (
          <CourseTags ref={courseTagsRef} />
        )}
        {currentSection === CourseSettingsSections.APPLICATION_FORM && (
          <EnrollmentFormList ref={enrollmentFormRef} />
        )}
        {currentSection === CourseSettingsSections.ADDITIONAL_FEE && (
          <AssignFeeColumn />
        )}
        {currentSection === CourseSettingsSections.PRIVACY && (
          <PrivacySettings ref={privacySettingsRef} />
        )}
        {currentSection === CourseSettingsSections.EMAIL_SETTINGS && (
          <EmailSettings ref={emailSettingsRef} />
        )}
      </BoxWithToggleGroup>
    </div>
  )
}

export default CourseSettings
