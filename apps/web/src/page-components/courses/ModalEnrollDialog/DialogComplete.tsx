import { useEffect } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { FaCheckCircle } from 'react-icons/fa'

import Button from '@/components/Buttons/Button'

type IProps = {
  setShowInfoDialog: (value: boolean) => void
  setStatusComplete: (value: boolean) => void
  handleContinue: () => void
}
const DialogComplete = ({ setShowInfoDialog, handleContinue }: IProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    const timer = setTimeout(() => {
      handleContinue()
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <div className="bg-backgroundLayer2 rounded-md p-5">
        <div className="flex items-center justify-center gap-x-2">
          <FaCheckCircle className="h-[45px] w-[45px] text-[#78A55A]" />
          <div className="text-sm">
            <div>{t('course:dialogEnroll.complete')}</div>
            <div>{t('course:dialogEnroll.continue')}</div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-x-2">
        <Button variant="disabled" onClick={() => setShowInfoDialog(false)}>
          {t('common:action.cancel')}
        </Button>
        <Button onClick={() => handleContinue()}>
          {t('common:action.continueToTheApplication')}
        </Button>
      </div>
    </div>
  )
}

export default DialogComplete
