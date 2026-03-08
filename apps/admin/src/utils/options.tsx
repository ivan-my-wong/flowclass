import { LuCalendar } from 'react-icons/lu'
import { RiRefreshFill } from 'react-icons/ri'
import {
  SiElement,
  SiKakaotalk,
  SiLine,
  SiSignal,
  SiTelegram,
  SiWechat,
  SiWhatsapp,
} from 'react-icons/si'

import imageFailed from '@/assets/fallback/imageFailed.png'
import AppointmentIcon from '@/assets/svgs/courses/AppointmentIcon'
import RegularCourseIcon from '@/assets/svgs/courses/RegularCourseIcon'
import WorkshopIcon from '@/assets/svgs/courses/WorkshopIcon'
import SubscriptionIcon from '@/assets/svgs/SubscriptionIcon'
import SvgIcon from '@/components/Images/SvgIcon'
import { CourseSelectorItem } from '@/components/Selector/CourseSelector'
import { ClassTypeEnum, Course } from '@/types/course'
import { PhoneContactMethod } from '@/types/school'

export const getCourseIcon = (courseType: string): JSX.Element => {
  switch (courseType) {
    case ClassTypeEnum.regular:
      return (
        <SvgIcon size="small">
          <LuCalendar />
        </SvgIcon>
      )
    case ClassTypeEnum.regularV2:
      return (
        <SvgIcon size="small">
          <RegularCourseIcon />
        </SvgIcon>
      )
    case ClassTypeEnum.workshop:
      return (
        <SvgIcon size="small">
          <WorkshopIcon />
        </SvgIcon>
      )
    case ClassTypeEnum.recurring:
      return (
        <SvgIcon size="small">
          <RiRefreshFill fill="#13c931" />
        </SvgIcon>
      )
    case ClassTypeEnum.appointment:
      return (
        <SvgIcon size="small">
          <AppointmentIcon />
        </SvgIcon>
      )
    case ClassTypeEnum.subscription:
      return (
        <SvgIcon size="small">
          <SubscriptionIcon />
        </SvgIcon>
      )
    default:
      return (
        <SvgIcon size="small">
          <RegularCourseIcon />
        </SvgIcon>
      )
  }
}

export const courseListToCourseOptions = (
  courseList: Course[],
  showImage: boolean,
  withClasses?: boolean
): CourseSelectorItem[] => {
  return courseList
    .filter(course => course)
    .map(course => {
      const courseOption: CourseSelectorItem = {
        value: course.id.toString(),
        label: course.name || 'undefined',
        image: showImage ? course.previewImageUrl || imageFailed : undefined,
        // icon: getCourseIcon(course.type),
      }
      if (withClasses) {
        courseOption.classes = course.classes.map(d => ({
          value: d.id,
          label: d.name,
        }))
      }
      return courseOption
    })
}

export const courseListToElementOptions = (
  courseList: Course[],
  elementsList: { value: string; label: string }[]
): CourseSelectorItem[] => {
  const result: CourseSelectorItem[] = []
  courseList
    .filter(course => course)
    .forEach(course => {
      elementsList.forEach(element => {
        const isCourse = element.value.includes('{{coursePath}}')
        result.push({
          value: element.value.replace('{{coursePath}}', course.path || ''),
          label: isCourse ? `${element.label} - ${course.name}` : element.label,
          icon: <SiElement />,
        })
      })
    })

  return result
}

export const contactMethodIcon = (method: PhoneContactMethod): JSX.Element => {
  switch (method) {
    case PhoneContactMethod.WhatsApp:
      return (
        <SvgIcon size="smallMedium">
          <SiWhatsapp />
        </SvgIcon>
      )
    case PhoneContactMethod.Line:
      return (
        <SvgIcon size="smallMedium">
          <SiLine />
        </SvgIcon>
      )
    case PhoneContactMethod.KakaoTalk:
      return (
        <SvgIcon size="smallMedium">
          <SiKakaotalk />
        </SvgIcon>
      )
    case PhoneContactMethod.Signal:
      return (
        <SvgIcon size="smallMedium">
          <SiSignal />
        </SvgIcon>
      )
    case PhoneContactMethod.Wechat:
      return (
        <SvgIcon size="smallMedium">
          <SiWechat />
        </SvgIcon>
      )
    case PhoneContactMethod.Telegram:
      return (
        <SvgIcon size="smallMedium">
          <SiTelegram />
        </SvgIcon>
      )
    default:
      return <></>
  }
}

export const getGrowthRateBGColor = (growthRate: string): string => {
  const rate = parseFloat(growthRate)
  if (Number.isNaN(rate)) return ''
  if (rate < 0) return '$warnSubtle'
  if (rate > 0) return '$successSubtle'
  return ''
}

export const getGrowthRateColor = (growthRate: string): string => {
  const rate = parseFloat(growthRate)
  if (Number.isNaN(rate)) return ''
  if (rate < 0) return '$warn'
  if (rate > 0) return '$success'
  return ''
}
