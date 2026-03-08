import React, { ChangeEvent, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { AiFillCloseCircle } from 'react-icons/ai'
import { useMutation } from 'react-query'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { getColumnName } from '@/api/student'
import csvTemplate from '@/assets/docs/student_data_template.csv?url'
import SelectFileIcon from '@/assets/svgs/student/selectFileIcon'
import Box from '@/components/Containers/Box'
import SvgIcon from '@/components/Images/SvgIcon'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import { TypeDataColumnName, TypeParamsGetColumnName } from '@/types/student'
import { cn } from '@/utils/cn'

const UploadCSV = ({
  refFile,
  setRefFile,
  setStep,
  setDataColumnNames,
}: {
  // fieldsChanged: any
  refFile: React.MutableRefObject<File | null>
  setRefFile: (refFile: File | null) => void
  setStep: (val: number) => void
  setDataColumnNames: (val: TypeDataColumnName) => void
}): JSX.Element => {
  const [file, setFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const refFileSelect = useRef<any>(null)
  // const dataColumnNames = useRef<TypeDataColumnName>()
  const { t } = useTranslation()
  // const refFile = useRef<File | null>(null)

  const mutation = useMutation({
    mutationFn: (params: TypeParamsGetColumnName) => getColumnName(params),
    onSuccess: (rs: TypeDataColumnName) => {
      setDataColumnNames(rs)
      // dataColumnNames.current = rs
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
    retry: true,
  })
  const handleChooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setRefFile(event.target.files[0])
      setFile(event.target.files[0])
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setRefFile(event.dataTransfer.files[0])
      setFile(event.dataTransfer.files[0])
      if (refFileSelect.current) {
        refFileSelect.current.value = null
      }
    }
  }

  const DownloadLink: React.FC<{
    href: string
    download: string
    children: React.ReactNode
  }> = ({ href, download, children }) => (
    <Button variant="link">
      <a href={href} download={download}>
        {children}
      </a>
    </Button>
  )
  return (
    <Box direction="column" className="mt-6">
      <Box align="flex-start" direction="column">
        <Text className="font-bold">{t('student:importCsv.fileToUpload')}</Text>
        <Text className="text-text-sub text-sm mb-2">
          {t('student:importCsv.instructionColumnNameMapping')}
        </Text>

        <div
          className={cn(
            'flex flex-col transition-[border,background] duration-200',
            isDragActive
              ? 'border-2 border-primary bg-primary/10'
              : 'border border-dashed border-text-disabled bg-transparent'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Box direction="column" className="my-16">
            <Box direction="column">
              <SelectFileIcon />
            </Box>
            {file ? (
              <Box className="text-base font-bold" justify="center">
                <SvgIcon
                  className="hover:cursor-pointer hover:opacity-80"
                  onClick={() => {
                    setRefFile(null)
                    setFile(null)
                    if (refFileSelect.current) {
                      refFileSelect.current.value = null
                    }
                  }}
                >
                  <AiFillCloseCircle size={24} />
                </SvgIcon>
                {file?.name}
              </Box>
            ) : (
              <Box direction="column">
                <Text> {t('student:importCsv.tutorial')}</Text>
                <DownloadLink
                  href={csvTemplate}
                  download="student_data_template.csv"
                >
                  {t('student:importCsv.downloadTemplate')}
                </DownloadLink>
                <label htmlFor="dropzone-file">
                  <Text className="cursor-pointer text-primary p-2 border-2 border-primary rounded">
                    {t('student:importCsv.selectfile')}
                  </Text>
                </label>
                <Text className="text-text-disabled">
                  {t('student:importCsv.orDropHere', 'or drop file here')}
                </Text>
              </Box>
            )}
          </Box>
          <input
            ref={refFileSelect}
            id="dropzone-file"
            type="file"
            accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            multiple={false}
            onChange={handleChooseFile}
            className="hidden"
          />
        </div>
      </Box>
      <Button
        disabled={!file}
        data-testid="next-to-confirm-import-btn"
        onClick={async () => {
          if (refFile.current) {
            const params = {
              file: refFile.current,
            }
            mutation.mutate(params)
            setStep(((prevStep: number) => prevStep + 1) as unknown as number)
          }
        }}
        className="w-full"
        loading={mutation.isLoading}
      >
        {t('common:action:next')}
      </Button>
    </Box>
  )
}

export default UploadCSV
