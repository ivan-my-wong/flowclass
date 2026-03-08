import { FC, useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'

import { getTeachingService } from '@/api/student'
import { Spinner } from '@/components/Loaders/Spinner'
import { QUERY_KEY } from '@/constants/queryKey'
import useStudentCRMData from '@/hooks/useStudentCRMData'
import { EnrollConfirmState, Invoice } from '@/types/enrollCourse'
import { TypeTeachingServiceDetail } from '@/types/student'
import { StudentUser } from '@/types/user'

import ClassSchedules from './ClassSchedules'

interface Props {
  invoiceData: Invoice
}

const InvoiceItems: FC<Props> = ({ invoiceData }): JSX.Element => {
  const { t } = useTranslation(['student'])
  const { userAlias } = invoiceData

  const params = {
    userId: userAlias?.userId,
    institutionId: invoiceData.institutionId,
    siteId: invoiceData.siteId ?? 0,
    userAliasId: userAlias?.id,
    invoiceId: invoiceData.id,
  }

  const { useStudentDetail } = useStudentCRMData()
  const { data: studentDetail } = useStudentDetail(params)

  const { data: queryData, isLoading } = useQuery(
    [
      QUERY_KEY.teachingService.getTeachingServiceByInvoiceIdKey,
      invoiceData.id,
    ],
    () => getTeachingService(params)
  )

  const personalInfo = useMemo((): StudentUser | null => {
    if (!studentDetail) return null

    return {
      ...studentDetail,
      fullName: studentDetail.fullName,
      email: studentDetail.email ?? '',
      phone: studentDetail.phone ?? null,
    } as StudentUser
  }, [studentDetail])

  const processedData = useMemo((): TypeTeachingServiceDetail[] => {
    if (!queryData) return []

    // Group by enrollCourseId to ensure we show all unique enroll courses
    // Use a combination of enrollCourseId and classId as the key to handle cases
    // where the same enrollCourseId might have multiple classes
    const groupedByEnrollCourse = queryData
      .filter(Boolean)
      .reduce((acc, enrollCourse) => {
        // Use enrollCourseId + classId as key to ensure all unique enroll courses are shown
        const key = `${enrollCourse.enrollCourseId}-${enrollCourse.classId}`
        if (!acc[key]) {
          acc[key] = {
            ...enrollCourse,
            invoice: {
              invoiceId: enrollCourse.invoiceId,
              paymentState: enrollCourse.paymentState,
            },
          }
        } else {
          // If multiple entries exist for same key, keep the one with higher invoiceId
          const existingInvoiceId = acc[key].invoice?.invoiceId ?? 0
          if (enrollCourse.invoiceId > existingInvoiceId) {
            acc[key].invoice = {
              invoiceId: enrollCourse.invoiceId,
              paymentState: enrollCourse.paymentState,
            }
          }
        }
        return acc
      }, {} as Record<string, TypeTeachingServiceDetail>)

    // Convert to array
    const result = Object.values(groupedByEnrollCourse)

    // Sort data by confirmState and lesson start time
    return [...result].sort((a, b) => {
      // Prioritize ACCEPTED state
      if (a.confirmState !== b.confirmState) {
        return a.confirmState === EnrollConfirmState.ACCEPTED ? -1 : 1
      }

      // Sort by lesson start time if both have lessons
      if (a.lessons?.length && b.lessons?.length) {
        return (
          new Date(a.lessons[0].startTime).getTime() -
          new Date(b.lessons[0].startTime).getTime()
        )
      }

      return 0
    })
  }, [queryData])

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      )
    }

    if (processedData.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          {t('student:paymentProof.noInvoiceItems')}
        </div>
      )
    }

    if (!personalInfo) {
      return (
        <div className="text-center py-4 text-gray-500">
          {t('student:paymentProof.loadingStudentInfo')}
        </div>
      )
    }

    return processedData.map(item => (
      <ClassSchedules
        key={`${item.enrollCourseId}-${item.classId}`}
        service={item}
        student={personalInfo}
        invoiceData={invoiceData}
      />
    ))
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <div className="font-semibold text-lg mb-3">
        {t('student:paymentProof.invoiceItems')}
      </div>
      {renderContent()}
    </div>
  )
}

export default InvoiceItems
