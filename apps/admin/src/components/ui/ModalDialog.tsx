import { ComponentPropsWithoutRef, useEffect } from 'react'

import { DefaultTFuncReturn } from 'i18next'
import { SubmitHandler, UseFormReturn } from 'react-hook-form'

import {
  Dialog,
  DialogContent,
  withFormDialogContent,
} from '@/components/ui/Dialog'
import ModalDialogBody from '@/components/ui/ModalDialogBody'

type PropType = Omit<ComponentPropsWithoutRef<'div'>, 'title' | 'children'> & {
  title: string | React.ReactNode | DefaultTFuncReturn
  subtitle?: string | React.ReactNode | DefaultTFuncReturn
  children: React.ReactNode | React.ReactNode[]
  footer?: React.ReactNode | React.ReactNode[]
  open?: boolean
  scrollable?: boolean
  onOpenChange?: (isOpen: boolean) => void
  // Pass Form instance to the props will render Form Component
  formData?: UseFormReturn<any>
  // Pass onSubmit will be possible to submit the form using submit button at Footer component
  onSubmit?: SubmitHandler<any>
  footerClassName?: string
  classBody?: string
  dataTestId?: string
  isFixedHeader?: boolean
}
const ModalDialog = ({
  open,
  onOpenChange,
  scrollable = false,
  onSubmit,
  formData,
  className,
  dataTestId,
  ...props
}: PropType): React.ReactElement => {
  useEffect(() => {
    return () => {
      document.querySelector('body')?.setAttribute('style', '')
    }
  }, [open])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {formData && onSubmit ? (
        withFormDialogContent(
          <ModalDialogBody dataTestId={dataTestId} {...props} />,
          formData,
          onSubmit,
          scrollable,
          className
        )
      ) : (
        <DialogContent className={className} scrollable={scrollable}>
          <ModalDialogBody dataTestId={dataTestId} {...props} />
        </DialogContent>
      )}
    </Dialog>
  )
}
export default ModalDialog
