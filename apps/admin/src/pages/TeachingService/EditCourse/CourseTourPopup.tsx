import { StepType } from '@reactour/tour'
import { t } from 'i18next'
import { IoMdFlag } from 'react-icons/io'

import addClassImage from '@/assets/tour/course/addClass.gif'
import addPhaseImage from '@/assets/tour/course/addPhase.gif'
import classNameImage from '@/assets/tour/course/className.gif'
import courseBannerImage from '@/assets/tour/course/courseBanner.gif'
import courseNameImage from '@/assets/tour/course/courseName.gif'
import coursePageImage from '@/assets/tour/course/coursePage.gif'
import coursePathImage from '@/assets/tour/course/coursePath.gif'
import coursePriceImage from '@/assets/tour/course/coursePrice.gif'
import enrolmentMessageImage from '@/assets/tour/course/enrolmentMessage.gif'
import firstLessonImage from '@/assets/tour/course/firstLesson.gif'
import publishCourseImage from '@/assets/tour/course/publishCourse.gif'
import selectClassImage from '@/assets/tour/course/selectClass.gif'
import descriptionEditorImage from '@/assets/tour/school/descriptionEditor.gif'
import descriptionLabelImage from '@/assets/tour/school/descriptionLabel.gif'
import Text from '@/components/Texts/Text'
import TourContent from '@/components/Tour/TourContent'
import { ClassTypeEnum } from '@/types/course'

export const getBasicTourSteps = (): StepType[] => {
  return [
    {
      selector: '#course-name-container',
      content: (
        <TourContent
          imageSrc={courseNameImage}
          imageAlt="courseNameImage"
          text={t('teachingService:tourStep.name')}
        />
      ),
    },
    {
      selector: '#course-path-container',
      content: (
        <TourContent
          imageSrc={coursePathImage}
          imageAlt="coursePathImage"
          text={t('teachingService:tourStep.path')}
        />
      ),
    },
    {
      selector: '#course-previewImageUrl-container',
      content: (
        <TourContent
          imageSrc={courseBannerImage}
          imageAlt="courseBannerImage"
          text={t('teachingService:tourStep.previewImage')}
        />
      ),
    },
  ]
}

export const getDescriptionTourSteps = (): StepType[] => {
  return [
    {
      selector: '#leftColumn',
      content: (
        <TourContent
          imageSrc={descriptionLabelImage}
          imageAlt="descriptionLabelImage"
          text={[
            t('teachingService:tourStep.descriptionSection'),
            t('teachingService:tourStep.descriptionSection2'),
          ]}
        />
      ),
    },
    {
      selector: '#textEditor',
      content: (
        <TourContent
          imageSrc={descriptionEditorImage}
          imageAlt="descriptionEditorImage"
          text={t('teachingService:tourStep.textEditor')}
        />
      ),
    },
  ]
}

// steps for a class not created yet
export const getCourseDetailSteps = (classType: ClassTypeEnum): StepType[] => {
  switch (classType) {
    case ClassTypeEnum.regular:
      return getClassSteps()
    case ClassTypeEnum.appointment:
      return []
    case ClassTypeEnum.workshop:
      return []
    default:
      return []
  }
}

export const getClassSteps = (): StepType[] => {
  return [
    {
      selector: '#noClassContainer',
      content: (
        <TourContent
          imageSrc={selectClassImage}
          imageAlt="selectClassImage"
          text={t('teachingService:tourStep.noClassYet')}
        />
      ),
    },
  ]
}

// steps for a class already created
export const getCreatedClassSteps = (): StepType[] => {
  return [
    {
      selector: '#leftColumn',
      content: (
        <TourContent
          imageSrc={addClassImage}
          imageAlt="addClassImage"
          text={t('teachingService:tourStep.classColumn')}
        />
      ),
    },
    {
      selector: '#className',
      content: (
        <TourContent
          imageSrc={classNameImage}
          imageAlt="classNameImage"
          text={[
            t('teachingService:tourStep.className'),
            t('teachingService:tourStep.className2'),
          ]}
        />
      ),
    },
    {
      selector: '#classTuition',
      content: (
        <TourContent
          imageSrc={coursePriceImage}
          imageAlt="coursePriceImage"
          text={[
            t('teachingService:tourStep.classTuition'),
            t('teachingService:tourStep.classTuition2'),
          ]}
        />
      ),
    },
    {
      selector: '#classQuota',
      content: <TourContent text={t('teachingService:tourStep.classQuota')} />,
    },
    {
      selector: '#classScheduleLesson',
      highlightedSelectors: ['#classScheduleHeading', '#classSchedule'],
      content: (
        <TourContent
          imageSrc={addPhaseImage}
          imageAlt="addPhaseImage"
          text={[
            t('teachingService:tourStep.classSchedule'),
            t('teachingService:tourStep.classSchedule2'),
            t('teachingService:tourStep.classSchedule3'),
          ]}
        />
      ),
    },
    {
      selector: '#classScheduleLesson',
      content: (
        <TourContent
          imageSrc={firstLessonImage}
          imageAlt="firstLessonImage"
          text={t('teachingService:tourStep.classCalendar')}
        />
      ),
    },
  ]
}

