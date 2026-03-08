import { useTranslation } from 'react-i18next'
import { TiEye } from 'react-icons/ti'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import { Table, Td, Thead, TrBody, TrHead } from '@/components/Tables/Table'
import Text from '@/components/Texts/Text'
import Popover from '@/components/Tooltips/Popover'

const ConflictDataCell = ({
  dbDataFound,
}: {
  dbDataFound: Record<string, string>
}): JSX.Element => {
  const { t } = useTranslation()

  if (!dbDataFound) {
    return <></>
  }

  return (
    <>
      <Box padding="small" justify="flex-start">
        <Popover
          trigger={
            <div>
              <Button variants="subtle" size="small" iconAfter={<TiEye />}>
                <Text
                  css={{
                    display: 'block',
                  }}
                >
                  {t(`recordLogs:notificationLogs.cell.view`)}
                </Text>
              </Button>
            </div>
          }
        >
          <>
            <Box
              direction="column"
              padding="small"
              css={{ borderRadius: '$2' }}
            >
              <Text
                css={{
                  display: 'block',
                }}
              >
                {t('student:importCsv.dbDataFound')}
              </Text>
              <Table>
                <Thead>
                  <TrHead>
                    {Object.keys(dbDataFound).map(key => (
                      <th key={key}>
                        {t(
                          `student:importCsv.fields.${
                            key.charAt(0).toUpperCase() + key.slice(1)
                          }`
                        )}
                      </th>
                    ))}
                  </TrHead>
                </Thead>
                <tbody>
                  <TrBody>
                    {Object.values(dbDataFound).map(value => (
                      <Td key={value}>{value}</Td>
                    ))}
                  </TrBody>
                </tbody>
              </Table>
            </Box>
          </>
        </Popover>
      </Box>
    </>
  )
}

export default ConflictDataCell
