import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'

import Button from '../../../components/Buttons/Button'
import Box from '../../../components/Containers/Box'
import Drawer from '../../../components/Drawer/Drawer'
import TextInput from '../../../components/Inputs/TextInput'
import Text from '../../../components/Texts/Text'
// import FullScreenAlertBox from '../../../components/FullScreen/FullScreenAlertBox'
// import FullScreenLoading from '../../../components/FullScreen/FullScreenLoading'
// import useSchoolData from '../../../hooks/useSchoolData'
import ContentLayout from '../../../layouts/ContentLayout'

interface Props {
  open: boolean
  handleClose: () => void
}

const EditFee = ({ open, handleClose }: Props) => {
  const { t } = useTranslation()
  // const { schoolData } = useSchoolData()
  // const currentInstitutionId = schoolData.currentSchool?.id || 0
  const [name, setName] = useState<string>()
  const [fee, setFee] = useState<string>()
  // const [defaultField, setDefaultField] = useState<any[]>()
  const [fields] = useState<any[]>()

  const handleUpdate = () => {}

  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'cross',
    action: () => {
      handleClose()
    },
  }

  const leftHeaderContent = (
    <Box css={{ fontSize: '$6' }}>
      {t('teachingService:additionalFee.editAdditionalFee')}
    </Box>
  )

  const rightHeaderContent = (
    <Box>
      <Button disabled={!fields} onClick={() => handleUpdate()}>
        {t('setting:applicationForm.save')}
      </Button>
    </Box>
  )

  return (
    <Drawer open={open}>
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={leftHeaderContent}
        rightHeader={rightHeaderContent}
      >
        <Box direction="column" css={{ padding: '$4 $2' }} gap="large">
          <Box direction="column" align="flex-start">
            <Text size="mediumLarge" bold>
              {t('teachingService:additionalFee.name')}
            </Text>
            <Text>
              {t('teachingService:additionalFee.additionalFeeDisplay')}
            </Text>
            <TextInput
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`${t(
                'teachingService:additionalFee.namePlaceholder'
              )}`}
            />
          </Box>
          <Box direction="column" align="flex-start">
            <Text size="mediumLarge" bold>
              {t('teachingService:additionalFee.fee')}
            </Text>
            <TextInput
              value={fee}
              onChange={e => setFee(e.target.value)}
              placeholder={`${t(
                'teachingService:additionalFee.feePlaceholder'
              )}`}
            />
          </Box>
          <Box direction="column" align="flex-start">
            <Text size="mediumLarge" bold>
              {t('teachingService:additionalFee.condition')}
            </Text>
            <Box
              css={{ backgroundColor: '$backgroundLayer3', borderRadius: '$1' }}
              padding="medium"
            >
              <Text> {t('teachingService:additionalFee.compulsory')}</Text>
            </Box>
          </Box>
        </Box>
      </ContentLayout>
    </Drawer>
  )
}

export default EditFee
