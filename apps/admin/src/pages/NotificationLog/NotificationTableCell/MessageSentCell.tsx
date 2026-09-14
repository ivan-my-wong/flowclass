import { useTranslation } from 'react-i18next'
import { TiEye } from 'react-icons/ti'

import Button from '@/components/Buttons/Button'
import Popover from '@/components/Tooltips/Popover'
import Box from '@/components/ui/Box'
import Text from '@/components/ui/Text'
import { replaceLinksWithAnchorTags } from '@/utils/string'

interface MessageSentCellProps {
  message?: string
  subject?: string
  status?: string
}

const MessageSentCell = ({
  message,
  subject,
  status,
}: MessageSentCellProps): JSX.Element => {
  const { t } = useTranslation()

  const isFailed = status === 'FAILED'
  const displayContent =
    isFailed && message && subject && message !== subject
      ? `${subject}\n\n[Error Details]:\n${message}`
      : subject || message || ''

  if (!displayContent) {
    return <span>-</span>
  }

  return (
    <>
      <Box className="p-4" justify="start">
        <Popover
          trigger={
            <div>
              <Button
                variants="subtle"
                className={isFailed ? 'text-red-500 hover:text-red-600' : ''}
                size="small"
                iconAfter={<TiEye />}
              >
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
            {isFailed && (
              <Text className="text-red-500 font-semibold mb-1 block">
                Delivery Failed
              </Text>
            )}
            <Text
              className="w-full overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: replaceLinksWithAnchorTags(displayContent),
              }}
            />
          </Box>
        </Popover>
      </Box>
    </>
  )
}

export default MessageSentCell
