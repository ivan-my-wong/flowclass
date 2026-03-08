import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import AlertBox from '@/components/Boxes/AlertBox'
import LoadingButton from '@/components/Buttons/LoadingButton'
import Box from '@/components/Containers/Box'
import {
  DraggableCard,
  DraggableContainer,
} from '@/components/Containers/Draggable'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import useInformationFieldData from '@/hooks/useInformationFieldData'
import ContentLayout from '@/layouts/ContentLayout'
import { InformationFieldTypes } from '@/types/applicationForm'

import FieldCard from './CustomDataFieldCard'

const ReorderStudentInformation = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { useFetchAllInformationFieldData, useReOrderInformationField } =
    useInformationFieldData()
  const [fields, setFields] = useState<InformationFieldTypes[]>()
  const fetchInformationFieldaResult = useFetchAllInformationFieldData()
  const { isLoading, isError, isSuccess, isIdle, data, refetch } =
    fetchInformationFieldaResult
  useEffect(() => {
    if (data) {
      setFields(
        data
          .filter(a => typeof a.order === 'number')
          .sort((a, b) => a.order - b.order)
      )
    }
  }, [data])
  const handleDeleteField = () => {}
  const handleReOrder = async () => {
    if (fields && fields.length) {
      await reOrderField
        .mutateAsync(fields.map(field => field.id ?? 0))
        .then(() => {
          refetch()
        })
      navigate('/settings/student-information-field')
    }
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('setting:studentInformation.studentInformationField'),
    mode: 'add',
  }

  const rightHeaderContent = (
    <Box>
      {/* <Button css={{ width: '100%' }} variants="outlined">
        {t(`common:action.cancel`)}
      </Button> */}
      <LoadingButton
        isLoading={isLoading}
        className="w-full"
        onClick={() => handleReOrder()}
      >
        {t(`promotion:save`)}
      </LoadingButton>
    </Box>
  )

  const handleDragEnd = (value: InformationFieldTypes[]) => {
    setFields(value)
  }
  const reOrderField = useReOrderInformationField()

  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      rightHeader={rightHeaderContent}
    >
      {isIdle && (
        <FullScreenAlertBox text={t(`setting:studentInformation.noFields`)} />
      )}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess && data && data.length === 0 && (
        <FullScreenAlertBox text={t(`setting:studentInformation.noFields`)} />
      )}
      {isSuccess && fields && fields.length > 0 && (
        <div className="box-col">
          <AlertBox
            content={t('setting:studentInformation.descriptionReorder')}
          />
          <DraggableContainer handleDragEnd={handleDragEnd} items={fields}>
            {fields.map(field => {
              return (
                <DraggableCard key={field.id} id={`${field.id ?? 0}`}>
                  <FieldCard
                    key={field.id}
                    data={field}
                    handleDeleteField={handleDeleteField}
                  />
                </DraggableCard>
              )
            })}
          </DraggableContainer>
        </div>
      )}
    </ContentLayout>
  )
}

export default ReorderStudentInformation
