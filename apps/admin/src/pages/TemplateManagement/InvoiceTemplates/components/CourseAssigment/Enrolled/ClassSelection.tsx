import { useEffect } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FaCheck } from 'react-icons/fa'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import useSiteData from '@/hooks/useSiteData'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'

import {
  AllEnrolledData,
  useContextEnrolledClass,
} from './EnrolledClassContext'

const ClassSelection = (): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const siteData = useSiteData()
  const { selectedClasses, setSelectedClasses, availableClassesAndSessions } =
    useContextEnrolledClass()

  const isSelected = (classItem: AllEnrolledData) => {
    return selectedClasses.some(
      item =>
        item.classData.classId === classItem.classData.classId &&
        item.classData.studentItem.id === classItem.classData.studentItem.id
    )
  }

  const onClassSelect = (classData: AllEnrolledData) => {
    setSelectedClasses(prev =>
      isSelected(classData)
        ? prev.filter(
            item =>
              !(
                item.classData.classId === classData.classData.classId &&
                item.classData.studentItem.id ===
                  classData.classData.studentItem.id
              )
          )
        : [...prev, classData]
    )
  }

  useEffect(() => {
    if (
      availableClassesAndSessions.length > 0 &&
      selectedClasses.length === 0
    ) {
      setSelectedClasses([...availableClassesAndSessions])
    }
  }, [availableClassesAndSessions, setSelectedClasses, selectedClasses.length])

  return (
    <div className="space-y-4">
      <div className="text-gray-800 text-sm mb-4">
        {t('enrolledClass.classSelection.title')}
      </div>
      <div className="space-y-3">
        {availableClassesAndSessions.map(classItem => (
          <Card
            key={`${classItem.classData.classId}-${classItem.classData.studentItem.id}`}
            className={cn(
              'rounded-lg shadow-none border border-gray-200 p-4 cursor-pointer',
              isSelected(classItem) && 'border-green-200'
            )}
            onClick={() => onClassSelect(classItem)}
          >
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  'h-5 w-5 border border-gray-300 rounded-sm mt-1.5 flex items-center justify-center text-gray-300',
                  isSelected(classItem) &&
                    'bg-primary text-white border-primary'
                )}
              >
                <FaCheck size={12} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-xl font-bold text-gray-900">
                    {classItem.classData.courseName}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs text-blue-500 bg-blue-300 border-blue-500 capitalize rounded-full"
                  >
                    {classItem.classData.type}
                  </Badge>
                </div>
                <p className="text-base mb-2 text-gray-600">
                  {classItem.classData.parentName}
                </p>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t('enrolledClass.classSelection.lessonsToBeAdded')}
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  {classItem.sessionData.map(s => (
                    <div key={`${classItem.classData.classId}#${s.id}`}>
                      {`${dayjs(s.date).format('DD/MM/YYYY')} ${dayjs(
                        s.startTime
                      ).format('HH:mm')} - ${dayjs(s.endTime).format(
                        'HH:mm'
                      )} (${dayjs.utc(s.startTime).format('dddd')})`}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-auto">
                {formatCurrency(
                  Number(classItem.classData.price),
                  siteData.currency
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ClassSelection
