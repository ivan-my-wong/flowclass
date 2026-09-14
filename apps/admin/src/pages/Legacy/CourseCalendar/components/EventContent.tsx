import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'

interface EventContentDesktopProps {
  event: {
    extendedProps: {
      previewImageUrl: string
      courseName: string
      class: string
      id: number
      blockTime: boolean
      title: string
    }
  }
  timeText: string
}
const EventContentDesktop = (
  eventInfo: EventContentDesktopProps
): JSX.Element => {
  return (
    <Box direction="col" align="start" className="text-black" padding="base">
      {eventInfo.event?.extendedProps?.blockTime ? (
        <Box justify="center" align="center">
          Block Time
        </Box>
      ) : (
        <Text>{eventInfo.timeText}</Text>
      )}

      <Box className="flex-wrap" justify="start">
        <Text css={{ fontWeight: 'bold' }}>
          {eventInfo.event?.extendedProps?.courseName}
        </Text>
        <Text css={{ overflow: 'hidden' }} noWrap>
          {eventInfo.event?.extendedProps?.class}
        </Text>
      </Box>
    </Box>
  )
}

export default EventContentDesktop
