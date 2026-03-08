import React from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import Box from '@/components/Containers/Box'
import Drawer from '@/components/Drawer/Drawer'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import useInformationFieldData from '@/hooks/useInformationFieldData'
import ContentLayout from '@/layouts/ContentLayout'
import { informationFieldState } from '@/stores/informationFieldData'

import ContentStudentInformation from './CreateNewFieldComponent'

const EditField = ({
  open,
  handleClose,
}: {
  open: boolean
  handleClose: () => void
}): React.ReactElement => {
  const { t } = useTranslation()

  const { useFetchCurrentInformationField } = useInformationFieldData()
  const [informationFieldRecoilState, setInformationFieldRecoildState] =
    useRecoilState(informationFieldState)

  const { isLoading, isError, isSuccess, isIdle } =
    useFetchCurrentInformationField(newField => {
      if (!informationFieldRecoilState.currentInformationField) {
        setInformationFieldRecoildState({
          ...informationFieldRecoilState,
          currentInformationField: newField,
        })
      }
    })

  const leftHeaderContent = (
    <Box css={{ fontSize: '$6' }}>
      {t('setting:studentInformation.editField')}
    </Box>
  )

  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'cross',
    action: handleClose,
  }

  return (
    <Drawer open={open}>
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={leftHeaderContent}
      >
        {isIdle && (
          <FullScreenAlertBox text={t(`setting:studentInformation.noField`)} />
        )}
        {isLoading && <FullScreenLoading />}
        {isError && (
          <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
        )}
        {isSuccess && !informationFieldRecoilState.currentInformationField && (
          <FullScreenAlertBox text={t(`setting:studentInformation.noField`)} />
        )}
        {isSuccess && informationFieldRecoilState.currentInformationField && (
          <ContentStudentInformation
            isEdit
            currentInformationField={
              informationFieldRecoilState.currentInformationField
            }
            handleClose={handleClose}
          />
        )}
      </ContentLayout>
    </Drawer>
  )
}

export default EditField
