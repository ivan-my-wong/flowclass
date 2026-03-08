import { useEffect, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { FaArrowRight } from 'react-icons/fa'
import { GiCheckMark } from 'react-icons/gi'
import { IoClose, IoCloseCircle } from 'react-icons/io5'
import { MdLoop } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import { useCheckCourseCompleted } from '@/hooks/useDialogEnroll'
import { useSchoolContext } from '@/stores/schoolContext'
import { EnrollCompletedResponse } from '@/types/enrol'

import { enrollCompletedFormKey } from './DialogForm'

type IProps = {
  setShowInfoDialog: (value: boolean) => void
  setStatusComplete: (value: boolean | undefined) => void
}
const DialogNoComplete = ({ setShowInfoDialog, setStatusComplete }: IProps): React.ReactElement => {
  const { t } = useTranslation()

  const [listEnroll, setListEnroll] = useState<EnrollCompletedResponse[]>()

  const { schoolContext } = useSchoolContext()
  const { school } = schoolContext

  const { mutateAsync: handleCheck, isLoading } = useCheckCourseCompleted()

  const handleTryAgain = async () => {
    const form = JSON.parse(sessionStorage.getItem(enrollCompletedFormKey) || '{}')

    if (!form?.name) return

    const isNoCompleted = await handleCheck(form).then(res => {
      if (!res) return true
      setListEnroll(res)
      return res?.some(o => o.status === false)
    })

    setStatusComplete(!isNoCompleted)
  }

  useEffect(() => {
    handleTryAgain()
  }, [])

  if (isLoading)
    return (
      <div className="bg-backgroundLayer2 flex h-[100px] items-center justify-center rounded-md p-5">
        <MdLoop className="text-primary animate-spin text-3xl" />
      </div>
    )

  return (
    <div>
      <div className="bg-backgroundLayer2 rounded-md p-5">
        <div className="flex items-center justify-center gap-x-2">
          <IoCloseCircle fill="red" />
          <div>{t('course:dialogEnroll.noComplete')}</div>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 pl-[23%]">
          {listEnroll?.map(item => {
            const isCompleted = item.status === true
            return (
              <div
                key={`enroll-${item.course?.id}-${item.class?.id}`}
                className="flex cursor-pointer items-center gap-x-2 hover:opacity-80"
                onClick={() => {
                  if (isCompleted) return
                  location.replace(`/@${school?.url ?? ''}/${item.course?.path}`)
                  setShowInfoDialog(false)
                }}
              >
                {isCompleted ? (
                  <GiCheckMark className="text-textSubtle ml-2" />
                ) : (
                  <IoClose className="text-primary h-[25px] w-[25px]" />
                )}
                <div className={isCompleted ? 'text-textSubtle' : 'text-primary font-bold'}>
                  {`${item.course?.name} - ${item.class?.name}`}
                </div>
                {!isCompleted && <FaArrowRight className="text-primary" />}
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-x-2">
        <Button
          className="flex gap-x-2"
          variant="disabled"
          onClick={() => setStatusComplete(undefined)}
          disabled={isLoading}
        >
          {isLoading && <MdLoop className="animate-spin" />}
          {t('common:action.tryAgain')}
        </Button>
        <Button variant="danger" onClick={() => setShowInfoDialog(false)} disabled={isLoading}>
          {t('common:action.cancel')}
        </Button>
      </div>
    </div>
  )
}

export default DialogNoComplete
