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
import { styled } from '@/styles'
import { TypeDataColumnName, TypeParamsGetColumnName } from '@/types/student'

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
    <Box direction="column" css={{ marginTop: '$6' }}>
      <Box align="flex-start" direction="column">
        <Text css={{ fontWeight: 'bold' }}>
          {t('student:importCsv.fileToUpload')}
        </Text>
        <Text
          css={{
            color: '$textSecondary',
            fontSize: '$3',
            marginBottom: '$2',
          }}
        >
          {t('student:importCsv.instructionColumnNameMapping')}
        </Text>

        <DropZone
          direction="column"
          css={{
            border: isDragActive
              ? '2px solid $primary'
              : '1px dashed $textDisabled',
            background: isDragActive ? '$primaryLight' : 'transparent',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Box direction="column" css={{ margin: '$16 0' }}>
            <Box direction="column">
              <SelectFileIcon />
            </Box>
            {file ? (
              <Box
                css={{ fontSize: '$4', fontWeight: 'bold' }}
                justify="center"
              >
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
                  <Text
                    css={{
                      cursor: 'pointer',
                      color: '$primary',
                      padding: '$2',
                      border: '2px solid $primary',
                      borderRadius: '$1',
                    }}
                  >
                    {t('student:importCsv.selectfile')}
                  </Text>
                </label>
                <Text
                  css={{
                    color: '$textDisabled',
                  }}
                >
                  {t('student:importCsv.orDropHere', 'or drop file here')}
                </Text>
              </Box>
            )}
          </Box>
          <InputFile
            ref={refFileSelect}
            id="dropzone-file"
            type="file"
            accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            multiple={false}
            onChange={handleChooseFile}
          />
        </DropZone>
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

const InputFile = styled('input', {
  display: 'none',
})

const DropZone = styled(Box, {
  transition: 'border 0.2s, background 0.2s',
})
