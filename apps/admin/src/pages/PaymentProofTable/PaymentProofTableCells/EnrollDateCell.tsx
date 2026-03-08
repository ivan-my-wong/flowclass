import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import Text from '@/components/Texts/Text'
import Popover from '@/components/Tooltips/Popover'
import { StudentLesson, StudentSchedule } from '@/types/student'
import { getLessonDateTime } from '@/utils/timeFormat'

const EnrollDateCell = ({
  studentSchedule,
}: {
  studentSchedule: StudentSchedule[]
}) => {
  const { t } = useTranslation()

  if (!studentSchedule) {
    return <></>
  }

  return (
    <>
      <Box padding="small">
        <Popover
          trigger={
            <div>
              <Button size="small" css={{ color: 'white' }}>
                <Text
                  css={{
                    display: 'block',
                  }}
                >
                  {t(`student:clickToView`)}
                </Text>
              </Button>
            </div>
          }
        >
          <>
            {studentSchedule.map(schedule => {
              const lessonsList = schedule.studentLessons

              return (
                // eslint-disable-next-line react/no-array-index-key
                <Box
                  direction="column"
                  key={schedule.id}
                  padding="medium"
                  css={{ borderRadius: '$2', border: '1px solid $textSubtle' }}
                >
                  {lessonsList.map((lesson: StudentLesson, index: number) => {
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <Fragment key={index}>
                        <Text>
                          {getLessonDateTime(
                            lesson.startTime,
                            lesson.endTime,
                            t
                          )}
                        </Text>
                      </Fragment>
                    )
                  })}
                </Box>
              )
            })}
          </>
        </Popover>
      </Box>
    </>
  )
}

export default EnrollDateCell
