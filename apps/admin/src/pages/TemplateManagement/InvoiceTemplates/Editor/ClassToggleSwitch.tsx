import { FC } from 'react'

import { useTranslation } from 'react-i18next'

import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'

import { useInvoiceEditorContext } from './InvoiceEditorContext'

const ClassToggleSwitch: FC = (): JSX.Element => {
  const {
    showAllClassesInCourse,
    setShowAllClassesInCourse,
    selectedCourseId,
  } = useInvoiceEditorContext()
  const { t } = useTranslation('invoiceCampaign')

  // Only show toggle if we have a course selected
  if (!selectedCourseId) {
    return <></>
  }

  return (
    <div className="flex items-center gap-2 px-4">
      <Switch
        id="show-all-classes-toggle"
        checked={showAllClassesInCourse}
        onCheckedChange={setShowAllClassesInCourse}
      />
      <Label
        htmlFor="show-all-classes-toggle"
        className="text-sm font-medium cursor-pointer"
      >
        {t('editor.showAllClassesInCourse')}
      </Label>
    </div>
  )
}

export default ClassToggleSwitch
