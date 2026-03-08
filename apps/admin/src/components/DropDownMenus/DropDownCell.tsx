import { useTranslation } from 'react-i18next'
import { RiArrowDropDownLine } from 'react-icons/ri'

import Button from '../Buttons/Button'
import Box from '../Containers/Box'
import { RadioItemProps } from '../RadioGroup/RadioButtonGroup'
import Text from '../Texts/Text'
import Popover from '../Tooltips/Popover'

interface DropDownCellProps {
  mainText: string
  items: RadioItemProps[]
}

const DropDownCell: React.FC<DropDownCellProps> = ({ mainText, items }) => {
  const { t } = useTranslation()

  return (
    <Box justify="flex-start">
      <Popover
        trigger={
          <div>
            <Button
              variants="subtle"
              size="small"
              iconAfter={<RiArrowDropDownLine />}
            >
              <Text css={{ display: 'block', color: '$text' }}>{mainText}</Text>
            </Button>
          </div>
        }
      >
        <Box gap="none" direction="column" css={{ width: '350px' }}>
          {items.map((item, index) => (
            <Box
              key={index}
              css={{
                border: '1px solid $borderColor',
                borderBottom: index < items.length - 1 ? 'none' : undefined,
              }}
            >
              <Text
                css={{
                  borderRight: '1px solid $borderColor',
                  minWidth: '30%',
                  padding: '$2',
                  alignSelf: 'stretch',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                {t(item.label as string)}
              </Text>
              <Box
                css={{
                  padding: '$2',
                  flexDirection: 'column',
                  maxWidth: 500,
                  overflowX: 'auto',
                }}
              >
                {Array.isArray(item.value) ? (
                  item.value.map((dateTime, idx) => (
                    <Text
                      key={idx}
                      css={{
                        marginBottom:
                          Array.isArray(item.value) &&
                          idx < item.value.length - 1
                            ? '$1'
                            : 0,
                      }}
                    >
                      {dateTime}
                    </Text>
                  ))
                ) : (
                  <Text className="pl-2">{item.value}</Text>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Popover>
    </Box>
  )
}

export default DropDownCell
