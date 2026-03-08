import React, { useEffect, useState } from 'react'

import { useRecoilState, useRecoilValue } from 'recoil'

import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import useTranslation from 'next-translate/useTranslation'

import Modal from '@/components/Popups/Modal'
import Heading from '@/components/Texts/Heading'
import { enrolState } from '@/stores/enrol'
import { SettingsState } from '@/stores/settingsData'

import MultipleClassItem from './MultipleClassItem'

type MultipleClassCheckProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  trigger: React.ReactNode
}

const MultipleClassDialog = ({ open, setOpen, trigger }: MultipleClassCheckProps): JSX.Element => {
  const { t } = useTranslation()
  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const [classList, setClassList] = useState(enrolForm.selectedClassData)
  const { siteSettings } = useRecoilValue(SettingsState)

  useEffect(() => {
    setClassList(enrolForm.selectedClassData)
  }, [enrolForm.selectedClassData])

  return (
    <Modal show={open} onOpenChange={setOpen} rounded="large" trigger={trigger}>
      <Modal.Title className="text-text text-4 m-0 font-medium">
        <Heading as="h3" fontSize="lg">
          {t('enrol:pickClassStep.selectedClass')}
        </Heading>
      </Modal.Title>
      {classList && classList.length <= 0 && (
        <span>{t('enrol:pickClassStep.noClassesSelected')}</span>
      )}
      {classList &&
        classList.map((classItem, index) => (
          <MultipleClassItem key={index} classItem={classItem} index={index} />
        ))}
      <Dialog.Close asChild>
        <button
          className="text-text  absolute right-3 top-3 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full  focus:outline-none"
          aria-label="Close"
        >
          <Cross2Icon />
        </button>
      </Dialog.Close>
    </Modal>
  )
}

export default MultipleClassDialog
