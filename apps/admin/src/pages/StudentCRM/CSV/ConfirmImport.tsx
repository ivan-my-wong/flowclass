import { useEffect, useMemo, useRef, useState } from 'react'

import { ColDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { LuCheck } from 'react-icons/lu'
import { MdOutlineError } from 'react-icons/md'
import { useMutation, useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { createSite } from '@/api/siteManagement'
import { importStudent } from '@/api/student'
import { getUserProfile } from '@/api/userProfile'
import AlertBox from '@/components/Boxes/AlertBox'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import TextInput from '@/components/Inputs/TextInput'
import RadioCardGroup from '@/components/RadioGroup/RadioCardGroup'
import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { ImportRequiredFieldsV2 } from '@/constants/common'
import { FieldTypes } from '@/constants/enrollmentFormFieldNames'
import welcomeOptions from '@/constants/onboarding/welcomeOptions'
import { QUERY_KEY } from '@/constants/queryKey'
import usePayoutData from '@/hooks/usePayoutData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import { RegisterSiteResponse } from '@/stores/siteData'
import { userState } from '@/stores/userData'
import { userPermissionState } from '@/stores/userPermissionData'
import { InformationFieldTypes } from '@/types/applicationForm'
import { Payout, PayoutMethodType } from '@/types/payout'
import {
  ChargeFrequency,
  ImportResultDatabaseResponseDto,
  ImportStudentResponse,
  TypeParamsImportStudent,
} from '@/types/student'
import { getUserRoleFromArray } from '@/utils/convert'
import { formatPhoneNumber } from '@/utils/misc'
import { getFormatDate } from '@/utils/timeFormat'

const ConfirmImport = ({
  importValidationResult,
  setStep,
  institutionId,
  siteId,
  registerWithImportData,
  dataChargeFrequencyExist,
  customDataFields,
  setImportResult,
  showBillingDateSetting,
}: {
  importValidationResult: ImportResultDatabaseResponseDto[]
  setStep: (val: number) => void
  institutionId?: number
  siteId?: number
  dataChargeFrequencyExist: boolean
  customDataFields: InformationFieldTypes[]
  registerWithImportData?: any
  setImportResult: (val: any) => void
  showBillingDateSetting: boolean | undefined
}): React.ReactElement => {
  const { register, getValues } = useForm()
  // Dummy ref for QuickFilterTable
  const quickFilterTableRef = useRef<AgGridReact>(null)
  const [importedLength, setImportedLength] = useState<number>(0)

  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { siteData, updateCurrentSite } = useSiteData()

  // Filter out completely empty rows (where all required fields are empty)
  const filteredImportValidationResult = useMemo(() => {
    return importValidationResult.filter(row => {
      const hasName = row.StudentName && row.StudentName.trim() !== ''
      const hasPhone = row.StudentPhone && row.StudentPhone.trim() !== ''
      const hasEmail = row.StudentEmail && row.StudentEmail.trim() !== ''
      // Keep the row if at least one required field has a value
      return hasName || hasPhone || hasEmail
    })
  }, [importValidationResult])

  const isAllErrorsAbsentOrEmpty = filteredImportValidationResult?.every(
    res => !res.importError || res.importError.length === 0
  )

  const { billDateOptions } = welcomeOptions(t)

  const [handleDataMethod, setHandleDataMethod] = useState<string | undefined>(
    undefined
  )
  const [chargeFrequency, setChargeFrequency] = useState<ChargeFrequency>(
    ChargeFrequency.monthly
  )
  const [subStep, setSubStep] = useState<number>(0)
  const [, setUserPermission] = useRecoilState(userPermissionState)
  const { updateCurrentSchool } = useSchoolData()
  const [user, setUser] = useRecoilState(userState)
  const { useCreatePayoutMethod } = usePayoutData()
  const { mutate: createPayout } = useCreatePayoutMethod()
  const [billingStartDate, setBillingStartDate] = useState<Date>(new Date())
  const [billingDateSetting, setBillingDateSetting] =
    useState('sameBillingDate')

  const mutationImportStudent = useMutation({
    mutationFn: (params: TypeParamsImportStudent) => importStudent(params),
    onSuccess: async (data: any) => {
      await queryClient.invalidateQueries([
        QUERY_KEY.student.studentListKey,
        institutionId,
      ]) // call API get list
      await queryClient.invalidateQueries(QUERY_KEY.student.studentListBinKey)
      return data
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  // For import loading notice
  const [showImportNotice, setShowImportNotice] = useState(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (mutationImportStudent.isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        setShowImportNotice(true)
      }, 10000)
    } else {
      setShowImportNotice(false)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [mutationImportStudent.isLoading])

  const studentFormCustomFields = filteredImportValidationResult.map(
    student => {
      const {
        dataFoundInDb,
        StudentEmail,
        StudentName,
        StudentPhone,
        importError,
        ...customFields
      } = student
      return customFields
    }
  )

  const studentFormCustomFieldsHeader =
    studentFormCustomFields?.length > 0
      ? Object.keys(studentFormCustomFields[0])
      : []

  const fieldsChecking = [
    {
      field: 'importError',
      filter: true,
      headerName: t('student:importCsv.error'),
      width: 120,
      cellRenderer: (data: any) => {
        if (data.value.length === 0) {
          return (
            <div className="flex h-full items-center gap-2">
              <LuCheck className="text-success" />
              <p>{t('student:importCsv.noErrorRow')}</p>
            </div>
          )
        }
        return (
          <>
            {data.value.map((value: string) => (
              <Text className="text-warn" key={value}>
                {value}
              </Text>
            ))}
          </>
        )
      },
    },
    {
      field: ImportRequiredFieldsV2.studentName,
    },
    {
      field: ImportRequiredFieldsV2.studentEmail,
      cellStyle: (params: any) => {
        const studentObj = filteredImportValidationResult.find(
          student => student.StudentEmail === params.value
        )
        if (studentObj) {
          const isNameEqualEmail =
            studentObj.dataFoundInDb.studentEmail === studentObj.StudentEmail
          if (isNameEqualEmail) {
            return { color: 'var(--color-warn)' }
          }
          return null
        }

        return null
      },
    },
    {
      field: ImportRequiredFieldsV2.studentPhone,
      cellStyle: (params: any) => {
        const studentObj = filteredImportValidationResult.find(
          student => student.StudentPhone === params.value
        )
        if (studentObj) {
          const isNameEqualPhone =
            studentObj.dataFoundInDb.studentPhone === studentObj.StudentPhone
          if (isNameEqualPhone) {
            return { color: 'var(--color-warn)' }
          }
        }
        return null
      },
      cellRenderer: (params: any) => {
        if (params.value) {
          return formatPhoneNumber(params.value.toString())
        }
        return params.value
      },
    },
    ...studentFormCustomFieldsHeader.map(field => {
      const customField = customDataFields?.find(
        customField => customField.id === Number(field)
      )

      return {
        field,
        headerName:
          customField?.question ?? t(`student:importCsv.fields.${field}`),
        cellRenderer: (params: any) => {
          if (customField?.type === FieldTypes.PHONE && params.value) {
            return formatPhoneNumber(params.value.toString())
          }
          if (customField?.type === FieldTypes.MULTIPLE_CHOICE) {
            return params.value.map((value: string) => {
              return <Text key={value}>{value}</Text>
            })
          }
          return params.value
        },
      }
    }),
  ]

  const tableColumns: ColDef[] = fieldsChecking.map(field => ({
    ...field,
    headerName:
      typeof field.headerName === 'string'
        ? field.headerName
        : (t(`student:importCsv.fields.${field.field}`) as string),
  }))

  const { mutateAsync: createNewSite } = useMutation<
    RegisterSiteResponse,
    ApiError,
    any
  >(
    (data: { url: string; name: string }) => {
      return createSite({ url: data.url, name: data.name })
    },
    {
      onSuccess: async (data: RegisterSiteResponse) => {
        // toast.success(t('onboarding:welcome.siteCreated'))

        return data
      },
      onError: (error: ApiError) => {
        switch (error.statusCode) {
          case 400:
            toast.error(t('onboarding:errors.domainAlreadyExist'))
            break
          case 403:
            toast.error(t('common:errors.NOT_AUTHENTICATE'))
            break
          case 422:
          case 500:
            toast.error(t('onboarding:errors.invalidDomain'))
            break
          default:
            toast.error(t('common:errors.network'))
            break
        }
      },
    }
  )

  const onSubmit = async () => {
    let createInstitutionId = institutionId
    let createSiteId = siteId
    let importData = filteredImportValidationResult

    if (registerWithImportData) {
      if (siteData && siteData.sites && siteData.sites.length === 0) {
        const newSiteWithSchool = await createNewSite({
          url: registerWithImportData.url,
          name: registerWithImportData.schoolName,
        })
        const { institution: school, ...newSite } = newSiteWithSchool
        createInstitutionId = school.id
        createSiteId = newSite.id
        await updateCurrentSite(newSite)
        await updateCurrentSchool(school)

        const resUser = await getUserProfile()

        if (resUser) {
          // setUser({ ...resUser, isLogin: true })

          await setUserPermission(
            getUserRoleFromArray(user.permissions, newSite.id, school.id)
          )
        }

        if (registerWithImportData.payoutMethodName !== '') {
          const newPayout = {
            siteId: newSite?.id ?? 0,
            methodType: PayoutMethodType.others,
            methodName: registerWithImportData.payoutMethodName,
            institutionId: school?.id ?? 0,
            description: registerWithImportData.payoutDescription,
            enable: true,
            payoutMethodDetails: registerWithImportData.payoutMethodDetails,
          } as unknown as Payout
          //
          createPayout(newPayout)
        }
      }

      if (billingDateSetting === 'sameBillingDate' && showBillingDateSetting) {
        importData = filteredImportValidationResult.map(student => ({
          ...student,
          CourseName: getValues('billingCycleName') ?? 'billing cycle',
          ClassName: '1',
          AmountCharged: getValues('billingAmount'),
          ChargeFrequency: chargeFrequency,
          FirstChargeDate: getFormatDate(billingStartDate),
        }))
      }
    }

    const finishedData: ImportStudentResponse[] = []

    if (importData.length > 100) {
      for (let i = 0; i < importData.length; i += 100) {
        const params = {
          institutionId: createInstitutionId ?? -1,
          siteId: createSiteId ?? -1,
          convertedData: importData.slice(i, i + 100),
          handleDataMethod,
        }
        const res = await mutationImportStudent.mutateAsync(params)
        finishedData.push(...res)
        setImportedLength(prev => prev + 100)
      }
    } else {
      const params = {
        institutionId: createInstitutionId ?? -1,
        siteId: createSiteId ?? -1,
        convertedData: importData,
        handleDataMethod,
      }

      const res = await mutationImportStudent.mutateAsync(params)
      finishedData.push(...res)
      setImportedLength(prev => prev + importData.length)
    }

    toast.success(`${importData.length} ${t('student:importCsv.record')} `)

    setImportResult(finishedData)

    setStep(((prevStep: number) => prevStep + 1) as unknown as number)
  }

  const importDataOptions = [
    {
      value: 'overwrite',
      label: t('student:importCsv.importDataOptions.overwrite') as string,
      dataTestId: 'import-data-option-overwrite',
    },
    {
      value: 'keepOriginalData',
      label: t(
        'student:importCsv.importDataOptions.keepOriginalData'
      ) as string,
      dataTestId: 'import-data-option-keepOriginalData',
    },
    {
      value: 'skipErrorData',
      label: t('student:importCsv.importDataOptions.skipErrorData') as string,
      dataTestId: 'import-data-option-skipErrorData',
    },
  ]

  const isQuotaExceeded = false

  const CheckImportResult = () => {
    return (
      <>
        {!isAllErrorsAbsentOrEmpty || isQuotaExceeded ? (
          <AlertBox
            icon={
              <span className="text-warn">
                <MdOutlineError size="24px" color="currentColor" />
              </span>
            }
            content={t(
              isQuotaExceeded
                ? 'student:importCsv.quotaExceeded'
                : 'student:importCsv.problemsExist'
            )}
            className="font-medium"
          />
        ) : (
          <AlertBox
            icon={
              <span className="text-success">
                <IoIosCheckmarkCircle size="24px" color="currentColor" />
              </span>
            }
            content={t('student:importCsv.noError')}
            className="font-medium"
          />
        )}

        <QuickFilterTable
          rowData={filteredImportValidationResult}
          columns={tableColumns}
          gridRef={quickFilterTableRef}
        />

        <div className="h-24" data-testid="import-result-table-spacer" />

        {!isAllErrorsAbsentOrEmpty && !isQuotaExceeded && (
          <Card className="box-col-full justify-start items-start p-4">
            <p className="text-left">
              {t('student:importCsv.chooseWhatYouImport')}
            </p>

            <RadioGroup
              value={handleDataMethod}
              onValueChange={setHandleDataMethod}
              className="flex flex-col gap-2"
            >
              {importDataOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    dataTestId={option.dataTestId}
                  />
                  <label htmlFor={option.value}>{option.label}</label>
                </div>
              ))}
            </RadioGroup>
          </Card>
        )}

        {isAllErrorsAbsentOrEmpty && showBillingDateSetting && (
          <>
            <Box direction="col" padding="sm">
              <Text
                align="left"
                css={{
                  width: '100%',
                }}
              >
                {t('student:importCsv.billingDateMissing')}
              </Text>
              <Box direction="col" align="center" responsive className="w-full">
                <RadioCardGroup
                  items={billDateOptions}
                  cardContentDirection="row"
                  cardDirection="row"
                  columns={2}
                  selectedValue={billingDateSetting}
                  handleValueChange={(value: string) => {
                    setBillingDateSetting(value)
                  }}
                />

                {billingDateSetting === 'sameBillingDate' && (
                  <>
                    <Box align="start" className="w-full" responsive>
                      <Box direction="col">
                        <Text
                          align="left"
                          css={{
                            width: '100%',
                          }}
                        >
                          {t(
                            'teachingService:subscriptionSetting.billingStartDate'
                          )}
                        </Text>
                        <CustomDatePicker
                          minDate={new Date()}
                          // maxDate={selectedEndDate}
                          selected={billingStartDate}
                          showTimeSelect={false}
                          dateFormat="yyyy/MM/dd"
                          onChange={(newValue: Date | null) => {
                            if (!newValue) return
                            setBillingStartDate(newValue)
                          }}
                          selectedDate={null}
                        />
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </>
        )}
      </>
    )
  }

  const BillingStartDateSetting = () => {
    return (
      <>
        <Box direction="col" padding="sm">
          <Text
            align="left"
            css={{
              width: '100%',
            }}
          >
            {t('student:importCsv.billingDateMissing')}
          </Text>
          <Box direction="col" align="center" responsive className="w-full">
            <RadioCardGroup
              items={billDateOptions}
              cardContentDirection="row"
              cardDirection="row"
              columns={2}
              selectedValue={billingDateSetting}
              handleValueChange={(value: string) => {
                setBillingDateSetting(value)
              }}
            />

            {billingDateSetting === 'sameBillingDate' && (
              <>
                <Box
                  direction="col"
                  align="start"
                  className="w-full"
                  responsive
                >
                  <Box direction="col">
                    <Text
                      align="left"
                      css={{
                        width: '100%',
                      }}
                    >
                      {t(
                        'teachingService:subscriptionSetting.billingCycleName'
                      )}
                    </Text>

                    <Box justify="start" align="start" className="w-full">
                      <TextInput
                        type="text"
                        // value={billingAmount}
                        {...register('billingCycleName')}
                        // onChange={e => setBillingAmount(Number(e.target.value))}
                      />
                    </Box>
                  </Box>
                  <Box direction="col">
                    <Text
                      align="left"
                      css={{
                        width: '100%',
                      }}
                    >
                      {t('teachingService:subscriptionSetting.billingAmount')}
                    </Text>

                    <Box justify="start" align="start" className="w-full">
                      <TextInput
                        type="number"
                        // value={billingAmount}
                        min={0}
                        {...register('billingAmount', {
                          validate: (value: any) =>
                            value === null ||
                            Number(value) >= 0 ||
                            (t('embed:configuration.negative') as string),
                        })}
                        // onChange={e => setBillingAmount(Number(e.target.value))}
                      />
                    </Box>
                  </Box>

                  <Box direction="col">
                    <Text
                      align="left"
                      css={{
                        width: '100%',
                      }}
                    >
                      {t(
                        'teachingService:subscriptionSetting.billingStartDate'
                      )}
                    </Text>
                    <CustomDatePicker
                      minDate={new Date()}
                      // maxDate={selectedEndDate}
                      selected={billingStartDate}
                      showTimeSelect={false}
                      dateFormat="yyyy/MM/dd"
                      onChange={(newValue: Date | null) => {
                        if (!newValue) return
                        setBillingStartDate(newValue)
                      }}
                      selectedDate={null}
                    />
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </>
    )
  }

  return (
    <div className="box-col-full">
      {CheckImportResult()}
      {subStep === 1 && BillingStartDateSetting()}

      <div className="box-col-full mt-4">
        <div className="box-row-full">
          <Button
            variant="primary-outline"
            className="w-full"
            onClick={() => {
              if (subStep === 0)
                setStep(
                  ((prevStep: number) => prevStep - 1) as unknown as number
                )
              else if (subStep === 1 && !dataChargeFrequencyExist) setSubStep(0)
            }}
          >
            {t('common:action:previous')}
          </Button>
          <Button
            type="submit"
            className="w-full"
            loading={mutationImportStudent.isLoading}
            disabled={
              mutationImportStudent.isLoading ||
              (!isAllErrorsAbsentOrEmpty && !handleDataMethod)
              // || isQuotaExceeded
            }
            dataTestId="next-btn"
            onClick={() => {
              if (
                !isAllErrorsAbsentOrEmpty &&
                showBillingDateSetting &&
                subStep === 0
              ) {
                setSubStep(1)
              } else onSubmit()
            }}
          >
            {t('common:action:next')}
          </Button>
        </div>
        {/* Show the number of students being imported versus completed */}

        {showImportNotice && (
          <div className="box-col-full">
            <Text css={{ color: '$textSecondary', marginTop: '$2' }}>
              {t('student:importCsv.confirmStep.importingStudents', {
                count: importedLength,
                total: filteredImportValidationResult.length,
              })}
            </Text>
            <Text css={{ color: '$textSecondary', marginTop: '$2' }}>
              {t('student:importCsv.confirmStep.importMayTakeTime')}
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfirmImport

export function getImportResultTableColumns({
  t,
  tidiedImportResult,
  customDataFields,
}: {
  t: any
  tidiedImportResult: any[]
  customDataFields: any[]
}): ColDef[] {
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

  const fieldsChecking = [
    // Error column
    {
      field: 'importError',
      filter: true,
      headerName: t('student:importCsv.error'),
      maxWidth: 120,
      cellRenderer: (data: any) => {
        if (!data.value || data.value.length === 0) {
          return (
            <div className="flex h-full items-center gap-2">
              <LuCheck className="text-success" />
              <p>{t('student:importCsv.noErrorRow')}</p>
            </div>
          )
        }
        return (
          <>
            {data.value.map((value: string) => (
              <Text key={value}>{value}</Text>
            ))}
          </>
        )
      },
    },
    // Required fields
    {
      field: 'userId',
      headerName: t(`student:importCsv.fields.userId`),
    },
    {
      field: 'userEmail',
      headerName: t(`student:importCsv.fields.userEmail`),
    },
    {
      field: 'userPhone',
      headerName: t(`student:importCsv.fields.userPhone`),
      cellRenderer: (params: any) => {
        if (params.value) {
          return formatPhoneNumber(params.value.toString())
        }
        return params.value
      },
    },
    {
      field: 'userFirstName',
      headerName: t(`student:importCsv.fields.userFirstName`),
    },
    // Custom fields
    ...studentFormCustomFieldsHeader.map(field => {
      const customField = customDataFields?.find(
        customField => customField.id?.toString() === field
      )
      return {
        field,
        headerName:
          customField?.question ?? t(`student:importCsv.fields.${field}`),
        cellRenderer: (params: any) => {
          if (customField?.type === FieldTypes.PHONE && params.value) {
            return formatPhoneNumber(params.value.toString())
          }
          if (
            customField?.type === FieldTypes.MULTIPLE_CHOICE &&
            Array.isArray(params.value)
          ) {
            return params.value.map((value: string) => (
              <Text key={value}>{value}</Text>
            ))
          }
          return params.value
        },
      }
    }),
  ]

  return fieldsChecking.map(field => ({
    ...field,
    headerName:
      typeof field.headerName === 'string'
        ? field.headerName
        : (t(`student:importCsv.fields.${field.field}`) as string),
  }))
}
