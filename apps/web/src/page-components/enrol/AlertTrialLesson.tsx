import React from 'react'

import { useRecoilState } from 'recoil'

import * as Dialog from '@radix-ui/react-dialog'
import useTranslation from 'next-translate/useTranslation'
import { BsXCircleFill } from 'react-icons/bs'

import Button from '@/components/Buttons/Button'
import { enrolState } from '@/stores/enrol'

type MultipleClassCheckProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AlertTrialLesson = ({ open, setOpen }: MultipleClassCheckProps): JSX.Element => {
  const { t } = useTranslation()

  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const onBackStep = () => {
    setEnrolForm(prev => ({
      ...prev,
      currentStep: prev.currentStep - 1,
    }))
  }
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-textSubtle data-[state=open]:animate-overlayShow fixed inset-0 bg-opacity-70" />
        <Dialog.Content className="bg-background data-[state=open]:animate-contentShow rounded-2 shadow-2 fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white p-6 focus:outline-none">
          <Dialog.Title className="text-text text-4 m-0 font-bold">
            {t('enrol:trialLesson.usedTitleAlert')}
          </Dialog.Title>
          <Dialog.Description className="text-mauve11 text-4 mb-5 mt-3 leading-normal">
            <div
              className={'flex w-full items-center gap-x-2 rounded-md bg-gray-100 p-12 shadow-sm'}
            >
              <BsXCircleFill className={'text-warn'} />{' '}
              {t('enrol:trialLesson.usedDescriptionAlert')}
            </div>
          </Dialog.Description>
          <div className={'mt-4 flex justify-end gap-3'}>
            <Button
              className={'text-backgroundDisabled'}
              onClick={onBackStep}
              variant={'disabledOutlined'}
            >
              Back to last step
            </Button>
            <Dialog.Close>
              <Button variant="danger" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default AlertTrialLesson
