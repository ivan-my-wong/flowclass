import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import Box from '@/components/Containers/Box'
import Label from '@/components/Inputs/Label'
import { CourseSelectorItem } from '@/components/Selector/CourseSelector'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'

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
  const [classSearch, setClassSearch] = useState('')

  const updateFormData = (updates: Partial<PackageFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const filteredClasses = useMemo(() => {
    if (!classSearch.trim()) return classes
    const query = classSearch.toLowerCase()
    return classes.filter(c => c.label.toLowerCase().includes(query))
  }, [classes, classSearch])

  const isAllVisibleSelected =
    filteredClasses.length > 0 &&
    filteredClasses.every(c => formData.selectedClassIds.includes(c.value))

  const handleSelectAllVisible = (checked: boolean) => {
    if (checked) {
      const visibleValues = filteredClasses.map(c => c.value)
      const merged = [
        ...new Set([...formData.selectedClassIds, ...visibleValues]),
      ]
      updateFormData({ selectedClassIds: merged })
    } else {
      const visibleValues = new Set(filteredClasses.map(c => c.value))
      updateFormData({
        selectedClassIds: formData.selectedClassIds.filter(
          id => !visibleValues.has(id)
        ),
      })
    }
  }

  return (
    <Box direction="column" css={{ width: '100%', gap: '24px' }}>
      {/* Name */}
      <Box
        direction="column"
        align="flex-start"
        css={{ width: '100%', gap: '8px' }}
      >
        <Label css={{ width: '100%', textAlign: 'left', fontWeight: 500 }}>
          {t('promotion:packageDiscount.form.name')}
        </Label>
        <Input
          type="text"
          value={formData.name}
          onChange={e => updateFormData({ name: e.target.value })}
          className="w-full"
          placeholder={t('promotion:packageDiscount.form.namePlaceholder') as string}
        />
      </Box>

      {/* Amount Per Lesson */}
      <Box
        direction="column"
        align="flex-start"
        css={{ width: '100%', gap: '8px' }}
      >
        <Label css={{ width: '100%', textAlign: 'left', fontWeight: 500 }}>
          {t('promotion:packageDiscount.form.amountPerLesson')}
        </Label>
        <Input
          type="number"
          min="0"
          step="1"
          value={formData.amountPerLesson}
          onChange={e =>
            updateFormData({ amountPerLesson: parseFloat(e.target.value) || 0 })
          }
          className="w-full"
          placeholder="0"
        />
        <Text css={{ fontSize: '13px', color: '#6b7280' }}>
          {t('promotion:packageDiscount.form.amountPerLessonHint')}
        </Text>
      </Box>

      {/* Class Selector with search and select-all */}
      <Box direction="column" css={{ width: '100%', gap: '8px' }}>
        <Label css={{ width: '100%', textAlign: 'left', fontWeight: 500 }}>
          {t('promotion:packageDiscount.form.selectClasses')}
          {formData.selectedClassIds.length > 0 && (
            <span
              style={{ fontWeight: 400, color: '#6b7280', marginLeft: '8px' }}
            >
              ({formData.selectedClassIds.length}{' '}
              {t('promotion:packageDiscount.form.selected')})
            </span>
          )}
        </Label>

        {/* Search bar */}
        <Input
          type="text"
          value={classSearch}
          onChange={e => setClassSearch(e.target.value)}
          className="w-full"
          placeholder={t('promotion:packageDiscount.form.searchClasses') as string}
        />

        {/* Select all visible checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 0',
          }}
        >
          <input
            type="checkbox"
            checked={isAllVisibleSelected}
            onChange={e => handleSelectAllVisible(e.target.checked)}
          />
          <Text css={{ fontSize: '13px', fontWeight: 500 }}>
            {t('promotion:packageDiscount.form.selectAllVisible', {
              count: filteredClasses.length,
            })}
          </Text>
        </label>

        {/* Class list */}
        <div className="w-full px-4 py-4 space-y-4 border border-gray-300 rounded-md max-h-[200px] overflow-y-auto">
          {filteredClasses.map(classItem => (
            <label
              key={classItem.value}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <input
                type="checkbox"
                checked={formData.selectedClassIds.includes(classItem.value)}
                onChange={e => {
                  const newList = e.target.checked
                    ? [...formData.selectedClassIds, classItem.value]
                    : formData.selectedClassIds.filter(
                        i => i !== classItem.value
                      )
                  updateFormData({ selectedClassIds: newList })
                }}
              />
              <Text css={{ fontSize: '13px' }}>{classItem.label}</Text>
            </label>
          ))}
          {filteredClasses.length === 0 && (
            <Text css={{ fontSize: '13px', color: '#9ca3af' }}>
              {classes.length === 0
                ? t('promotion:packageDiscount.form.noClassesAvailable')
                : t('promotion:packageDiscount.form.noMatchingClasses')}
            </Text>
          )}
        </div>
      </Box>

      {/* Submit */}
      <Box justify="flex-end" css={{ width: '100%', marginTop: '8px' }}>
        <Button onClick={onSubmit}>
          {submitButtonText ??
            (isEditing ? t('common:action.update') : t('common:action.create'))}
        </Button>
      </Box>
    </Box>
  )
}

export default CreatePackageDiscountForm
