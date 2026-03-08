import useTranslation from 'next-translate/useTranslation'
import { FaCheckCircle } from 'react-icons/fa'
import { MdLoop } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import { School } from '@/types'

type ProfileFoundProps = {
  school: School
  setShowInfoDialog: (value: boolean) => void
  handleProfile: () => void
}

const ProfileFound = ({ school, setShowInfoDialog, handleProfile }: ProfileFoundProps) => {
  const { t } = useTranslation()

  const isLoading = false

  if (isLoading) {
    return (
      <div className="bg-backgroundLayer2 flex h-[100px] items-center justify-center rounded-md p-5">
        <MdLoop className="text-primary animate-spin text-3xl" />
      </div>
    )
  }

  return (
    <div>
      <div className="bg-backgroundLayer2 flex items-center justify-center rounded-md p-5">
        <FaCheckCircle className="mr-5 h-[50px] w-[50px] text-[#78A55A]" />
        <div
          dangerouslySetInnerHTML={{
            __html: t('school:profile.profileFound')
              .replace(/\n/g, '<br />')
              .replace('{{institutionName}}', school.name),
          }}
        />
      </div>
      <div className="mt-4 flex justify-end gap-x-2">
        <Button
          className="flex gap-x-2"
          onClick={() => handleProfile()}
          disabled={isLoading}
          data-testid="visit-profile-btn"
        >
          {isLoading && <MdLoop className="animate-spin" />}
          {t('school:profile.visitMyProfile')}
        </Button>
      </div>
    </div>
  )
}

export default ProfileFound
