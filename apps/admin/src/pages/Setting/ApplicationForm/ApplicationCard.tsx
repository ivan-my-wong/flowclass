import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import DeleteIcon from '@/assets/svgs/DeleteIcon'
import EditIcon from '@/assets/svgs/student/EditIcon'
import Box from '@/components/Containers/Box'
import DropdownMenu, {
  DropDownMenuItemType,
} from '@/components/DropDownMenus/DropDownMenu'
import SvgIcon from '@/components/Images/SvgIcon'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import { Card } from '@/components/ui/Card'
import useApplicationFormData from '@/hooks/useApplicationFormData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { ApplicationFormTypes } from '@/types/applicationForm'
import { formatTs } from '@/utils/timeFormat'

interface Props {
  width?: string
  setOpen: (value: boolean) => void
  data: ApplicationFormTypes
  handleDeleteField: (id: number) => void
}

const ApplicationCard = ({
  handleDeleteField,
  width,
  data,
  setOpen,
}: Props): JSX.Element => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const idForm = searchParams.get('formId')

  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false)
  const { setCurrentApplicationForm } = useApplicationFormData()

  useEffect(() => {
    if (idForm) {
      setOpen(true)
    }
  }, [])
  const handleSelectForm = () => {
    setOpen(true)
    setCurrentApplicationForm(data.id)
  }
  const menuItems: DropDownMenuItemType[] = [
    {
      type: 'item',
      disabled: false,
      content: (
        <>
          <SvgIcon className="mr-4">
            <EditIcon />
          </SvgIcon>
          <Text> {t('setting:applicationForm.edit')}</Text>
        </>
      ),
      onClick: () => handleSelectForm(),
    },
    {
      type: 'separator',
    },
    {
      type: 'item',
      disabled: false,
      content: (
        <>
          <SvgIcon className="mr-4">
            <DeleteIcon fill="#F87575" />
          </SvgIcon>
          <Text> {t('common:action.delete')}</Text>
        </>
      ),
      onClick: () => setShowConfirmPopup(true),
    },
  ]
  return (
    <Card
      className="box-col-full p-4 bg-background-layer-2 hover:bg-background-layer-3 gap-2 items-start hover:cursor-pointer"
      data-testid="application-card"
      onClick={e => {
        e.stopPropagation()
        handleSelectForm()
      }}
    >
      <Text className="text-xl font-bold">{data.name}</Text>
      <Text className="mb-2">
        {t('setting:applicationForm.containing')} {data.fields.length}{' '}
        {t('setting:applicationForm.fieldAnswer')}
      </Text>
      <Separator />
      <Text className="mt-2">
        {t('setting:applicationForm.lastUpdate')}{' '}
        {data.updatedAt &&
          formatTs(data.updatedAt.toString(), 'YYYY/MM/DD hh:mm')}
      </Text>
      <div
        role="group"
        className="absolute w-fit top-4 right-4 z-[1]"
        onClick={e => e.stopPropagation()}
      >
        <DropdownMenu
          menuItems={menuItems}
          contentProps={{ minWidth: '16rem', zIndex: 999 }}
        />
      </div>
      <CustomedAlertDialog
        open={showConfirmPopup}
        setOpen={setShowConfirmPopup}
        description={t('setting:applicationForm.descriptionDelete')}
        title={`${t('setting:applicationForm.titleDeleteDialog')} ${data.name}`}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={() => {
          if (data.id) handleDeleteField(data.id)
        }}
      />
    </Card>
  )
}
export default ApplicationCard
