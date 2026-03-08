import ImageAspect from '@/components/Images/ImageAspect'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'

interface EventContentMobileProps {
  event: {
    extendedProps: {
      previewImageUrl: string
      courseName: string
      class: string
    }
  }
  timeText: string
}

const EventContentMobile = (
  eventInfo: EventContentMobileProps
): JSX.Element => {
  return (
    <Box
      // direction="column"
      align="center"
      justify="center"
      padding="base"
      className="w-full h-full text-black"
    >
      <ImageAspect
        // ratio={1081 / 164}
        width="5rem"
        src={eventInfo.event?.extendedProps?.previewImageUrl}
        alt={eventInfo.event?.extendedProps?.courseName}
      />
      <Box direction="col" align="start" gap="0" className="pl-1">
        <Text css={{ fontWeight: '500', fontSize: '1rem' }}>
          {eventInfo.event?.extendedProps?.courseName}
        </Text>
        <Text css={{ fontWeight: '500' }}>
          {eventInfo.event?.extendedProps?.class}
        </Text>
      </Box>
    </Box>
  )
}
export default EventContentMobile
