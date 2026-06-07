import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FaAngleRight } from 'react-icons/fa'

import useTemplateManagement from '@/hooks/useTemplateManagement'
import ContentLayout from '@/layouts/ContentLayout'
import { StudentEnrolmentRecord } from '@/types/student'
import { DocumentTemplate } from '@/types/templateManagement'

import CenterCanvas from './CenterCanvas'
import ComposeEmail from './ComposeEmail'
import LeftSidebar from './LeftSidebar'

const CampaignDocumentDetails = () => {
  const { t } = useTranslation()

  const params = useParams()
  const campaignId = params?.campaignId as string | undefined

  const [name, setName] = useState('')
  const [sendDocument, setSendDocument] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<
    StudentEnrolmentRecord[]
  >([])
  const [selectedDocument, setSelectedDocument] = useState<
    DocumentTemplate | undefined
  >()
  const [lessonDetails, setLessonDetails] = useState<{
    courseId?: number
    classId?: number
  }>()

  const { useGetBulkSendDocumentById } = useTemplateManagement()
  const { data: campaign } = useGetBulkSendDocumentById(
    campaignId ? +campaignId : undefined
  )

  useEffect(() => {
    if (campaign) {
      setName(campaign.title)
      setSelectedDocument(campaign.document)
      setSelectedStudents(
        (campaign.recipientList || []).map(recipient => recipient.student)
      )
      setSendDocument(true)
    }
  }, [campaign])

  const props = {
    campaignId,
    name,
    setName,
    lessonDetails,
    setLessonDetails,
    selectedStudents,
    setSelectedStudents,
    selectedDocument,
    setSelectedDocument,
    sendDocument,
    setSendDocument,
  }

  const steps = [
    { label: 'Select Template', isCompleted: !!selectedDocument },
    { label: 'Select Lesson', isCompleted: !!lessonDetails?.classId },
    { label: 'Select Students', isCompleted: selectedStudents.length > 0 },
    { label: 'Send Documents', isCompleted: sendDocument },
  ]

  return (
    <ContentLayout
      leftHeader={
        <div>
          <h1 className="text-xl font-bold">
            {t('templateManagement:bulkDocumentSender')}
          </h1>
        </div>
      }
      rightHeader={
        <div className="flex gap-2 mt-2">
          <ComposeEmail {...props} />
        </div>
      }
    >
      <div className="mb-4 w-full pl-4 pt-4">
        <div className="flex gap-2 text-sm font-medium items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              {index > 0 && <FaAngleRight className="text-gray-400" />}
              <div
                className={[
                  'py-2 px-4 rounded-md flex gap-2 items-center',
                  step.isCompleted
                    ? 'bg-green-100 text-green-600'
                    : 'bg-background-layer-2 text-gray-500 ',
                ].join(' ')}
              >
                <div
                  className={[
                    'w-[25px] h-[25px] flex rounded-full items-center justify-center text-white',
                    step.isCompleted ? 'bg-green-600' : 'bg-gray-400',
                  ].join(' ')}
                >
                  {index + 1}
                </div>
                {step.label}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4 px-4 w-full">
        <div className="col-span-3">
          <LeftSidebar {...props} />
        </div>

        <div className="col-span-9">
          <CenterCanvas {...props} />
        </div>
      </div>
    </ContentLayout>
  )
}

export default CampaignDocumentDetails
