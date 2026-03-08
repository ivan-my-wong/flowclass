import React, { ForwardedRef, useEffect, useRef, useState } from 'react'

import BrotherSdk from 'bpac-js'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import Box from '@/components/Containers/Box'
import Text from '@/components/Texts/Text'
import Switch from '@/components/Toggle/Switch'
import { Button } from '@/components/ui/Button'
import {
  LabelTemplateThreeRowFourCorners,
  LabelTemplateThreeRowFourCornersBlackRed,
} from '@/constants/labelTemplate'
import LabelRowFieldsSelect from '@/pages/StudentCRM/Label/LabelRowFieldsSelect'

export type LabelObjects = {
  row1?: string
  row2?: string
  row3?: string
  topLeft?: string
  topRight?: string
  bottomLeft?: string
  bottomRight?: string
}

interface LabelData {
  name: string
  email?: string
  phone?: string
  registrationForm: Array<{
    question: string
    value: string | number | string[] | null
  }>
}

export type PrintField = {
  field: string
  allowDelete: boolean
  position:
    | 'row1'
    | 'row2'
    | 'row3'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
}

interface LabelComponentProps {
  data: LabelObjects
}

const LabelComponent = React.forwardRef<HTMLDivElement, LabelComponentProps>(
  ({ data }: LabelComponentProps, ref: ForwardedRef<HTMLDivElement>) => {
    const WIDTH_MM = 78
    const HEIGHT_MM = 62
    const MM_TO_PX = 3.78
    const width = WIDTH_MM * MM_TO_PX
    const height = HEIGHT_MM * MM_TO_PX

    const renderText = (text?: string) => {
      if (!text || text === 'N/A') return null
      return (
        <Text size="medium" css={{ whiteSpace: 'nowrap' }}>
          {text}
        </Text>
      )
    }

    return (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          margin: '0 auto',
        }}
        ref={ref}
        id="label-component"
      >
        <Box
          direction="column"
          css={{
            padding: '$2',
            width: '100%',
            height: '100%',
            border: '0.06rem solid $borderColor',
            borderRadius: '0.25rem',
            backgroundColor: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Main rows */}
          <Box direction="column" css={{ gap: '$1' }}>
            {data.row1 && data.row1 !== 'N/A' && (
              <Box css={{ padding: '$1', width: '100%' }}>
                <Text bold size="large" css={{ whiteSpace: 'nowrap' }}>
                  {data.row1}
                </Text>
              </Box>
            )}
            {data.row2 && data.row2 !== 'N/A' && (
              <Box css={{ padding: '$1', width: '100%' }}>
                {renderText(data.row2)}
              </Box>
            )}
            {data.row3 && data.row3 !== 'N/A' && (
              <Box css={{ padding: '$1', width: '100%' }}>
                {renderText(data.row3)}
              </Box>
            )}
          </Box>

          {/* Top corners */}
          <Box
            css={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'absolute',
              top: '$1',
              left: '$1',
              right: '$1',
              width: 'calc(100% - $2)',
            }}
          >
            {data.topLeft && data.topLeft !== 'N/A' && (
              <Text size="small" css={{ maxWidth: '45%' }}>
                {data.topLeft}
              </Text>
            )}
            {data.topRight && data.topRight !== 'N/A' && (
              <Text size="small" css={{ maxWidth: '45%', textAlign: 'right' }}>
                {data.topRight}
              </Text>
            )}
          </Box>

          {/* Bottom corners */}
          <Box
            css={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'absolute',
              bottom: '$1',
              left: '$1',
              right: '$1',
              width: 'calc(100% - $2)',
            }}
          >
            {data.bottomLeft && data.bottomLeft !== 'N/A' && (
              <Text size="small" css={{ maxWidth: '45%' }}>
                {data.bottomLeft}
              </Text>
            )}
            {data.bottomRight && data.bottomRight !== 'N/A' && (
              <Text size="small" css={{ maxWidth: '45%', textAlign: 'right' }}>
                {data.bottomRight}
              </Text>
            )}
          </Box>
        </Box>
      </div>
    )
  }
)

