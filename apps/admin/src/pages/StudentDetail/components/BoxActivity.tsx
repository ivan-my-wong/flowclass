import React, { useEffect, useState } from 'react'

import dayjs from 'dayjs'
import { t } from 'i18next'

import { UserSettingIcon } from '@/assets/svgs/common'
import { RecordLogType, TimeFormat } from '@/constants/common'
import { styled } from '@/styles'
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
    <Item key={`${item.id}`}>
      <Top>
        <TopLeft>
          <Icon>{content?.icon}</Icon>
          <Text>
            {dayjs(content?.activityDateTime).format(
              TimeFormat.activityDateTime
            )}
          </Text>
        </TopLeft>
      </Top>
      <div>{content?.content}</div>
    </Item>
  )
}

const Item = styled('div', {
  width: '100%',
  borderBottom: '1px solid #BFBFBF',
  paddingBottom: 15,
  marginBottom: 15,
})

const Top = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: 45,
  padding: '0 10px',
})
const TopLeft = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
})
const Icon = styled('div', {
  width: 33,
  height: 33,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
})

const Text = styled('div', {
  fontSize: 16,
  fontWeight: 400,
  color: '#404040',
})

export default BoxActivity
