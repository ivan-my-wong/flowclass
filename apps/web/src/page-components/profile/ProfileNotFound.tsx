import useTranslation from 'next-translate/useTranslation'
import { IoCloseCircle } from 'react-icons/io5'
import { MdLoop } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import { School } from '@/types'

type ProfileNotFoundProps = {
  school: School
  setShowInfoDialog: (value: boolean) => void
  setStatusComplete: (value: boolean | undefined) => void
}

const ProfileNotFound = ({
  school,
  setShowInfoDialog,
  setStatusComplete,
}: ProfileNotFoundProps) => {
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
      <div className="bg-backgroundLayer2 flex items-center justify-center whitespace-pre-line rounded-md p-5">
        <IoCloseCircle className="mr-5 h-[80px] w-[80px] text-[#8C1A11]" />
        {t('school:profile.profileNotFound', {
          contactInfo:
            [
              school?.phone && `${t('school:profile.phoneNumber')}: ${school.phone}`,
              school?.email && `${t('school:profile.email')}: ${school.email}`,
            ]
              .filter(Boolean)
              .join(' or ') || t('school:profile.contactAdmin'),
        })}
      </div>
      <div className="mt-4 flex justify-end gap-x-2">
        <Button
          className="flex gap-x-2"
          variant="disabled"
          onClick={() => setStatusComplete(undefined)}
          disabled={isLoading}
          data-testid="try-again-btn"
        >
          {isLoading && <MdLoop className="animate-spin" />}
          {t('school:profile.tryAgain')}
        </Button>
        <Button
          onClick={() => setShowInfoDialog(false)}
          disabled={isLoading}
          data-testid="continue-application-btn"
        >
          {t('school:profile.continueTheApplication')}
        </Button>
      </div>
    </div>
  )
}

export default ProfileNotFound
