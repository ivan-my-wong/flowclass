import { FC } from 'react'

import { useTranslation } from 'react-i18next'
import { LuMenu } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

interface Props {
  onDownloadAll: () => void
  onUpload: () => void
  isDownloading: boolean
}

const SubmissionItemMenu: FC<Props> = ({
  onDownloadAll,
  onUpload,
  isDownloading,
}): JSX.Element => {
  const { t } = useTranslation(['studentSubmission'])
  const actions = [
    {
      label: t('downloadStudentDocument'),
      action: onDownloadAll,
    },
    {
      label: t('uploadFile.menuLabel'),
      action: onUpload,
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="z-10">
          <LuMenu size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          {actions.map(act => (
            <DropdownMenuItem
              key={act.label}
              onSelect={act.action}
              disabled={act.action === onDownloadAll && isDownloading}
              className="cursor-pointer hover:bg-gray-100"
            >
              {act.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SubmissionItemMenu
