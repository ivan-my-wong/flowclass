import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { useTranslation } from 'react-i18next'

import StepIndicator from '@/components/ProgressIndicator/StepIndicator'
import ModalDialog from '@/components/ui/ModalDialog'
import { ImportRequiredFieldsV2 } from '@/constants/common'
import useInformationFieldData from '@/hooks/useInformationFieldData'
import UploadCSV from '@/pages/StudentCRM/CSV/UploadCSVStep'
import {
  ChargeFrequency,
  DbMapping,
  ImportResultDatabaseResponseDto,
  TypeDataColumnName,
  TypeOpts,
} from '@/types/student'

import ConfirmImport from './ConfirmImport'
import ImportResult from './ImportResult'
import SelectCustomDataField from './SelectCustomDataField'

type ImportCSVModalProps = {
  hidden?: boolean
  // createCourseType: CourseType
  // handleCreateCourseSuccess: (course: Course) => void
  institutionId?: number
  siteId?: number
  handlePrev: () => void
  registerWithImportData?: any
  onImportSuccess?: () => void
  // file: File
}

const importCsvSteps = [
  'student:importCsv.steps.stepOne',
  'student:importCsv.steps.stepTwo',
  'student:importCsv.steps.stepThree',
  'student:importCsv.steps.stepFour',
]

export type ImportCSVModalHandle = {
  handleOpenChange: () => void
}

const importRequiredFieldsKeys = Object.keys(ImportRequiredFieldsV2) as Array<
  keyof typeof ImportRequiredFieldsV2
>

const ImportCSVModal = forwardRef<ImportCSVModalHandle, ImportCSVModalProps>(
  (
    {
      hidden,
      institutionId,
      siteId,
      handlePrev,
      registerWithImportData,
      onImportSuccess,
    },
    ref
  ) => {
    const [open, setOpen] = useState<boolean>(false)
    const [dataColumnNames, setDataColumnNames] = useState<TypeDataColumnName>()
    const [, setOptsField] = useState<void | TypeOpts[]>([])
    const [, setChargeFreqOptsField] = useState<void | TypeOpts[]>([])
    const [step, setStep] = useState<number>(1)
    const [importErrRes, setImportErrRes] = useState<
      ImportResultDatabaseResponseDto[]
    >([])
    const [, setChargeFrequencyValues] = useState<void | string[]>([])
    const [, setDbMapping] = useState<void | DbMapping>()
    const [importResult, setImportResult] = useState<any[]>([])
    const [isDataChargeFrequencyExist, setIsDataChargeFrequencyExist] =
      useState<boolean>(false)
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
    const { t } = useTranslation()
    const refFile = useRef<File | null>(null)

    // This is to get all available fields
    const { useFetchAllInformationFieldData } = useInformationFieldData()
    const { data: customDataFields } = useFetchAllInformationFieldData()
    useEffect(() => {
      const chargeFrequencyValues: string[] = Object.values(ChargeFrequency)
      const typeOptsArray: TypeOpts[] = importRequiredFieldsKeys.map(key => ({
        value: key,
        label: t(`student:importCsv.fields.${key}`),
      }))

      const chargeFreqOptsArray: TypeOpts[] = chargeFrequencyValues.map(
        val => ({
          value: val,
          label: t(`student:importCsv.chargeFrequency.${val}`),
        })
      )

      setOptsField(typeOptsArray)
      setChargeFreqOptsField(chargeFreqOptsArray)
    }, [])

    const setRefFile = (file: File | null) => {
      refFile.current = file
    }

    const handleOpenChange = () => {
      setOpen(!open)
      setStep(1)
    }

    useImperativeHandle(ref, () => ({
      handleOpenChange,
    }))

    const renderStepContent = (step: number) => {
      switch (step) {
        case 1:
          return (
            <UploadCSV
              refFile={refFile}
              setRefFile={setRefFile}
              setStep={setStep}
              setDataColumnNames={setDataColumnNames}
            />
          )
        case 2:
          if (refFile.current) {
            return (
              <SelectCustomDataField
                dataColumnNames={dataColumnNames}
                file={refFile.current} // Access the current value
                setStep={setStep}
                setImportErrRes={setImportErrRes}
                setChargeFrequencyValues={setChargeFrequencyValues}
                setDbMapping={setDbMapping}
                customDataFields={customDataFields ?? []}
                fieldMapping={fieldMapping}
                setFieldMapping={setFieldMapping}
              />
            )
          }

          break

        case 3:
          return (
            <ConfirmImport
              setStep={setStep}
              importValidationResult={importErrRes}
              institutionId={institutionId}
              siteId={siteId}
              dataChargeFrequencyExist={isDataChargeFrequencyExist}
              registerWithImportData={registerWithImportData}
              // handleOpenChange={handleOpenChange}
              // importResult={importResult}
              setImportResult={setImportResult}
              showBillingDateSetting={false}
              customDataFields={customDataFields ?? []}
            />
          )
        case 4:
          return (
            <ImportResult
              handleOpenChange={handleOpenChange}
              registerWithImportData={registerWithImportData}
              importResult={importResult}
              customDataFields={customDataFields ?? []}
              onImportSuccess={onImportSuccess}
            />
          )

        case 5:
          return <></>
        default:
          return <></>
      }
      return null
    }

    return (
      <ModalDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={t('student:importCsv.title') as string}
      >
        <StepIndicator
          steps={importCsvSteps.map(text => t(text))}
          currentStep={step - 1}
        />
        {renderStepContent(step)}
        <div className="h-2" data-testid="import-result-table-spacer" />
      </ModalDialog>
    )
  }
)

export default ImportCSVModal
