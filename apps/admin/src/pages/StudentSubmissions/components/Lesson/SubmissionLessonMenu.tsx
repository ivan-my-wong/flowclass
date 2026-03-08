import { FC } from 'react'

import { useTranslation } from 'react-i18next'
import { BsThreeDots } from 'react-icons/bs'

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
  isDownloading: boolean
}

const SubmissionLessonMenu: FC<Props> = ({
  onDownloadAll,
  isDownloading,
}): JSX.Element => {
  const { t } = useTranslation(['studentSubmission'])
  const actions = [
    {
      label: t('downloadStudentDocument'),
      action: onDownloadAll,
      disabled: isDownloading,
    },
    // {
    //   label: 'Upload Document for Student',
    //   action: onUpload,
    // },
    // {
    //   label: 'Upload Marked Document',
    //   action: onUpload,
    // },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="xs" variant="ghost">
          <BsThreeDots size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          {actions.map(act => (
            <DropdownMenuItem
              key={act.label}
              onSelect={act.action}
              disabled={act.disabled ?? false}
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

export default SubmissionLessonMenu
