import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ColDef } from 'ag-grid-community'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import ApiError from '@/api/errors/apiError'
import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import { createWebpageStyle } from '@/api/settingSite'
import { setSiteIntlSettings } from '@/api/siteManagement'
import { getUserProfile } from '@/api/userProfile'
import AlertBox from '@/components/Boxes/AlertBox'
import Box from '@/components/Containers/Box'
import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import { Button } from '@/components/ui/Button'
import { countryConfig } from '@/constants/countryConfig'
import { QUERY_KEY } from '@/constants/queryKey'
import { defaultThemeColor } from '@/constants/websiteTemplate'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { userState } from '@/stores/userData'
import { InformationFieldTypes } from '@/types/applicationForm'
import { WebpageInstitutionSettingProps } from '@/types/settingWebpageInstitution'
import { ImportStudentResponse } from '@/types/student'
import { BulkAssignCourseType } from '@/types/studentAddTeachingService'

import { getImportResultTableColumns } from './ConfirmImport'

type TidiedImportResult = {
  userId: number
  userEmail: string
  userPhone: string
  userFirstName: string
} & Record<string, unknown>

const ImportResult = ({
  handleOpenChange,
  importResult,
  customDataFields,
  registerWithImportData,
  onImportSuccess,
}: {
  handleOpenChange: () => void
  importResult: ImportStudentResponse[]
  customDataFields: InformationFieldTypes[]
  registerWithImportData?: any
  onImportSuccess?: () => void
}): React.ReactElement => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [user, setUser] = useRecoilState(userState)

  const { currentSite } = useRecoilValue(siteState)
  const { currentSchool } = useRecoilValue(schoolState)

  const [studentData, setStudentData] = useRecoilState(studentState)
  const [tidiedImportResult, setTidiedImportResult] = useState<
    TidiedImportResult[]
  >([])

  useEffect(() => {
    const tidiedImportResult = importResult
      ?.filter(result => result)
      .map(result => {
        const customFieldObject: { [key: string]: any } = {}
        result?.customFields?.forEach(field => {
          customFieldObject[field.id] = field.value
        })

        return {
          userId: result.user.id,
          userEmail: result.user.email,
          userPhone: result.user.phone,
          userFirstName: result.user.firstName,
          ...customFieldObject,
        }
      })

    setTidiedImportResult(tidiedImportResult)
  }, [importResult])

  // Table columns logic (match ConfirmImport)
  const quickFilterTableRef = useRef<any>(null)

  // Compose custom fields header
  const studentFormCustomFields = tidiedImportResult.map(student => {
    const { userId, userEmail, userPhone, userFirstName, ...customFields } =
      student
    return customFields
  })
  const studentFormCustomFieldsHeader =
    studentFormCustomFields?.length > 0
      ? Object.keys(studentFormCustomFields[0])
      : []

  // Instead of local fieldsChecking/tableColumns, use the shared function
  const tableColumns: ColDef[] = getImportResultTableColumns({
    t,
    tidiedImportResult,
    customDataFields,
  })

  const { mutateAsync: createInstituionSetting } = useMutation<
    WebpageInstitutionSettingProps,
    ApiError,
    any
  >(
    (data: { institutionId: number; templates: string }) => {
      return createWebpageStyle(data.institutionId, {
        templates: data.templates,
        themeColor: defaultThemeColor,
      })
    },
    {
      onSuccess: async (data: WebpageInstitutionSettingProps) => {
        toast.success(t('onboarding:welcome.themeSettingComplete'))
        return data
      },

      onError: (_error: ApiError) => {
        toast.error(t('common:errors.network'))
      },
    }
  )

  const continueBulkAssignCourse = () => {
    const bulkAssignCourse: BulkAssignCourseType[] = importResult.map(
      result => ({
        userAliasId: result.userAlias.id,
        email: result.user.email,
        phone: result.user.phone,
        name: result.user.firstName,
      })
    )

    setStudentData(prev => ({
      ...prev,
      currentEnrolId: null,
      tableDrawers: {
        ...studentData.tableDrawers,
        isOpenAssignCourse: true,
        bulkAssignCourse,
        assignCourseMode: AddTeachingServiceMode.addCourseDirectly,
      },
    }))

    handleOpenChange()
  }

  const { mutateAsync: submitSiteSettings } = useMutation(
    (data: {
      language: string
      timeZone: string
      currency: string
      country: string
      siteId: number
      countryCode: string
    }) => {
      return setSiteIntlSettings({
        language: data.language,
        timeZone: data.timeZone,
        currency: data.currency,
        country: data.country,
        siteId: data.siteId,
        countryCode: data.countryCode,
      })
    },
    {
      onError: (error: ApiError) => {
        if (error.statusCode === 400) {
          toast.error(t('onboarding:errors.setSiteError'))
        } else if (error.statusCode === 403) {
          toast.error(t('common:errors.NOT_AUTHENTICATE'))
        } else if (error.statusCode === 422 || error.statusCode === 500) {
          toast.error(error.message)
        } else {
          toast.error(t('common:errors.network'))
        }
      },
    }
  )

  // Helper to close and refresh
  const handleCloseAndRefresh = async () => {
    handleOpenChange()
    await queryClient.invalidateQueries([
      QUERY_KEY.student.studentListNewKey,
      currentSchool?.id,
    ])
  }

  const finishRegistration = async () => {
    if (registerWithImportData) {
      await createInstituionSetting({
        institutionId: currentSchool?.id,
        templates: registerWithImportData.selectedWebsiteTemplate,
        themeColor: defaultThemeColor,
      })
      const selectedIndex = registerWithImportData.selectedCountryOption.index

      await submitSiteSettings({
        language: countryConfig[selectedIndex].locale.default.code,
        timeZone: countryConfig[selectedIndex].timezone.default.name,
        currency: countryConfig[selectedIndex].currency,
        country: registerWithImportData.selectedCountryOption.name,
        siteId: currentSite?.id ?? -1,
        countryCode: registerWithImportData.selectedCountryOption.code,
      })

      const resUser = await getUserProfile()

      if (resUser) {
        setUser({ ...resUser, isLogin: true })
      }
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.site.siteDataKey],
        }),
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.site.getCurrentSchoolKey],
        }),
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.site.getCurrentSchoolsSiteKey],
        }),
        // Revalidate the plan and quotas
        await queryClient.invalidateQueries([
          QUERY_KEY.plans.getPlanAndQuotasKey,
        ]),
      ])

      setGtmEvent({
        siteId: currentSite?.id,
        siteDomain: registerWithImportData.url,
        firstName: resUser.firstName ?? '',
        lastName: resUser.lastName ?? '',
        email: resUser.email,
        countryCode: registerWithImportData.selectedCountryOption.code,
        event: GtmEvent.createSite,
      })

      handleOpenChange()

      await queryClient.invalidateQueries([
        QUERY_KEY.student.studentListNewKey,
        currentSchool?.id,
      ])

      onImportSuccess?.()

      toast.success(t('onboarding:welcome.setupComplete'))
    }
  }

  return (
    <Box direction="column">
      <AlertBox
        status="success"
        content={t('student:importCsv.importCsvSuccessfully') as string}
      />
      <QuickFilterTable
        rowData={tidiedImportResult}
        columns={tableColumns}
        gridRef={quickFilterTableRef}
      />
      <div className="h-24" />
      <Box align="center" css={{ width: '100%' }}>
        {registerWithImportData ? (
          <>
            <Button onClick={finishRegistration}>
              {t('login:register:continue')}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleCloseAndRefresh}
              variant="destructive-outline"
            >
              {t('common:action:close')}
            </Button>
            {!registerWithImportData && (
              <Button
                onClick={async () => {
                  await handleCloseAndRefresh()
                  continueBulkAssignCourse()
                }}
              >
                {t('student:importCsv.steps.stepFive')}
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}

export default ImportResult
