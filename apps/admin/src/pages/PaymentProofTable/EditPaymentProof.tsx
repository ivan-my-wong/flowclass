import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuChevronLeft, LuCopy, LuDownload } from 'react-icons/lu'
import { useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import { fetchInvoicePdf } from '@/api/invoiceCampaign'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { studentState } from '@/stores/studentData'
import { PaymentProofTableItem } from '@/types/enrollCourse'
import { generatePaymentLink } from '@/utils/generate-link.utils'

import CreateTeachingService from '../StudentDetail/components/createTeachingService'

import AdditionalQuestions from './components/Editor/AdditionalQuestions'
import ApplicationInfo from './components/Editor/ApplicationInfo'
import InvoiceItems from './components/Editor/InvoiceItems'
import PaymentStatus from './components/Editor/PaymentStatus'

const EditPaymentProof = (): JSX.Element => {
  const { t } = useTranslation(['student', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { schoolData } = useSchoolData()
  const { currentSchool } = schoolData
  const { siteData } = useSiteData()
  const { currentSite } = siteData

  const { search } = useLocation()
  const invoiceData = useMemo(() => {
    const query = new URLSearchParams(search)
    const id = query.get('id')
    const courseId = query.get('courseId')
    const institutionId = query.get('institutionId')
    const userAlias = query.get('userAlias')

    if (!id) return null

    return {
      id: Number(id),
      courseId: courseId ? Number(courseId) : undefined,
      institutionId: institutionId ? Number(institutionId) : undefined,
      userAlias: userAlias ? Number(userAlias) : undefined,
    } as unknown as PaymentProofTableItem
  }, [search])

  const [studentData, setStudentData] = useRecoilState(studentState)
  const {
    tableDrawers: { isOpenAssignCourse },
  } = studentData
  const { useFetchStudentSingleInvoice } = usePaymentEvidenceData()
  const { data: detailInvoice, refetch } = useFetchStudentSingleInvoice(
    invoiceData?.id ?? 0
  )

  const firstEnrollCourse = detailInvoice?.enrollCourses?.[0]

  const coursePath = firstEnrollCourse?.course?.path

  const paymentLink = useMemo(() => {
    return generatePaymentLink(
      detailInvoice ?? null,
      coursePath ?? '',
      currentSchool,
      currentSite
    )
  }, [detailInvoice, coursePath, currentSchool, currentSite])

  const getTeachingService = useCallback(async () => {
    await queryClient.invalidateQueries([
      QUERY_KEY.teachingService.getTeachingServiceByInvoiceIdKey,
      invoiceData?.id,
    ])
  }, [queryClient, invoiceData])

  const downloadPdf = async () => {
    const result = await fetchInvoicePdf(
      invoiceData?.institutionId ?? 0,
      invoiceData?.id ?? 0
    )
    window.open(result, '_blank')
  }

  if (!invoiceData || !detailInvoice) {
    return (
      <ContentLayout
        leftHeader={
          <div className="flex items-center gap-4">
            <SkeletonLoader height="40px" width="100px" />
            <SkeletonLoader height="32px" width="200px" />
          </div>
        }
        rightHeader={
          <div className="flex gap-2">
            <SkeletonLoader height="40px" width="120px" />
            <SkeletonLoader height="40px" width="120px" />
          </div>
        }
      >
        <div className="w-full p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-4/12 space-y-4">
              <SkeletonLoader height="300px" width="100%" />
              <SkeletonLoader height="200px" width="100%" />
            </div>
            <div className="w-full md:w-8/12 space-y-4">
              <SkeletonLoader height="250px" width="100%" />
              <SkeletonLoader height="400px" width="100%" />
            </div>
          </div>
        </div>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout
      leftHeader={
        <>
          <Button
            variant="ghost"
            iconBefore={<LuChevronLeft />}
            className="text-blue-500"
            onClick={() => navigate('/application')}
          >
            {t('common:action.back')}
          </Button>
          <Heading>
            {t('student:paymentProof.invoiceNumber', {
              id: invoiceData.id,
            })}
          </Heading>
        </>
      }
      rightHeader={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            iconBefore={<LuDownload />}
            className="bg-blue-50 text-blue-500"
            onClick={() => downloadPdf()}
          >
            {t('student:paymentProof.action.downloadPDF')}
          </Button>
          <Button
            iconBefore={<LuCopy />}
            onClick={() => {
              navigator.clipboard.writeText(paymentLink)
              toast.success(t('embed:code.linkCopied'))
            }}
          >
            {t('student:paymentProof.action.copyLink')}
          </Button>
        </div>
      }
    >
      <div className="w-full p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-4/12 space-y-4">
            <ApplicationInfo invoiceData={detailInvoice} refetch={refetch} />
            <AdditionalQuestions
              invoiceData={detailInvoice}
              refetch={refetch}
            />
          </div>
          <div className="w-full md:w-8/12 space-y-4">
            <PaymentStatus invoiceData={detailInvoice} refetch={refetch} />
            <InvoiceItems invoiceData={detailInvoice} />
          </div>
        </div>
      </div>

      <CreateTeachingService
        open={isOpenAssignCourse}
        handleClose={() => {
          setStudentData(prev => ({
            ...prev,
            tableDrawers: {
              ...studentData.tableDrawers,
              isOpenAssignCourse: false,
            },
          }))
          const queryParams = new URLSearchParams(search)
          navigate(`/application/edit?${queryParams.toString()}`)
          refetch()
          getTeachingService()
        }}
      />
    </ContentLayout>
  )
}

export default EditPaymentProof
