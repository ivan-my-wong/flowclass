import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { format } from 'date-fns-tz'
import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LuArrowBigDown,
  LuCheck,
  LuClock,
  LuEye,
  LuTrash,
} from 'react-icons/lu'

import EditIcon from '@/assets/svgs/EditIcon'
import DropdownMenu, {
  DropDownMenuItemType,
} from '@/components/DropDownMenus/DropDownMenu'
import ImageAspect from '@/components/Images/ImageAspect'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import useCourseData from '@/hooks/useCourseData'
import useConfirm from '@/hooks/useGlobalConfirm'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import useSiteData from '@/hooks/useSiteData'
import MenuItem from '@/pages/FullCalendar/components/MenuItem'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { ClassTypeEnum } from '@/types/course'
import { ClassLessonType } from '@/types/lessonDateTime'
import { getMediaFileUrl } from '@/utils/generate-link.utils'

type PropType = {
  data: ClassLessonType
  instructorName?: string
  locationRoom?: string
  instructorOptions: { label: string; value: string }[]
  locationOptions: { label: string; value: string }[]
  onUpdateInstructor: (id: string) => void
  onUpdateLocation: (id: string) => void
  isUpdatingInstructor?: boolean
  isUpdatingLocation?: boolean
  isAboveInstructor?: boolean
}

// Reusable editable field component
function EditableField<T extends string>({
  label,
  value,
  options,
  editField,
  fieldKey,
  selectedValue,
  setEditField,
  setSelectedValue,
  onUpdate,
  isUpdating,
  placeholder,
  isEditable = true,
}: {
  label: string
  value: string | undefined
  options: { label: string; value: string }[]
  editField: T | null
  fieldKey: T
  selectedValue: string
  setEditField: Dispatch<SetStateAction<T | null>>
  setSelectedValue: (v: string) => void
  onUpdate: (v: string) => void
  isUpdating: boolean
  placeholder: string
  isEditable: boolean
}) {
  // If options is empty, just show plain text
  if (!options || options.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span>{label}: </span>
        <span>{value}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span>{label}: </span>
      {editField === fieldKey ? (
        <>
          <Select value={selectedValue} onValueChange={setSelectedValue}>
            <SelectTrigger className="w-fit">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options
                .filter(opt => opt.value !== '')
                .map(opt => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {isEditable && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => {
                onUpdate(selectedValue)
                setEditField(null)
              }}
            >
              <LuCheck size={20} />
            </button>
          )}
        </>
      ) : (
        <>
          <span>{value}</span>
          {isEditable && (
            <button
              type="button"
              onClick={() => {
                setEditField(fieldKey)
                const current = options.find(opt => opt.label === value)
                setSelectedValue(current?.value ?? options[0]?.value ?? '')
              }}
            >
              <EditIcon />
            </button>
          )}
        </>
      )}
    </div>
  )
}

