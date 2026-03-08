import { useState } from 'react'

import DatePicker from 'react-datepicker'
import { useTranslation } from 'react-i18next'

import Box from '@/components/Containers/Box'
import Label from '@/components/Inputs/Label'
import { CourseSelectorItem } from '@/components/Selector/CourseSelector'
import Text from '@/components/Texts/Text'
import Switch from '@/components/Toggle/Switch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { DEFAULT_CURRENCY } from '@/constants/invoices'
import { DiscountType } from '@/types/coupon'

import 'react-datepicker/dist/react-datepicker.css'

// Interface for form data
interface BundleFormData {
  name: string
  minQty: number
  discountType: DiscountType
  discountValue: number
  applyToAll: boolean
  selectedItems: string[]
  startDate: Date | null
  endDate: Date | null
  autoApply: boolean
  retroactive: boolean
}

interface CreateBundleFormProps {
  setConfirmCreate: (open: boolean) => void
  classes: CourseSelectorItem[]
  formData: BundleFormData
  setFormData: (data: BundleFormData) => void
  isEditing?: boolean
  submitButtonText?: string | null | undefined
  currency?: string
}

const CreateBundleForm = ({
  setConfirmCreate,
  classes,
  formData,
  setFormData,
  isEditing = false,
  submitButtonText = 'Create Campaign',
  currency = DEFAULT_CURRENCY,
}: CreateBundleFormProps) => {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)

  const stepTitle = isEditing
    ? [
        t('promotion:bundleDiscount.steps.editRules'),
        t('promotion:bundleDiscount.steps.editSettings'),
      ]
    : [
        t('promotion:bundleDiscount.steps.discountRules'),
        t('promotion:bundleDiscount.steps.settings'),
      ]

  // Helper function to update form data
  const updateFormData = (updates: Partial<BundleFormData>) => {
    setFormData({ ...formData, ...updates })
  }

  return (
    <Box direction="column" css={{ width: '100%' }}>
      <Box
        justify="center"
        align="center"
        css={{ marginBottom: '24px', gap: '32px' }}
      >
        {stepTitle.map((title, index) => {
          const isActive = step === index + 1
          const isCompleted = step > index + 1

          return (
            <Box
              key={index}
              direction="column"
              align="center"
              css={{ position: 'relative', textAlign: 'center' }}
            >
              <Box
                justify="center"
                align="center"
                css={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor:
                    isCompleted || isActive ? '#2563eb' : '#e5e7eb',
                  color: isCompleted || isActive ? 'white' : '#6b7280',
                  fontWeight: 500,
                  zIndex: 1,
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </Box>

              {index < stepTitle.length - 1 && (
                <Box
                  css={{
                    position: 'absolute',
                    top: '16px',
                    left: '100%',
                    height: '2px',
                    width: '48px',
                    backgroundColor: step > index + 1 ? '#2563eb' : '#e5e7eb',
                  }}
                >
                  {null}
                </Box>
              )}

              <Text
                css={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: isActive || isCompleted ? '#111827' : '#9ca3af',
                }}
              >
                {title}
              </Text>
            </Box>
          )
        })}
      </Box>

      {step === 1 && (
        <Box
          direction="column"
          align="flex-start"
          css={{ width: '100%', gap: '24px' }}
        >
          <Box
            direction="column"
            align="flex-start"
            css={{ width: '100%', gap: '8px' }}
          >
            <Label
              css={{
                width: '100%',
                textAlign: 'left',
                fontWeight: 500,
              }}
            >
              {t('promotion:bundleDiscount.form.name')}
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={e => updateFormData({ name: e.target.value })}
              className="w-full"
              placeholder="Enter campaign name"
            />
          </Box>

          <Box
            direction="column"
            align="flex-start"
            css={{ width: '100%', gap: '8px' }}
          >
            <Label
              css={{
                width: '100%',
                textAlign: 'left',
                fontWeight: 500,
              }}
            >
              {t('promotion:bundleDiscount.form.minimumQty')}
            </Label>
            <Input
              type="number"
              value={formData.minQty}
              onChange={e => updateFormData({ minQty: Number(e.target.value) })}
              className="w-full"
              min="1"
            />
          </Box>

          <Box direction="column" css={{ width: '100%', gap: '8px' }}>
            <Label
              css={{
                width: '100%',
                textAlign: 'left',
                fontWeight: 500,
              }}
            >
              {t('promotion:bundleDiscount.form.discountType')}
            </Label>
            <Select
              value={formData.discountType}
              onValueChange={val =>
                updateFormData({ discountType: val as DiscountType })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t(
                    'promotion:bundleDiscount.form.selectDiscountPlaceholder'
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={DiscountType.PERCENTAGE}>
                    {t('promotion:percentage')}
                  </SelectItem>
                  <SelectItem value={DiscountType.FIXED_AMOUNT}>
                    {t('promotion:fixedAmount')}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Box>

          <Box direction="column" css={{ width: '100%', gap: '8px' }}>
            <Label
              css={{
                width: '100%',
                textAlign: 'left',
                fontWeight: 500,
              }}
            >
              {t('promotion:bundleDiscount.form.discountAmount')}
            </Label>
            <Input
              type="number"
              value={formData.discountValue}
              onChange={e =>
                updateFormData({ discountValue: Number(e.target.value) })
              }
              className="w-full"
              min="0"
              step={
                formData.discountType === DiscountType.PERCENTAGE ? '1' : '0.01'
              }
            />
          </Box>

          <Box direction="column" css={{ width: '100%', gap: '8px' }}>
            <Label
              css={{
                width: '100%',
                textAlign: 'left',
                fontWeight: 500,
              }}
            >
              {t('promotion:bundleDiscount.form.applicableTo.title')}
            </Label>

            <Box direction="column" align="flex-start" gap="small">
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                htmlFor="applyToAll"
              >
                <input
                  type="radio"
                  checked={formData.applyToAll}
                  onChange={() =>
                    updateFormData({ applyToAll: true, selectedItems: [] })
                  }
                />
                <Text>
                  {t('promotion:bundleDiscount.form.applicableTo.allClasses')}
                </Text>
              </label>

              <label
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                htmlFor="applyToSpecificClasses"
              >
                <input
                  type="radio"
                  checked={!formData.applyToAll}
                  onChange={() => updateFormData({ applyToAll: false })}
                />
                <Text>
                  {t(
                    'promotion:bundleDiscount.form.applicableTo.specificClasses'
                  )}
                </Text>
              </label>
            </Box>

            {!formData.applyToAll && (
              <div className="w-full px-4 py-4 space-y-4 border border-gray-300 rounded-md max-h-[200px] overflow-y-auto">
                {classes.map(classItem => (
                  <label
                    key={classItem.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    htmlFor={classItem.value}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedItems.includes(classItem.value)}
                      onChange={e => {
                        const newList = e.target.checked
                          ? [...formData.selectedItems, classItem.value]
                          : formData.selectedItems.filter(
                              i => i !== classItem.value
                            )
                        updateFormData({ selectedItems: newList })
                      }}
                    />
                    <Text css={{ fontSize: '13px' }}>{classItem.label}</Text>
                  </label>
                ))}
              </div>
            )}
          </Box>

          <Box direction="column" css={{ width: '100%', gap: '8px' }}>
            <Label
              css={{
                width: '100%',
                textAlign: 'left',
                fontWeight: 500,
              }}
            >
              {t('promotion:bundleDiscount.form.startDate')}
            </Label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date: Date | null) =>
                updateFormData({ startDate: date })
              }
              selectsStart
              startDate={formData.startDate}
              endDate={formData.endDate}
              placeholderText={
                t('promotion:bundleDiscount.form.startDatePlaceholder') ??
                undefined
              }
              dateFormat="dd/MM/yyyy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              wrapperClassName="w-full"
              minDate={new Date()}
            />
          </Box>

          <Box direction="column" css={{ width: '100%', gap: '8px' }}>
            <Label
              css={{
                width: '100%',
                textAlign: 'left',
                fontWeight: 500,
              }}
            >
              {t('promotion:bundleDiscount.form.endDate')}
            </Label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date: Date | null) =>
                updateFormData({ endDate: date })
              }
              selectsEnd
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={formData.startDate || new Date()}
              placeholderText={
                t('promotion:bundleDiscount.form.endDatePlaceholder') ??
                undefined
              }
              dateFormat="dd/MM/yyyy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              wrapperClassName="w-full"
            />
          </Box>
        </Box>
      )}

      {step === 2 && (
        <Box
          direction="column"
          align="flex-start"
          css={{ width: '100%', gap: '24px' }}
        >
          {/* Auto-Apply Section */}
          <Box
            css={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              width: '100%',
              backgroundColor: '#fff',
            }}
          >
            <Box
              direction="row"
              justify="space-between"
              align="center"
              css={{ width: '100%' }}
            >
              <Box
                direction="column"
                justify="space-between"
                align="flex-start"
                css={{ maxWidth: '70%' }}
              >
                <Text css={{ fontWeight: 600, fontSize: '14px' }}>
                  {t('promotion:bundleDiscount.form.autoApply')}
                </Text>
                <Text
                  css={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}
                >
                  {t('promotion:bundleDiscount.form.autoApplyDescription')}
                </Text>
              </Box>
              <Box direction="column" align="flex-end">
                <Switch
                  checked={formData.autoApply}
                  className="justify-end"
                  onCheckedChange={checked =>
                    updateFormData({ autoApply: checked })
                  }
                />
              </Box>
            </Box>
          </Box>

          {/* Retroactive Application Section */}
          <Box
            css={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              width: '100%',
              backgroundColor: '#fff',
            }}
          >
            <Box
              direction="row"
              justify="space-between"
              align="center"
              css={{ width: '100%' }}
            >
              <Box
                direction="column"
                justify="space-between"
                align="flex-start"
                css={{ maxWidth: '70%' }}
              >
                <Text css={{ fontWeight: 600, fontSize: '14px' }}>
                  {t('promotion:bundleDiscount.form.retroactive')}
                </Text>
                <Text
                  css={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}
                >
                  {t('promotion:bundleDiscount.form.retroactiveDescription')}
                </Text>

                {/* Simple info box when retroactive is enabled */}
                {formData.retroactive && (
                  <Box
                    css={{
                      marginTop: '12px',
                      padding: '10px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#1e40af',
                      lineHeight: '1.5',
                    }}
                  >
                    <div>
                      <strong>📊 Retroactive Mode:</strong>
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      • Counts all courses in the same month
                      <br />
                      • Multiple classes from same course = 1 course
                      <br />• Discount applies to the latest invoice
                    </div>
                  </Box>
                )}
              </Box>

              <Box direction="column" align="flex-end">
                <Switch
                  className="justify-end"
                  checked={formData.retroactive}
                  onCheckedChange={checked =>
                    updateFormData({ retroactive: checked })
                  }
                />
              </Box>
            </Box>
          </Box>

          {/* Campaign Preview */}
          <Box
            direction="column"
            align="flex-start"
            css={{
              backgroundColor: '#eef4ff',
              borderRadius: '8px',
              padding: '20px',
              width: '100%',
              color: '#1e3a8a',
            }}
          >
            <Box direction="column" align="flex-start" css={{ width: '100%' }}>
              <Text
                css={{
                  fontWeight: 600,
                  fontSize: '14px',
                  marginBottom: '16px',
                }}
              >
                {t('promotion:bundleDiscount.form.preview.title')}
              </Text>
            </Box>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              }}
            >
              <tbody>
                <tr>
                  <td style={{ padding: '6px 12px 6px 0' }}>
                    {t('promotion:bundleDiscount.form.preview.name')}:
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formData.name ||
                      t('promotion:bundleDiscount.form.preview.untitled')}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 12px 6px 0' }}>Type:</td>
                  <td style={{ textAlign: 'right' }}>Quantity</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 12px 6px 0' }}>
                    {t('promotion:bundleDiscount.form.preview.minimumQty')}:{' '}
                  </td>
                  <td style={{ textAlign: 'right' }}>{formData.minQty}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 12px 6px 0' }}>
                    {t('promotion:bundleDiscount.form.preview.discountAmount')}:
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formData.discountValue}
                    {formData.discountType === DiscountType.PERCENTAGE
                      ? '%'
                      : ` ${currency || 'HK$'}`}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 12px 6px 0' }}>
                    {t('promotion:bundleDiscount.form.preview.autoApply')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formData.autoApply ? 'Yes' : 'No'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 12px 6px 0' }}>
                    {t('promotion:bundleDiscount.form.preview.retroactive')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formData.retroactive ? 'Yes' : 'No'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 12px 6px 0' }}>
                    {t('promotion:bundleDiscount.form.preview.applyTo')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formData.applyToAll
                      ? 'All Classes'
                      : `${formData.selectedItems.length} Selected`}
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
        </Box>
      )}

      <Box justify="space-between" css={{ marginTop: '24px' }}>
        {step > 1 ? (
          <Button onClick={() => setStep(step - 1)}>
            {t('common:action.previous')}
          </Button>
        ) : (
          <div />
        )}
        {step < stepTitle.length ? (
          <Button onClick={() => setStep(step + 1)}>
            {t('common:action.next')}
          </Button>
        ) : (
          <Button onClick={() => setConfirmCreate(true)}>
            {submitButtonText}
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default CreateBundleForm
