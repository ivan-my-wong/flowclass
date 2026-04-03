import { useTranslation } from 'react-i18next'

import { CourseSelectorItem } from '@/components/Selector/CourseSelector'
import { Button } from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'

import { PackageFormData } from './CreatePackageDiscount'

const CreatePackageDiscountForm = ({
  formData,
  setFormData,
  classes,
  onSubmit,
  isEditing = false,
  submitButtonText,
}: {
  formData: PackageFormData
  setFormData: React.Dispatch<React.SetStateAction<PackageFormData>>
  classes: CourseSelectorItem[]
  onSubmit: () => void
  isEditing?: boolean
  submitButtonText?: string
}): JSX.Element => {
  const { t } = useTranslation()

  const handleClassToggle = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedClassIds: prev.selectedClassIds.includes(classId)
        ? prev.selectedClassIds.filter(id => id !== classId)
        : [...prev.selectedClassIds, classId],
    }))
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label>{t('promotion:packageDiscount.form.name')}</Label>
        <Input
          value={formData.name}
          onChange={e =>
            setFormData(prev => ({ ...prev, name: e.target.value }))
          }
          placeholder={t('promotion:packageDiscount.form.namePlaceholder')}
        />
      </div>

      {/* Amount Per Lesson */}
      <div className="space-y-2">
        <Label>{t('promotion:packageDiscount.form.amountPerLesson')}</Label>
        <Input
          type="number"
          min={0}
          step={1}
          value={formData.amountPerLesson}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              amountPerLesson: parseFloat(e.target.value) || 0,
            }))
          }
          placeholder="0"
        />
        <p className="text-sm text-gray-500">
          {t('promotion:packageDiscount.form.amountPerLessonHint')}
        </p>
      </div>

      {/* Apply to all classes toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label>{t('promotion:packageDiscount.form.applyToAllClasses')}</Label>
          <p className="text-sm text-gray-500">
            {t('promotion:packageDiscount.form.applyToAllClassesHint')}
          </p>
        </div>
        <Switch
          checked={formData.applyToAllClasses}
          onCheckedChange={checked =>
            setFormData(prev => ({
              ...prev,
              applyToAllClasses: checked,
              selectedClassIds: checked ? [] : prev.selectedClassIds,
            }))
          }
        />
      </div>

      {/* Class Selector */}
      {!formData.applyToAllClasses && (
        <div className="space-y-2">
          <Label>{t('promotion:packageDiscount.form.selectClasses')}</Label>
          <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 space-y-1">
            {classes.map(classItem => (
              <label
                key={classItem.value}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.selectedClassIds.includes(classItem.value)}
                  onChange={() => handleClassToggle(classItem.value)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{classItem.label}</span>
              </label>
            ))}
            {classes.length === 0 && (
              <p className="text-sm text-gray-400 p-2">
                {t('promotion:packageDiscount.form.noClassesAvailable')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('promotion:packageDiscount.form.startDate')}</Label>
          <DatePicker
            date={formData.startDate}
            onSelect={date =>
              setFormData(prev => ({ ...prev, startDate: date ?? null }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>{t('promotion:packageDiscount.form.endDate')}</Label>
          <DatePicker
            date={formData.endDate}
            onSelect={date =>
              setFormData(prev => ({ ...prev, endDate: date ?? null }))
            }
          />
        </div>
      </div>

      {/* Submit */}
      <Button onClick={onSubmit} className="w-full">
        {submitButtonText ??
          (isEditing
            ? t('common:action.update')
            : t('common:action.create'))}
      </Button>
    </div>
  )
}

export default CreatePackageDiscountForm
