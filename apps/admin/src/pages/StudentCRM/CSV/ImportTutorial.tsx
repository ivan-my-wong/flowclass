import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import NotiIcon from '@/assets/svgs/settings/noti'
import Box from '@/components/Containers/Box'
import Drawer from '@/components/Drawer/Drawer'
import SvgIcon from '@/components/Images/SvgIcon'
import {
  Table,
  Td,
  TdPrepareTable,
  Thead,
  TrBody,
  TrHead,
} from '@/components/Tables/Table'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import ContentLayout from '@/layouts/ContentLayout'
import { styled } from '@/styles'

interface Props {
  open: boolean
  handleClose: () => void
}

const ImportTutorialCSV = ({ open, handleClose }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const leftHeaderContent = (
    <Box css={{ fontSize: '$6' }}>{t('student:importCsv.title')}</Box>
  )

  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'cross',
    action: () => {
      handleClose()
    },
  }

  return (
    <Drawer open={open}>
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={leftHeaderContent}
      >
        <Box direction="column" css={{ margin: '$6 0px' }}>
          <Box
            css={{ background: '$backgroundLayer3', borderRadius: '$1' }}
            padding="medium"
            justify="flex-start"
            align="flex-start"
          >
            <SvgIcon>
              <NotiIcon />
            </SvgIcon>
            {t('student:importCsv.tutorial2')}
          </Box>
          <Heading as="h6">{t('student:importCsv.titleTutotial')}</Heading>
          <Box direction="column" align="flex-start">
            <PText>
              1.{t('student:importCsv.step1')}
              <LinkText
                onClick={() => navigate('/settings/student-information-field')}
              >
                {t('student:importCsv.step11')}
              </LinkText>
              {t('student:importCsv.step12')}
            </PText>
            <Text>2.{t('student:importCsv.step2')}</Text>
          </Box>
          <Heading as="h6">{t('student:importCsv.prepareFile')}</Heading>
          <Table>
            <Thead>
              <TrHead>
                <TdPrepareTable>{t('student:importCsv.name')}</TdPrepareTable>
                <TdPrepareTable>
                  {t('student:importCsv.academyLevel')}
                </TdPrepareTable>
                <TdPrepareTable />
                <TdPrepareTable />
              </TrHead>
            </Thead>
            <tbody>
              <TrBody>
                <TdPrepareTable>Ivan</TdPrepareTable>
                <TdPrepareTable>Form 5</TdPrepareTable>
                <TdPrepareTable />
                <TdPrepareTable />
              </TrBody>
              <TrBody>
                <TdPrepareTable>Chloe</TdPrepareTable>
                <TdPrepareTable>Primary 6</TdPrepareTable>
                <TdPrepareTable />
                <TdPrepareTable />
              </TrBody>
              <TrBody>
                <TdPrepareTable>Jason</TdPrepareTable>
                <TdPrepareTable>Primary 4</TdPrepareTable>
                <TdPrepareTable />
                <TdPrepareTable />
              </TrBody>
            </tbody>
          </Table>
          <Box direction="column" align="flex-start">
            <ul>
              <LiTag>{t('student:importCsv.prepare1')}</LiTag>
              <LiTag>{t('student:importCsv.prepare2')}</LiTag>
              <LiTag>{t('student:importCsv.prepare3')}</LiTag>
            </ul>
          </Box>
          <Box
            css={{
              background: '$backgroundLayer3',
              borderRadius: '$1',
              lineHeight: '20px',
              fontWeight: 700,
            }}
            padding="medium"
            justify="flex-start"
            align="center"
          >
            <SvgIcon>
              <NotiIcon />
            </SvgIcon>
            {t('student:importCsv.tutorial3')}
          </Box>
          <Table>
            <Thead>
              <TrHead>
                <Td>{t('student:importCsv.fieldType')}</Td>
                <Td>{t('student:importCsv.inputFormat')}</Td>
              </TrHead>
            </Thead>
            <tbody>
              <TrBody>
                <Td>{t('student:importCsv.multipleChoice')}</Td>
                <Td>{t('student:importCsv.multipleChoiceFormat')}</Td>
              </TrBody>
              <TrBody>
                <Td>{t('student:importCsv.checkbox')}</Td>
                <Td>{t('student:importCsv.checkboxFormat')}</Td>
              </TrBody>
              <TrBody>
                <Td>{t('student:importCsv.dropdown')}</Td>
                <Td>{t('student:importCsv.dropdownFormat')}</Td>
              </TrBody>
              <TrBody>
                <Td>{t('student:importCsv.switch')}</Td>
                <Td>{t('student:importCsv.switchFormat')}</Td>
              </TrBody>
            </tbody>
          </Table>
        </Box>
      </ContentLayout>
    </Drawer>
  )
}

const PText = styled('div', {
  lineHeight: '22px',
})
const LinkText = styled('span', {
  cursor: 'pointer',
  color: '$primary',
  padding: '0px 4px',
})
const LiTag = styled('li', {
  lineHeight: '22px',
  paddingRight: 10,
})
export default ImportTutorialCSV
