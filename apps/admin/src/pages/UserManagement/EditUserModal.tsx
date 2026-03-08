import { useMemo, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import Modal from '@/components/Popups/Modal'
import RadioGroup from '@/components/RadioGroup/RadioButtonGroup'
import Spacer from '@/components/Separators/Spacer'
import Text from '@/components/Texts/Text'
import { UserRole } from '@/stores/userPermissionData'

type EditUserProps = {
  title: string
  message?: string
  trigger: React.ReactNode
  disabled?: boolean
  isSite?: boolean
  onConfirm: (role: UserRole) => void
}

export const EditUser: React.FC<EditUserProps> = ({
  title,
  message,
  trigger,
  disabled,
  isSite = false,
  onConfirm,
}) => {
  const defaultRoleValue = UserRole.Instructor

  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const [role, setRole] = useState(defaultRoleValue)
  const { t } = useTranslation()

  const userRolesRadioGroup = useMemo(() => {
    if (isSite) {
      return {
        defaultValue: defaultRoleValue,
        inputValues: [
          {
            value: UserRole.SiteAdmin,
            id: UserRole.SiteAdmin,
            label: t('common:roles.siteAdmin'),
          },
        ],
      }
    }
    return {
      defaultValue: defaultRoleValue,
      inputValues: [
        {
          value: UserRole.SiteAdmin,
          id: UserRole.SiteAdmin,
          label: t('common:roles.siteAdmin'),
        },
        {
          value: UserRole.SchoolAdmin,
          id: UserRole.SchoolAdmin,
          label: t('common:roles.schoolAdmin'),
        },
        {
          value: UserRole.Instructor,
          id: UserRole.Instructor,
          label: t('common:roles.instructor'),
        },
        {
          value: UserRole.Operations,
          id: UserRole.Operations,
          label: t('common:roles.operations'),
        },
      ],
    }
  }, [isSite])

  const handleConfirm = () => {
    onConfirm(role)
    closeBtnRef.current?.click()
  }

  return (
    <Modal trigger={trigger}>
      <Modal.Title>{title}</Modal.Title>
      <Text>{message}</Text>
      <Box direction="column" align="flex-start">
        <Spacer space="y1" />

        <RadioGroup
          defaultValue={userRolesRadioGroup.defaultValue}
          itemValues={userRolesRadioGroup.inputValues}
          onValueChange={(newValue: any) => {
            setRole(newValue as UserRole)
          }}
        />
      </Box>
      <Modal.ButtonGroup>
        <Modal.Close asChild>
          <Button variants="outlined" ref={closeBtnRef}>
            {t('common:action.cancel')}
          </Button>
        </Modal.Close>
        <Modal.Close asChild>
          <Button
            disabled={disabled}
            onClick={() => {
              handleConfirm()
            }}
          >
            {t('common:action.confirm')}
          </Button>
        </Modal.Close>
      </Modal.ButtonGroup>
    </Modal>
  )
}

export default EditUser
