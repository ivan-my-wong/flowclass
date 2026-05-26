import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export type PackageDiscountFormData = {
  name: string
  amountPerLesson: number
  isAllClasses: boolean
  applicableClassIds: number[]
}

type ClassOption = { id: number; label: string }

type PackageDiscountFormProps = {
  formData: PackageDiscountFormData
  setFormData: (data: PackageDiscountFormData) => void
  classOptions: ClassOption[]
  onSubmit: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

const PackageDiscountForm = ({
  formData,
  setFormData,
  classOptions,
  onSubmit,
  isSubmitting,
  submitLabel,
}: PackageDiscountFormProps) => {
  const { t } = useTranslation()

  const toggleClass = (id: number) => {
    const next = formData.applicableClassIds.includes(id)
      ? formData.applicableClassIds.filter(c => c !== id)
      : [...formData.applicableClassIds, id]
    setFormData({ ...formData, applicableClassIds: next })
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Name */}
      <div className="space-y-1">
        <label
          htmlFor="package-discount-name"
          className="text-sm font-medium text-gray-700"
        >
          {t('promotion:packageDiscount.form.name')}
        </label>
        <input
          id="package-discount-name"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={
            t('promotion:packageDiscount.form.namePlaceholder') as string
          }
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      {/* Amount per lesson */}
      <div className="space-y-1">
        <label
          htmlFor="package-discount-amount"
          className="text-sm font-medium text-gray-700"
        >
          {t('promotion:packageDiscount.form.amountPerLesson')}
        </label>
        <p className="text-xs text-gray-500">
          {t('promotion:packageDiscount.form.amountPerLessonHint')}
        </p>
        <input
          id="package-discount-amount"
          type="number"
          min={0}
          step={0.01}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={formData.amountPerLesson}
          onChange={e =>
            setFormData({
              ...formData,
              amountPerLesson: parseFloat(e.target.value) || 0,
            })
          }
        />
      </div>

      {/* Apply to all classes */}
      <div className="flex items-start gap-3">
        <input
          id="isAllClasses"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary"
          checked={formData.isAllClasses}
          onChange={e =>
            setFormData({ ...formData, isAllClasses: e.target.checked })
          }
        />
        <div>
          <label
            htmlFor="isAllClasses"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            {t('promotion:packageDiscount.form.applyToAllClasses')}
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('promotion:packageDiscount.form.applyToAllClassesHint')}
          </p>
        </div>
      </div>

      {/* Class selector (only when !isAllClasses) */}
      {!formData.isAllClasses && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {t('promotion:packageDiscount.form.selectClasses')}
          </p>
          {classOptions.length === 0 ? (
            <p className="text-sm text-gray-400">
              {t('promotion:packageDiscount.form.noClassesAvailable')}
            </p>
          ) : (
            <div className="border border-gray-200 rounded-md max-h-52 overflow-y-auto divide-y divide-gray-100">
              {classOptions.map(cls => (
                <label
                  key={cls.id}
                  htmlFor={`package-discount-class-${cls.id}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm',
                    formData.applicableClassIds.includes(cls.id) &&
                      'bg-primary/5'
                  )}
                >
                  <input
                    id={`package-discount-class-${cls.id}`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary"
                    checked={formData.applicableClassIds.includes(cls.id)}
                    onChange={() => toggleClass(cls.id)}
                  />
                  {cls.label}
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">
            {formData.applicableClassIds.length}{' '}
            {t('promotion:packageDiscount.form.selected')}
          </p>
        </div>
      )}

      <Button onClick={onSubmit} loading={isSubmitting}>
        {submitLabel ?? t('common:action.create')}
      </Button>
    </div>
  )
}

export default PackageDiscountForm
