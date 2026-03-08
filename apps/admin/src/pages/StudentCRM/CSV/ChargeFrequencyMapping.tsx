import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import TextInput from '@/components/Inputs/TextInput'
import { Spinner } from '@/components/Loaders/Spinner'
import { selectCustomStyles } from '@/components/Selector/TextSearchMultiSelector'
import Text from '@/components/Texts/Text'
import useStudentData from '@/hooks/useStudentData'
import { DbMapping, RelatedFieldToColumn, TypeOpts } from '@/types/student'

const ChargeFrequencyMapping = ({
  file,
  institutionId,
  siteId,
  // fieldsChanged,
  chargeFrequencyValues,
  optsField,
  // handlePrev,
  setStep,
  setImportErrRes,
  dbMapping,
}: {
  file: File
  institutionId?: number
  siteId?: number
  // fieldsChanged: any
  optsField: TypeOpts[]
  chargeFrequencyValues: string[]
  // handlePrev: () => void
  setStep: (val: number) => void
  setImportErrRes: (val: any) => void
  dbMapping?: DbMapping
}) => {
  const { handleSubmit, control } = useForm<any>({})
  const { t } = useTranslation()
  const { useCheckImportCsvData } = useStudentData()

  const handleSuccessCheck = (data: any) => {
    setImportErrRes(data)
    setStep(((prevStep: number) => prevStep + 1) as unknown as number)
  }

  const checkData = useCheckImportCsvData(handleSuccessCheck)

  const handlePrev = () => {
    setStep(((prevStep: number) => prevStep - 1) as unknown as number)
  }

  const onSubmit = (val: any) => {
    const fields: RelatedFieldToColumn[] = Object.entries(
      val as Record<string, any>
    ).map(([key, value]) => ({
      column: key,
      field: value?.value,
      type: value?.type,
    }))

    const mapValToCsvValueToDbValueExcludingDefault = fields
      .filter(item => item.column !== 'defaultChargeFrequency' && item.field)
      .map(item => ({
        csvValue: item.column,
        dbValue: item.field as string,
      }))

    const params = {
      mapDbValue: {
        // ...dbMapping,
        headerMap: dbMapping?.headerMap ?? [],
        chargeFreqValMap: mapValToCsvValueToDbValueExcludingDefault,
        defaultChargeFreqValue: val.defaultChargeFrequency?.value,
      },
      institutionId,
      siteId,
      file,
    }

    checkData.mutate(params)
  }

  return (
    <>
      <Text css={{ fontWeight: '600' }}>{t('student:importCsv.matching')}</Text>
      <Text css={{ fontSize: '$3', color: '$textSubtle' }}>
        {t('student:importCsv.chargeFreqMatchDesc')}
      </Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          {chargeFrequencyValues &&
            chargeFrequencyValues.map(item => {
              return (
                <>
                  <div key={item}>
                    <Box css={{ width: '50%' }}>
                      <TextInput disabled value={item} />
                    </Box>
                    <Box css={{ width: '50%', position: 'relative' }}>
                      <Controller
                        name={item}
                        control={control}
                        render={({ field }) => (
                          <Select
                            options={optsField}
                            styles={selectCustomStyles('100%')}
                            {...field}
                          />
                        )}
                      />
                    </Box>
                  </div>
                </>
              )
            })}
          <div>
            <Box css={{ width: '50%' }}>
              <Text align="left" width="100%">
                {t('student:importCsv.setDefaultChargeFrequency')}
              </Text>
            </Box>
            <Box css={{ width: '50%', position: 'relative' }}>
              <Controller
                name="defaultChargeFrequency"
                control={control}
                render={({ field }) => (
                  <Select
                    options={optsField}
                    styles={selectCustomStyles('100%')}
                    {...field}
                  />
                )}
              />
            </Box>
          </div>
        </div>

        <div>
          <Button variants="default" onClick={handlePrev}>
            {t('common:action:previous')}
          </Button>
          <Button type="submit">
            {checkData.isLoading ? (
              <Spinner size="small" />
            ) : (
              t('common:action:next')
            )}
          </Button>
        </div>
      </form>
    </>
  )
}

export default ChargeFrequencyMapping
