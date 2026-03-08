import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuCalendar, LuHelpCircle } from 'react-icons/lu'
import { RiRefreshFill } from 'react-icons/ri'
import { useQueryClient } from 'react-query'

import AppointmentIcon from '@/assets/svgs/courses/AppointmentIcon'
import RegularCourseIcon from '@/assets/svgs/courses/RegularCourseIcon'
import WorkshopIcon from '@/assets/svgs/courses/WorkshopIcon'
import SubscriptionIcon from '@/assets/svgs/SubscriptionIcon'
import SvgIcon from '@/components/Images/SvgIcon'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Text from '@/components/ui/Text'
import { QUERY_KEY } from '@/constants/queryKey'
import useClassData from '@/hooks/useClassData'
import useCourseData from '@/hooks/useCourseData'
import ContentLayout from '@/layouts/ContentLayout'
import { ClassTypeEnum } from '@/types/course'
import { cn } from '@/utils/cn'

import ClassTypeFinderModal from './Dialogs/ClassTypeFinderModal'
import TransitioningRegularClassPopup from './Dialogs/TransitioningRegularClassPopup'
import AddClassModal, { AddClassModalHandle } from './CreateClassModal'

export type ClassTypeCardProps = {
  courseType: ClassTypeEnum
  icon: React.ReactNode
  disabled?: boolean
  cardClassName?: string
  isNew?: boolean
}

export type SelectClassTypeProps = {
  label?: string
  selectedValue?: ClassTypeEnum | string
  handleValueChange?: (value: ClassTypeEnum | string) => void
  optionMode?: boolean
  className?: string
  cardClassName?: string
}