const LabelPrint = ({
  labelData,
  onBack,
}: {
  labelData: LabelData
  onBack: () => void
}): React.ReactElement => {
  const { t } = useTranslation()
  const [isBlackRed, setIsBlackRed] = useState(false)
  const [selectedPrintFields, setSelectedPrintFields] = useState<PrintField[]>([
    { field: 'name', allowDelete: false, position: 'row1' },
    { field: 'N/A', allowDelete: true, position: 'row2' },
    { field: 'N/A', allowDelete: true, position: 'row3' },
    { field: 'N/A', allowDelete: true, position: 'topLeft' },
    { field: 'N/A', allowDelete: true, position: 'topRight' },
    { field: 'N/A', allowDelete: true, position: 'bottomLeft' },
    { field: 'N/A', allowDelete: true, position: 'bottomRight' },
  ])

  const getFieldValue = (fieldName: string) => {
    if (fieldName === 'N/A') return 'N/A'
    if (fieldName === 'name') return labelData.name
    if (fieldName === 'email') return labelData.email ?? 'N/A'
    if (fieldName === 'phone') return labelData.phone ?? 'N/A'
    return (
      labelData.registrationForm
        ?.find((item: any) => item.question === fieldName)
        ?.value?.toString() ?? 'N/A'
    )
  }

  const [labelObjectData, setLabelObjectData] = useState<LabelObjects>({
    row1: getFieldValue(selectedPrintFields[0].field),
    row2: 'N/A',
    row3: 'N/A',
    topLeft: 'N/A',
    topRight: 'N/A',
    bottomLeft: 'N/A',
    bottomRight: 'N/A',
  })

  const labelComponentRef = useRef<HTMLDivElement>(null)
  const key = 'label-print'

  useEffect(() => {
    if (localStorage.getItem(key)) {
      const obj = JSON.parse(localStorage.getItem(key) ?? '')
      if (!obj) return

      setSelectedPrintFields(obj.selectedPrintFields)
      setIsBlackRed(obj.isBlackRed)

      if (!labelData || !obj.selectedPrintFields) return

      const updatedData: LabelObjects = {}
      obj.selectedPrintFields.forEach((field: PrintField) => {
        updatedData[field.position] = getFieldValue(field.field)
      })

      setLabelObjectData(updatedData)
    }
  }, [])

  const tag = new BrotherSdk({
    templatePath: isBlackRed
      ? LabelTemplateThreeRowFourCornersBlackRed
      : LabelTemplateThreeRowFourCorners,
  })

  const options = {
    copies: 1,
    printName: 'label',
  }

  const sendToPrinter = async () => {
    try {
      const printData = Object.fromEntries(
        Object.entries(labelObjectData).filter(
          ([_, value]) => value !== 'N/A' && value !== '' && value != null
        )
      )

      const isPrinted = await tag.print(printData, options)
      if (isPrinted) {
        toast.success(t('student:qrCodeAttendance.printJobSuccess'))
      }
    } catch (error: any) {
      console.log('error', error)
      toast.error(t('student:qrCodeAttendance.error.printError'))
    }

    const store = {
      selectedPrintFields,
      labelObjectData,
      isBlackRed,
    }
    localStorage.setItem(key, JSON.stringify(store))
  }

  const onSelectFieldChange = (selectedValue: string, position: string) => {
    const updatedFields = selectedPrintFields.map(field =>
      field.position === position ? { ...field, field: selectedValue } : field
    )

    const updatedData = { ...labelObjectData }
    updatedData[position as keyof LabelObjects] = getFieldValue(selectedValue)

    setLabelObjectData(updatedData)
    setSelectedPrintFields(updatedFields)
  }

  return (
    <div className="box-col-full py-4">
      <div className="box-row-full w-full justify-end">
        <p className="shrink-0">Use Black & Red Label Template?</p>
        <Switch
          checked={isBlackRed}
          onCheckedChange={setIsBlackRed}
          className="justify-end"
        />
      </div>

      <div className="box-col-full w-full">
        <p className="w-full">
          {t('student:qrCodeAttendance.specifyLabelInfo')}
        </p>
      </div>

      <div className="box-col-full w-full">
        <div className="box-col-full p-1 w-full justify-start">
          <LabelRowFieldsSelect
            labelData={labelData}
            labelObjectData={labelObjectData}
            selectedPrintFields={selectedPrintFields}
            setSelectedPrintFields={setSelectedPrintFields}
            setLabelObjectData={setLabelObjectData}
          />
        </div>
      </div>

      <div className="box-col-full">
        <LabelComponent ref={labelComponentRef} data={labelObjectData} />
      </div>

      <div className="box-row-full gap-8">
        {onBack && (
          <Button variant="primary-outline" onClick={() => onBack()}>
            {t('student:labelPrint.returnToScanning')}
          </Button>
        )}
        <Button onClick={sendToPrinter}>
          {t('student:qrCodeAttendance.printLabel')}
        </Button>
      </div>
    </div>
  )
}

export default LabelPrint
