import { useTranslation } from 'react-i18next'
import { TiEye } from 'react-icons/ti'

import Button from '@/components/Buttons/Button'
import Popover from '@/components/Tooltips/Popover'
import Box from '@/components/ui/Box'
import Text from '@/components/ui/Text'
import { replaceLinksWithAnchorTags } from '@/utils/string'

const MessageSentCell = ({ message }: { message: string }): JSX.Element => {
  const { t } = useTranslation()

  if (!message) {
    return <></>
  }

  return (
    <>
      <Box className="p-4" justify="start">
        <Popover
          trigger={
            <div>
              <Button variants="subtle" size="small" iconAfter={<TiEye />}>
                <Text className="block">
                  {t(`recordLogs:notificationLogs.cell.view`)}
                </Text>
              </Button>
            </div>
          }
        >
          <Box
            className="!max-w-96 !text-wrap whitespace-pre-wrap p-2 rounded-md"
            direction="col"
          >
            <Text
              className="w-full overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: replaceLinksWithAnchorTags(message),
              }}
            />
          </Box>
        </Popover>
      </Box>
    </>
  )
}

export default MessageSentCell
