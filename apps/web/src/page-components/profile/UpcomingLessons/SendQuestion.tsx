import { useCallback, useState } from 'react'

import { LucideCalendar, LucideHourglass, LucideLoader, LucideStepForward } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import InfoDialog from '@/components/Popups/InfoDialog'
import TextArea from '@/components/TextAreas/TextArea'
import { useSendQuestion } from '@/hooks/useProfile'
import { UpcomingLesson } from '@/types/profile'

type SendQuestionProps = {
  data?: UpcomingLesson
  schoolName?: string
  lessonDetails?: { time: string; startingAt: string; lessonSequence: string }
}

const SendQuestion = ({ data, schoolName = '', lessonDetails }: SendQuestionProps) => {
  const { t } = useTranslation()

  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [question, setQuestion] = useState('')

  const handleOpen = useCallback(() => {
    setShowInfoDialog(!showInfoDialog)
    setQuestion('')
  }, [showInfoDialog])

  const { mutateAsync: handleSend, isLoading } = useSendQuestion()

  return (
    <InfoDialog
      key={'request-time-change'}
      title={t('profile:sendQuestion')}
      description={t('profile:sendQuestionDesc').replace('{schoolName}', schoolName)}
      trigger={
        <Button className="w-full lg:w-fit" variant="outlined" onClick={handleOpen}>
          {t('profile:sendQuestion')}
        </Button>
      }
      open={showInfoDialog}
      setOpen={handleOpen}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <label>{t('profile:yourMessage')}</label>
          <TextArea
            className="raw-input rounded-md border-gray-200"
            rows={5}
            onChange={e => setQuestion(e.target.value)}
            value={question}
          />
        </div>
        <div className="mx-auto w-full space-y-2 rounded-md border border-[#000] p-3">
          <div>
            <h2 className="text-xl font-semibold">{data?.course?.name}</h2>
            <p className="text-gray-500">{data?.class?.name}</p>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <LucideCalendar size={16} />
              <span>{t('profile:time')}</span>
            </div>
            <div>{lessonDetails?.time}</div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <LucideHourglass size={16} />
              <span>{t('profile:requestTimeChange.startsAt')}</span>
            </div>
            <div>{lessonDetails?.startingAt}</div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <LucideStepForward size={16} />
              <span>{t('profile:lessonSequence')}</span>
            </div>
            <div>{lessonDetails?.lessonSequence}</div>
          </div>
        </div>

        <div className="mx-auto w-full space-y-2 rounded-md border border-[#000] p-3">
          <div className="flex justify-between">
            <div className="font-bold">{t('profile:studentName')}</div>
            <div>{data?.user?.name}</div>
          </div>
          <div className="flex justify-between">
            <div className="font-bold">{t('profile:email')}</div>
            <div>{data?.user?.email}</div>
          </div>
          <div className="flex justify-between">
            <div className="font-bold">{t('profile:phone')}</div>
            <div>{data?.user?.phone}</div>
          </div>
        </div>

        <Button
          className="flex w-full gap-x-2"
          onClick={() => {
            handleSend({ institutionId: data?.institutionId, lessonId: data?.id, question }).then(
              () => {
                toast.success(t('profile:sendQuestionSuccess') as string)
                handleOpen()
              }
            )
          }}
          disabled={isLoading || !question}
        >
          {isLoading && <LucideLoader className="animate-spin" />}
          {t('common:action.confirm')}
        </Button>
      </div>
    </InfoDialog>
  )
}

export default SendQuestion
