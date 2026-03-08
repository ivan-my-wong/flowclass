import { useMemo } from 'react'

import { motion } from 'framer-motion'
import { t } from 'i18next'
import { BsFillCheckCircleFill } from 'react-icons/bs'
import { RxCross2 } from 'react-icons/rx'

import Box from '../../components/Containers/Box'
import Spacer from '../../components/Separators/Spacer'
import Text from '../../components/Texts/Text'
import useSchoolData from '../../hooks/useSchoolData'

// type SchoolTaskProps = {
//   content?: JSX.Element
// }

export const SchoolTask = (): JSX.Element => {
  const { schoolData } = useSchoolData()
  const { currentSchool } = schoolData

  const checkSchoolName = useMemo(
    () => !!currentSchool?.name,
    [currentSchool?.name]
  )
  const checkSchoolLogo = useMemo(
    () => !!currentSchool?.logo,
    [currentSchool?.logo]
  )
  const checkSchoolBanner = useMemo(
    () => !!currentSchool?.bannerImage,
    [currentSchool?.bannerImage]
  )
  const checkSchoolDescription = useMemo(() => {
    if (!currentSchool?.description || currentSchool.description.length === 0) {
      return false
    }

    let noOfWords = 0
    currentSchool?.description?.forEach(section => {
      noOfWords += section?.content?.length
    })

    if (noOfWords > 200) {
      return true
    }
    return false
  }, [currentSchool?.description])
  const checkSchoolPhone = useMemo(
    () => !!currentSchool?.phone,
    [currentSchool?.phone]
  )
  const checkSchoolEmail = useMemo(
    () => !!currentSchool?.email,
    [currentSchool?.email]
  )
  const checkSchoolAddress = useMemo(
    () => !!currentSchool?.address,
    [currentSchool?.address]
  )
  const checkSchoolGalleries = useMemo(() => {
    return (
      Array.isArray(currentSchool?.galleries) &&
      currentSchool?.galleries.length !== undefined &&
      currentSchool?.galleries.length >= 3
    )
  }, [currentSchool?.galleries])

  const taskList = useMemo(
    () => [
      {
        taskName: t('school:task.schoolName'),
        isDone: checkSchoolName,
      },
      {
        taskName: t('school:task.schoolLogo'),
        isDone: checkSchoolLogo,
      },
      {
        taskName: t('school:task.schoolBanner'),
        isDone: checkSchoolBanner,
      },
      {
        taskName: t('school:task.schoolDescription'),
        isDone: checkSchoolDescription,
      },
      {
        taskName: t('school:task.schoolPhone'),
        isDone: checkSchoolPhone,
      },
      {
        taskName: t('school:task.schoolEmail'),
        isDone: checkSchoolEmail,
      },
      {
        taskName: t('school:task.schoolAddress'),
        isDone: checkSchoolAddress,
      },
      {
        taskName: t('school:task.schoolGallery'),
        isDone: checkSchoolGalleries,
      },
    ],
    [
      checkSchoolName,
      checkSchoolLogo,
      checkSchoolBanner,
      checkSchoolDescription,
      checkSchoolPhone,
      checkSchoolEmail,
      checkSchoolAddress,
      checkSchoolGalleries,
    ]
  )

  return (
    <Box
      direction="column"
      align="flex-start"
      className="w-full"
      padding="medium"
      id="floating-content"
    >
      <Text>{t('school:task.title')}</Text>
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
                <div>{task.taskName}</div>
              </Box>
            </motion.div>
          ))}
      </motion.div>
    </Box>
  )
}