const SelectClassType = ({
  label,
  selectedValue,
  handleValueChange,
  optionMode = false,
  className,
  cardClassName,
}: SelectClassTypeProps): JSX.Element => {
  const [createCourseType, setCreateCourseType] = useState<ClassTypeEnum>(
    ClassTypeEnum.regular
  )
  const navigate = useNavigate()
  const addClassModalHandle = useRef<AddClassModalHandle>(null)
  const { courseData } = useCourseData()
  const { replaceAllClasses } = useClassData()
  const { t } = useTranslation()
  const [
    showTransitioningRegularClassPopup,
    setShowTransitioningRegularClassPopup,
  ] = useState(false)
  const [showClassTypeFinder, setShowClassTypeFinder] = useState(false)
  const [searchParams] = useSearchParams()

  const queryClient = useQueryClient()

  const openModal = () => {
    addClassModalHandle.current?.handleOpenChange?.()
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('teachingService:allCourses'),
    mode: 'add',
  }

  const cardBoxs: ClassTypeCardProps[] = [
    {
      courseType: ClassTypeEnum.regularV2,
      icon: <RegularCourseIcon />,
      isNew: true,
    },

    {
      courseType: ClassTypeEnum.recurring,
      icon: <RiRefreshFill fill="#13c931" />,
    },
    {
      courseType: ClassTypeEnum.appointment,
      icon: <AppointmentIcon />,
    },

    {
      courseType: ClassTypeEnum.workshop,
      icon: <WorkshopIcon />,
    },
    {
      courseType: ClassTypeEnum.subscription,
      icon: <SubscriptionIcon />,
    },

    {
      courseType: ClassTypeEnum.regular,
      icon: <LuCalendar />,
      disabled: true,
    },
  ]

  useEffect(() => {
    if (searchParams.get('classType')) {
      setCreateCourseType(searchParams.get('classType') as ClassTypeEnum)
      openModal()
      searchParams.delete('classType')
    }
  }, [searchParams])

  const handleCardClick = (courseType: ClassTypeEnum) => {
    if (handleValueChange) {
      handleValueChange(courseType)
    }

    if (!optionMode) {
      setCreateCourseType(courseType)
      openModal()
    }
  }

  const renderCardBox = ({
    courseType,
    icon,
    disabled,
    cardClassName,
    isNew,
  }: ClassTypeCardProps) => {
    if (disabled) {
      return (
        <Card
          className={cn(
            'p-10 flex flex-col items-start gap-6 relative bg-gray-50 border-0 shadow-sm cursor-pointer w-full'
          )}
          key={courseType}
          onClick={() => {
            if (courseType === ClassTypeEnum.regular) {
              setShowTransitioningRegularClassPopup(true)
            } else {
              handleCardClick(courseType)
            }
          }}
        >
          {/* <Badge className="absolute right-4 top-4" variant="destructive">
            {t('teachingService:classTypeBadge.phasingOut')}
          </Badge> */}
          <SvgIcon size="extraLarge">{icon}</SvgIcon>
          <Text bold className="text-lg">
            {t(`teachingService:courseType.${courseType}`)}
          </Text>
          <Text>{t(`teachingService:courseDescription.${courseType}`)}</Text>
        </Card>
      )
    }

    const isSelected = selectedValue === courseType

    return (
      <Card
        className={cn(
          'p-10 flex flex-col items-start gap-6 rounded-lg cursor-pointer border-0 shadow-sm transition-all duration-200',
          isSelected
            ? 'bg-primary/10 ring-2 ring-primary'
            : 'bg-gray-50 hover:bg-gray-100'
        )}
        onClick={() => handleCardClick(courseType)}
        key={courseType}
        data-testid={courseType}
      >
        {isNew && (
          <Badge className="absolute right-4 top-4 bg-primary/90 animate-[bounce-subtle_2s_ease-in-out_infinite,color-cycle_6s_ease-in-out_infinite]">
            New!
          </Badge>
        )}
        <SvgIcon size="extraLarge">{icon}</SvgIcon>
        <Text bold className="text-lg">
          {t(`teachingService:courseType.${courseType}`)}
        </Text>
        <Text>{t(`teachingService:courseDescription.${courseType}`)}</Text>
      </Card>
    )
  }

  return (
    <ContentLayout headerBackButton={headerBackButton}>
      {/* Class Type Finder Button */}
      <div className="p-4 box-col-full">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg w-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {t('teachingService:classTypeFinder.notSureTitle')}
              </h3>
              <p className="text-gray-600">
                {t('teachingService:classTypeFinder.notSureDescription')}
              </p>
            </div>
            <Button
              onClick={() => setShowClassTypeFinder(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <LuHelpCircle className="w-4 h-4" />
              {t('teachingService:classTypeFinder.findMyClassType')}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
            className
          )}
        >
          {cardBoxs.map(cardbox =>
            renderCardBox({ ...cardbox, cardClassName })
          )}
        </div>
      </div>
      <AddClassModal
        ref={addClassModalHandle}
        classType={createCourseType}
        onCreateClassSuccess={classes => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEY.course.getCourseAllClassesKey],
          })

          replaceAllClasses([
            ...(courseData.currentCourse?.classes ?? []),
            classes,
          ])

          // setCurrentClass(classes.id)
          navigate('/teaching-service/edit-course?tab=class', {
            state: {
              selectedClassId: classes.id,
            },
          })
        }}
        hidden
      />
      <TransitioningRegularClassPopup
        showTransitioningRegularClassPopup={showTransitioningRegularClassPopup}
        setShowTransitioningRegularClassPopup={
          setShowTransitioningRegularClassPopup
        }
        onActionClick={() => {
          handleCardClick(ClassTypeEnum.regularV2)
        }}
        isLoading={false}
        onCloseClick={() => {
          handleCardClick(ClassTypeEnum.regular)
        }}
      />
      <ClassTypeFinderModal
        isOpen={showClassTypeFinder}
        onClose={() => setShowClassTypeFinder(false)}
        onSelectClassType={classType => {
          setShowClassTypeFinder(false)
          handleCardClick(classType)
        }}
      />
    </ContentLayout>
  )
}

export default SelectClassType