export const getMessageTourSteps = (): StepType[] => {
  return [
    {
      selector: '#textEditor',
      content: (
        <TourContent
          imageSrc={enrolmentMessageImage}
          imageAlt="enrolmentMessageImage"
          text={[
            t('teachingService:tourStep.messageTabTextEditor'),
            t('teachingService:tourStep.messageTabTextEditor2'),
          ]}
        />
      ),
    },
  ]
}

const getStartTourSteps = (openFloatingButton: () => void): StepType[] => {
  return [
    {
      selector: 'root',
      position: 'center',
      content: (
        <TourContent
          customContent={
            <>
              <Text>🎉🎉{t('teachingService:tourStep.welcome')}🎊🎊</Text>
              <Text>{t('teachingService:tourStep.welcomeContent')}</Text>
            </>
          }
        />
      ),
    },
    {
      selector: '#tourGuide',
      content: (
        <TourContent
          customContent={
            <Text>
              {t('teachingService:tourStep.clickGuide')} <IoMdFlag />{' '}
              {t('teachingService:tourStep.clickGuideContent')}
            </Text>
          }
        />
      ),
      actionAfter: () => {
        openFloatingButton()
      },
    },
    {
      selector: '#floating-button',
      content: (
        <TourContent
          imageSrc={coursePageImage}
          imageAlt="coursePageImage"
          text={t('teachingService:tourStep.floatingButton')}
        />
      ),
    },
    {
      selector: '#floating-content',
      content: (
        <TourContent text={t('teachingService:tourStep.floatingContent')} />
      ),
      actionAfter: () => {
        openFloatingButton()
      },
    },
  ]
}

const getFinishTourSteps = (): StepType[] => {
  return [
    {
      selector: '#publish-course-button',
      content: (
        <TourContent
          imageSrc={publishCourseImage}
          imageAlt="publishCourseImage"
          text={t('teachingService:tourStep.publishCourse')}
        />
      ),
    },
    {
      selector: 'root',
      position: 'center',
      content: (
        <TourContent
          customContent={
            <>
              <Text>
                🎉🎉{t('teachingService:tourStep.congratulations')}🎊🎊
              </Text>
              <Text>
                {t('teachingService:tourStep.congratulationsContent')}
              </Text>
            </>
          }
        />
      ),
    },
    {
      selector: '#tourGuide',
      content: (
        <TourContent
          customContent={
            <Text>
              <Text>{t('teachingService:tourStep.clickGuide')}</Text>{' '}
              <IoMdFlag /> {t('teachingService:tourStep.clickGuideContent')}
            </Text>
          }
        />
      ),
    },
  ]
}

// root step because it gave time for the page to load
// if the tour starts from different tab
// the page will not load fast enough to for selector to find the element
// so an extra step is needed to wait for the page to load
const switchToDescriptionTab = (
  action: (tabValue: string) => void
): StepType[] => {
  return [
    {
      selector: 'root',
      position: 'center',
      content: (
        <TourContent text={t('teachingService:tourStep.descriptionTab')} />
      ),
      action: () => {
        action('description')
      },
    },
  ]
}

const switchToCourseDetailTab = (
  action: (tabValue: string) => void,
  courseType: ClassTypeEnum
): StepType[] => {
  return [
    {
      selector: 'root',
      position: 'center',
      content: (
        <TourContent text={t('teachingService:tourStep.courseDetailTab')} />
      ),
      action: () => {
        switch (courseType) {
          case ClassTypeEnum.regular:
            return action('class')
          case ClassTypeEnum.appointment:
            return action('feeNTime')
          case ClassTypeEnum.workshop:
            return action('session')
          default:
            return ''
        }
      },
    },
  ]
}

const switchToMessageTab = (action: (tabValue: string) => void): StepType[] => {
  return [
    {
      selector: 'root',
      position: 'center',
      content: <TourContent text={t('teachingService:tourStep.messageTab')} />,
      action: () => {
        action('message')
      },
    },
  ]
}

export const getFullCourseTourSteps = (
  changeTab: (tabValue: string) => void,
  openFloatingButton: () => void,
  courseType: ClassTypeEnum
): StepType[] => {
  return [
    ...getStartTourSteps(openFloatingButton),
    ...getBasicTourSteps(),
    ...switchToDescriptionTab(changeTab),
    ...getDescriptionTourSteps(),
    ...switchToCourseDetailTab(changeTab, courseType),
    ...getCourseDetailSteps(courseType),
    ...switchToMessageTab(changeTab),
    ...getMessageTourSteps(),
    ...getFinishTourSteps(),
  ]
}
