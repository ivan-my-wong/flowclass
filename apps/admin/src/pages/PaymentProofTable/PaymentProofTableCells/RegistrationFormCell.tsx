import { useMemo, useState } from 'react'

import { t } from 'i18next'
import { TiEye } from 'react-icons/ti'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { RegistrationFormPrefix } from '@/constants/exportCSVPrefix'
import { StudentFormResponse } from '@/types/enrollCourse'

import ApplicationFormFieldItem from './ApplicationFormFieldItem'

interface IRegistrationFormCellProps {
  value?: StudentFormResponse[]
}

export const RegistrationFormCell = ({
  value,
}: IRegistrationFormCellProps): JSX.Element => {
  const [open, setOpen] = useState(false)
  const fields = useMemo(() => {
    const fieldsWithoutCreateAccount = value?.filter(
      field => field.question !== RegistrationFormPrefix.CREATE_ACCOUNT
    )

    return fieldsWithoutCreateAccount
      ? [...fieldsWithoutCreateAccount].sort(
          (a, b) => Number(b.isDefault) - Number(a.isDefault)
        )
      : []
  }, [value])

  return (
    <div style={{ padding: 'var(--space-small)' }}>
      {fields.length > 0 ? (
        <>
          <Button
            variant="outline"
            iconAfter={<TiEye />}
            onClick={() => setOpen(true)}
          >
            {t('student:dropdown.clickToViewForm')}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-full p-8">
              <DialogTitle>{t(`student:registrationForm.title`)}</DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  className="absolute top-4 right-4"
                  aria-label="Close"
                >
                  ×
                </Button>
              </DialogClose>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('student:registrationForm.field')}</TableHead>
                    <TableHead>{t('student:registrationForm.value')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map(field => (
                    <ApplicationFormFieldItem
                      key={field.id}
                      label={field.question}
                      value={field.value}
                    />
                  ))}
                </TableBody>
              </Table>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  )
}

export default RegistrationFormCell
