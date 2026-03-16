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

interface Props {
  open: boolean
  handleClose: () => void
}

const ImportTutorialCSV = ({ open, handleClose }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const leftHeaderContent = (
    <Box className="text-xl">{t('student:importCsv.title')}</Box>
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
        <Box direction="column" className="my-6">
          <Box
            className="bg-background-layer-3 rounded-md"
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
            <div className="leading-[22px]">
              1.{t('student:importCsv.step1')}
              <button
                type="button"
                onClick={() => navigate('/settings/student-information-field')}
                className="cursor-pointer text-primary px-1 bg-transparent border-0 font-inherit"
              >
                {t('student:importCsv.step11')}
              </button>
              {t('student:importCsv.step12')}
            </div>
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
                <TdPrepareTable>Alex</TdPrepareTable>
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
              <li className="leading-[22px] pr-2.5">
                {t('student:importCsv.prepare1')}
              </li>
              <li className="leading-[22px] pr-2.5">
                {t('student:importCsv.prepare2')}
              </li>
              <li className="leading-[22px] pr-2.5">
                {t('student:importCsv.prepare3')}
              </li>
            </ul>
          </Box>
          <Box
            className="bg-background-layer-3 rounded-md leading-5 font-bold"
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

export default ImportTutorialCSV