const LessonDetailInfo = ({
  data,
  instructorName,
  locationRoom,
  instructorOptions,
  locationOptions,
  onUpdateInstructor,
  onUpdateLocation,
  isUpdatingInstructor = false,
  isUpdatingLocation = false,
  isAboveInstructor = false,
}: PropType): JSX.Element => {
  const { getCurrentSiteTimeZoneDate } = useSiteData()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { useDeleteLesson } = useLessonDateTimeData()
  const navigate = useNavigate()
  const baseUrl = useMemo(() => {
    return (searchParams.get('back') || `/full-calendar`).split('?')[0]
  }, [searchParams])
  const onBack = () => {
    navigate(`${baseUrl}?${searchParams}`)
  }
  const { mutateAsync: deleteLesson, isLoading: isDeleting } =
    useDeleteLesson(onBack)

  const { setConfirm, closeConfirm } = useConfirm(isDeleting)
  const { setCurrentCourse } = useCourseData()
  const onViewDetail = () => {
    setCurrentCourse(data.courseId)
    navigate(`/teaching-service/edit-course`)
  }

  const onChangeEntireLesson = () => {
    navigate(
      `${baseUrl}/lesson/${data.id}/update-time?${searchParams.toString()}`
    )
  }

  const onDelayFollowingLessons = () => {
    // We need to pass params (startDate, endDate) into url
    // Because after submit action we need to keep the calendar view
    // at that params and also to refetch the data that used on the calendar
    navigate(
      `${baseUrl}/lesson/${data.id}/delay-lessons?${searchParams.toString()}`
    )
  }

  const handleDelete = async () => {
    if (data) {
      await deleteLesson(data?.id)
      closeConfirm()
    }
  }
  const onDeleteTriggered = () => {
    setConfirm({
      title: t('lessonDateTime:dialog.titleDeleteDialog').toString(),
      description: t(
        'lessonDateTime:dialog:descriptionDeleteLesson'
      ).toString(),
      alertType: AlertTypes.WARN,
      cancelText: t('common:action.cancel').toString(),
      confirmText: t('common:action.confirm').toString(),
      onConfirm: handleDelete,
    }).open()
  }

  const isDisabledAction = useMemo(() => {
    return new Date() > new Date(data?.endTime?.toString())
  }, [data?.endTime])

  const isRecurringLesson = useMemo(() => {
    return (data?.type || data?.class?.type) === ClassTypeEnum.recurring
  }, [data?.class])

  const menuRowItems: DropDownMenuItemType[] = useMemo(() => {
    return [
      MenuItem({
        icon: <LuEye />,
        onClick: onViewDetail,
        text: t('lessonDateTime:action.viewDetail'),
      }),
      MenuItem({
        icon: <LuArrowBigDown />,
        onClick: onChangeEntireLesson,
        // disabled: isDisabledAction,
        text: t('lessonDateTime:action.changeEntireLesson'),
        tooltip: isDisabledAction
          ? (t('lessonDateTime:changeEntireLesson.tooltip') as string)
          : '',
      }),
      MenuItem({
        icon: <LuClock />,
        onClick: onDelayFollowingLessons,
        disabled: isDisabledAction || !isRecurringLesson,
        text: t('lessonDateTime:action.delayAllFollowingLesson'),
      }),
      MenuItem({
        icon: <LuTrash className="text-red-500" />,
        disabled: isDisabledAction,
        onClick: onDeleteTriggered,
        text: t('lessonDateTime:action.deleteClass'),
      }),
    ]
  }, [data, isDisabledAction])

  const [editField, setEditField] = useState<'instructor' | 'location' | null>(
    null
  )
  const [selectedInstructor, setSelectedInstructor] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')

  return (
    <div className="box-row-full bg-white rounded-md p-4">
      <div className="w-32">
        <ImageAspect
          width="100%"
          src={getMediaFileUrl(data.course?.previewImageUrl ?? '')}
          alt="alt"
        />
      </div>
      <div className="box-col-full ml-2 items-start">
        <span className="font-bold">{data.courseName}</span>
        <span className="text-sm"> {data.className}</span>

        <span className="text-sm">
          {`${format(
            getCurrentSiteTimeZoneDate(
              data.changeStartTime ?? data.startTime
            ) as Date,
            'yyyy/MM/dd hh:mm a'
          )} - ${format(
            getCurrentSiteTimeZoneDate(
              data.changeEndTime ?? data.endTime
            ) as Date,
            'yyyy/MM/dd hh:mm a'
          )}`}
        </span>

        <EditableField
          label={t('teachingService:basic.location')}
          value={locationRoom}
          options={locationOptions}
          editField={editField}
          fieldKey="location"
          selectedValue={selectedLocation}
          setEditField={setEditField}
          setSelectedValue={setSelectedLocation}
          onUpdate={onUpdateLocation}
          isUpdating={isUpdatingLocation}
          placeholder={t('teachingService:basic.selectLocation')}
          isEditable={isAboveInstructor}
        />
        <EditableField
          label={t('teachingService:basic.instructor')}
          value={instructorName}
          options={instructorOptions}
          editField={editField}
          fieldKey="instructor"
          selectedValue={selectedInstructor}
          setEditField={setEditField}
          setSelectedValue={setSelectedInstructor}
          onUpdate={onUpdateInstructor}
          isUpdating={isUpdatingInstructor}
          placeholder={t('teachingService:basic.selectInstructor')}
          isEditable={isAboveInstructor}
        />
      </div>
      {isAboveInstructor && (
        <DropdownMenu
          menuItems={menuRowItems}
          className="!text-2xl font-normal"
          contentProps={{
            width: '16rem',
            zIndex: 9999,
          }}
        />
      )}
    </div>
  )
}
export default LessonDetailInfo
