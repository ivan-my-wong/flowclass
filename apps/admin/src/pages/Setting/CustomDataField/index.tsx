import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import AlertBox from '@/components/Boxes/AlertBox'
import Box from '@/components/Containers/Box'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import useInformationFieldData from '@/hooks/useInformationFieldData'
import { useResponsive } from '@/hooks/useResponsive'
import ContentLayout from '@/layouts/ContentLayout'

import CreateNewField from './CreateNewCustomDataFieldDrawer'
import FieldCard from './CustomDataFieldCard'

const StudentInfomationField = (): React.ReactElement => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isMobile } = useResponsive()
  const { useFetchAllInformationFieldData, useDeleteInformationField } =
    useInformationFieldData()
  const fetchInformationFieldaResult = useFetchAllInformationFieldData()
  const { isLoading, isError, isSuccess, isIdle, data, refetch } =
    fetchInformationFieldaResult

  const [isOpenAdd, setIsOpenAdd] = useState(false)
  const deleteField = useDeleteInformationField()
  const handleDeleteField = (id: number) => {
    deleteField.mutateAsync(id).then(() => {
      refetch()
    })
  }
  const sortedFields = useMemo(() => {
    return (
      data
        ?.filter(field => typeof field.order === 'number')
        .sort((a, b) => a.order - b.order) || []
    )
  }, [data])
  const headerBackButton: HeaderBackButtonStatus = {
    title: t(`setting:pageTitle`),
    mode: 'add',
  }

  const rightHeaderContent = (
    <Box>
      {!isMobile && (
        <Button
          className="w-full"
          variant="primary-outline"
          onClick={() =>
            navigate('/settings/student-information-field/reorder')
          }
        >
          {t(`setting:studentInformation.reorder`)}
        </Button>
      )}
      <Button className="w-full" onClick={() => setIsOpenAdd(true)}>
        {isMobile
          ? t(`common:action:create`)
          : t(`setting:studentInformation.createNewField`)}
      </Button>
    </Box>
  )
  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      rightHeader={rightHeaderContent}
    >
      <Heading css={{ padding: '0 $4' }}>
        {t(`setting:studentInformation.studentInformationField`)}
      </Heading>
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
      {isSuccess && data && data.length > 0 && (
        <Box direction="column" padding="medium" role="list">
          <AlertBox content={t('setting:studentInformation.notification')} />
          {sortedFields.map(field => {
            return (
              <FieldCard
                key={field.id}
                data={field}
                handleDeleteField={handleDeleteField}
              />
            )
          })}
        </Box>
      )}

      <CreateNewField
        open={isOpenAdd}
        handleClose={() => setIsOpenAdd(false)}
      />
    </ContentLayout>
  )
}

export default StudentInfomationField
