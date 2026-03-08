import React, { useEffect, useState } from 'react'

import dayjs from 'dayjs'
import { t } from 'i18next'

import { UserSettingIcon } from '@/assets/svgs/common'
import { RecordLogType, TimeFormat } from '@/constants/common'
import { generateChangeString } from '@/utils/string'

type Props = {
  item: any
  personalName: string
}

type Content = {
  activityDateTime: string
  icon: JSX.Element
  content: JSX.Element | string
}

const BoxActivity = ({ item, personalName }: Props): JSX.Element => {
  const [content, setContent] = useState<Content>()

  const formatDate = (start: string, end: string) => {
    return `${dayjs(start).format('DD/MM/YYYY HH:mm')}-${dayjs(end).format(
      'HH:mm'
    )}`
  }

  const contentReScheduleLesson = (item: any) => {
    return (
      <>
        <p className="font-bold">{`${item?.educatorFirstName} changes lesson for ${personalName}`}</p>
        <p>{`Previous course: ${item?.oldCourseName}, Class: ${
          item?.oldClassName
        }, Lesson: ${formatDate(item?.oldStartTime, item?.oldEndTime)}`}</p>

        <p>{`New course: ${item?.newCourseName}, Class: ${
          item?.newClassName
        }, Lesson: ${formatDate(
          item?.classLessonStartTime,
          item?.classLessonEndTime
        )}`}</p>
      </>
    )
  }

  useEffect(() => {
    switch (item?.type) {
      // STUDENT_CHANGE_INFOMATION
      case RecordLogType.STUDENT_CHANGE_INFOMATION:
        setContent({
          activityDateTime: item?.detail?.modifiedDate,
          icon: <UserSettingIcon />,
          content: (
            <>
              <p className="font-bold">
                {`${item?.detail?.changeBy?.firstName} ${t(
                  'student:activity.changes'
                )} ${personalName}`}
              </p>
              <p>
                {generateChangeString(item?.detail?.olds, item?.detail?.fields)}
              </p>
            </>
          ),
        })
        break
      // CREATE_COUPON
      case RecordLogType.CREATE_COUPON:
        setContent({
          activityDateTime: item?.detail?.modifiedDate,
          icon: <UserSettingIcon />,
          content: `${item.detail.educatorName} ${t(
            'student:activity.createdCoupon'
          )} ${item.detail.couponCode} ${t(
            'student:activity.for'
          )} ${personalName}`,
        })
        break
      // DELETE_COUPON
      case RecordLogType.DELETE_COUPON:
        setContent({
          activityDateTime: item?.detail?.modifiedDate,
          icon: <UserSettingIcon />,
          content: `${item?.detail?.deleteBy?.name} ${
            item.detail.couponCode
          } ${t('student:activity.for')}`,
        })
        break
      // RESCHEDULE_LESSON
      case RecordLogType.RESCHEDULE_LESSON:
        setContent({
          activityDateTime: item?.detail?.modifiedDate,
          icon: <UserSettingIcon />,
          content: contentReScheduleLesson(item?.detail),
        })
        break
      // ADDING_CLASS
      case RecordLogType.ADDING_CLASS:
        setContent({
          activityDateTime: item?.detail?.modifiedDate,
          icon: <UserSettingIcon />,
          content: (
            <>
              <p className="font-bold">{`${item?.detail?.educatorFirstName} enrols ${personalName} in course (${item?.detail.courseName})`}</p>
              <p>{`Class: ${item?.detail.className}, Lesson: ${dayjs(
                item?.detail.firstLessonDate
              ).format(TimeFormat.DD_MM_YYYY_DEFAULT)}-${dayjs(
                item?.detail.lastLessonDate
              ).format(TimeFormat.DD_MM_YYYY_DEFAULT)}`}</p>
            </>
          ),
        })
        break
      case RecordLogType.USAGE_COUPON:
        setContent({
          activityDateTime: item?.detail?.modifiedDate,
          icon: <UserSettingIcon />,
          content: `${item?.detail?.studentName} ${t(
            'student:activity.usedCoupon'
          )} ${item.detail.couponCode} for ${item.detail.courseName}. Status: ${
            item.detail.usedStatus
          }`,
        })
        break
      case RecordLogType.CONFIRM_USAGE_COUPON:
        setContent({
          activityDateTime: item?.detail?.modifiedDate,
          icon: <UserSettingIcon />,
          content: `${item?.detail?.studentName} ${t(
            'student:activity.usedCoupon'
          )} ${item.detail.couponCode} for ${item.detail.courseName}. Status: ${
            item.detail.usedStatus
          }`,
        })
        break
      default:
        break
    }
  }, [item, personalName])

  return (
    <div
      key={`${item.id}`}
      className="w-full border-b border-[#BFBFBF] pb-[15px] mb-[15px]"
    >
      <div className="flex justify-between items-center h-[45px] px-2.5">
        <div className="flex items-center gap-3">
          <div className="w-[33px] h-[33px] [&_img]:w-full [&_img]:h-full [&_img]:object-contain">
            {content?.icon}
          </div>
          <div className="text-base font-normal text-[#404040]">
            {dayjs(content?.activityDateTime).format(
              TimeFormat.activityDateTime
            )}
          </div>
        </div>
      </div>
      <div>{content?.content}</div>
    </div>
  )
}

export default BoxActivity
