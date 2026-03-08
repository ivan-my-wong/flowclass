import { DefaultTFuncReturn } from 'i18next'

import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { cn } from '@/utils/cn'

type PropType = {
  title: string | React.ReactNode | DefaultTFuncReturn
  subtitle?: string | React.ReactNode | DefaultTFuncReturn
  children: React.ReactNode | React.ReactNode[]
  footer?: React.ReactNode | React.ReactNode[]
  footerClassName?: string
  classBody?: string
  dataTestId?: string
  isFixedHeader?: boolean
}
const ModalDialogBody = ({
  title,
  subtitle,
  classBody,
  footer,
  footerClassName,
  dataTestId,
  isFixedHeader,
  ...props
}: PropType): JSX.Element => (
  <>
    <DialogHeader
      className={cn(
        isFixedHeader && 'sticky top-0 z-10 bg-background h-10',
        subtitle &&
          'flex flex-col items-start justify-center gap-1 border-b border-border h-20'
      )}
    >
      <DialogTitle className="text-left pr-10">{title}</DialogTitle>
      {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
    </DialogHeader>
    <DialogBody
      className={cn('space-y-4 px-4', classBody)}
      data-testid={dataTestId}
    >
      {props.children}
    </DialogBody>
    {footer && (
      <DialogFooter
        className={cn(
          footerClassName,
          'sticky bottom-0 z-10 bg-white border-t border-gray-300'
        )}
      >
        {footer}
      </DialogFooter>
    )}
  </>
)
export default ModalDialogBody
