import React from 'react'

import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

import Drawer from '../../../components/Drawer/Drawer'
import { HeaderBackButtonStatus } from '../../../components/TabWithListAndButton/HeaderBackButton'
import Heading from '../../../components/Texts/Heading'
import ContentLayout from '../../../layouts/ContentLayout'

import ContentStudentInformation from './CreateNewFieldComponent'

const CreateNewField = ({
  open,
  handleClose,
  mode = 'drawer',
}: {
  open: boolean
  handleClose: () => void
  mode?: 'drawer' | 'dialog'
}): React.ReactElement => {
  const { t } = useTranslation()

  const headerBackButton: HeaderBackButtonStatus = {
    action: handleClose,
    mode: 'back',
  }
  const title = t('setting:studentInformation.createNewField')
  const content = (
    <ContentStudentInformation isEdit={false} handleClose={handleClose} />
  )

  return (
    <>
      {mode === 'drawer' && (
        <Drawer open={open}>
          <ContentLayout
            headerBackButton={headerBackButton}
            leftHeader={<Heading>{title}</Heading>}
          >
            {content}
          </ContentLayout>
        </Drawer>
      )}
      {mode === 'dialog' && (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold p-2">
                {title}
              </DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-4">{content}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default CreateNewField
