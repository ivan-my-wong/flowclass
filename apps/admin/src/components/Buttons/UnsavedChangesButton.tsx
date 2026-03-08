import { useTranslation } from 'react-i18next'

import RingSpinner1 from '@/assets/svgs/spinners/RingSpinner1'

import SvgIcon from '../Images/SvgIcon'
import { Button } from '../ui/Button'

const UnsavedChangesButton = ({
  hasUnsavedChanges,
  isSaving,
  handleSave,
}: {
  hasUnsavedChanges: boolean
  isSaving: boolean
  handleSave: () => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="md:box-row-full w-fit flex-col-reverse">
      {hasUnsavedChanges && (
        <p className="text-right text-sm text-text-subtle">
          *{t(`school:haveUnSavedChanges`)}
        </p>
      )}
      <Button onClick={handleSave} disabled={!hasUnsavedChanges || isSaving}>
        {isSaving ? (
          <SvgIcon>
            <RingSpinner1 />
          </SvgIcon>
        ) : (
          t(`school:saveSchool`)
        )}
      </Button>
    </div>
  )
}

export default UnsavedChangesButton
