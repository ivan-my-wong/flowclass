import { useMemo } from 'react'

import { motion } from 'framer-motion'
import { t } from 'i18next'
import { BsFillCheckCircleFill } from 'react-icons/bs'
import { RxCross2 } from 'react-icons/rx'

import Spacer from '@/components/Separators/Spacer'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import useClassData from '@/hooks/useClassData'
import useCourseData from '@/hooks/useCourseData'

const CourseTask = (): JSX.Element => {
  const { courseData } = useCourseData()
  const { currentCourse } = courseData
  const { currentClass } = useClassData()

  const isCheckName = useMemo(
    () => !!currentCourse?.name,
    [currentCourse?.name]
  )
  const isCheckPath = useMemo(
    () => !!currentCourse?.path,
    [currentCourse?.path]
  )
  const isCheckPreviewImage = useMemo(
    () => !!currentCourse?.previewImageUrl,
    [currentCourse?.previewImageUrl]
  )
  const isCheckDescription = useMemo(() => {
    const noOfWords = currentCourse?.longDescriptions?.reduce(
      (acc, section) => {
        return acc + (section?.content?.length ?? 0)
      },
      0
    )

    return !!noOfWords && noOfWords > 200
  }, [currentCourse?.longDescriptions])
  const isCheckRegistrationMessage = useMemo(() => {
    return (
      !!currentCourse?.registrationMes &&
      currentCourse.registrationMes.length > 20
    )
  }, [currentCourse?.registrationMes])
  const isCheckPublish = useMemo(
    () => !!currentCourse?.published,
    [currentCourse?.published]
  )
  const isCheckCourseDetail = useMemo(() => {
    return !!currentCourse?.classes && currentCourse.classes.length > 0
  }, [currentCourse?.classes])

  const taskList = useMemo(
    () => [
      {
        taskName: t('teachingService:task.courseName'),
        isDone: isCheckName,
      },
      {
        taskName: t('teachingService:task.coursePath'),
        isDone: isCheckPath,
      },
      {
        taskName: t('teachingService:task.coursePreviewImage'),
        isDone: isCheckPreviewImage,
      },
      {
        taskName: t('teachingService:task.courseDescription'),
        isDone: isCheckDescription,
      },
      {
        taskName: t('teachingService:task.courseRegistrationMessage'),
        isDone: isCheckRegistrationMessage,
      },
      {
        taskName: t('teachingService:task.coursePublish'),
        isDone: isCheckPublish,
      },
      {
        taskName: t(`teachingService:task.${currentClass?.type}Detail`),
        isDone: isCheckCourseDetail,
      },
    ],
    [
      isCheckName,
      isCheckPath,
      isCheckPreviewImage,
      isCheckDescription,
      isCheckRegistrationMessage,
      isCheckPublish,
      currentClass?.type,
      isCheckCourseDetail,
    ]
  )

  return (
    <Box
      direction="col"
      align="start"
      className="w-full"
      padding="lg"
      id="floating-content"
    >
      <Text>{t('teachingService:task.title')}</Text>
      <motion.div
        initial={{ opacity: 0, y: '20%', x: '30%', filter: 'blur(10px)' }}
        animate={{
          opacity: 1,
          x: '0%',
          y: '0%',
          filter: 'blur(0px)',
        }}
        exit="hidden"
      >
        {/* // sort task list by isDone */}
        {taskList
          .sort((a, b) => {
            if (a.isDone === b.isDone) {
              return 0
            }
            if (a.isDone) {
              return 1
            }
            return -1
          })
          .map((task, index) => (
            <motion.div
              key={task.taskName}
              initial={{ opacity: 0, y: '20%', filter: 'blur(10px)' }}
              animate={{
                opacity: 1,
                x: '0%',
                y: '0%',
                filter: 'blur(0px)',
              }}
              transition={{ delay: index * 0.1 }}
            >
              <Spacer space="y2" />
              <Box align="center" justify="center" className="w-fit">
                {task.isDone ? (
                  <span className="text-success">
                    <BsFillCheckCircleFill color="currentColor" />
                  </span>
                ) : (
                  <span className="text-warn">
                    <RxCross2 color="currentColor" />
                  </span>
                )}
                <Text>{task.taskName}</Text>
              </Box>
            </motion.div>
          ))}
      </motion.div>
    </Box>
  )
}

export default CourseTask
