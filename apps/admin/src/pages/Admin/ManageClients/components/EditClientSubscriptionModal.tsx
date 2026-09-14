import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuCalendar, LuPencil, LuTrash2, LuUsers } from 'react-icons/lu'

import { TransformedClient } from '@/components/Subscription/SubscriptionPlanRecordsTable'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Inputs/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import { PromotionType } from '@/types/coupon'
import { ClassTypeEnum } from '@/types/course'
import {
  AllIntegrations,
  ContactChannelIntegrations,
  FeatureEnableEnum,
  SubscriptionPlanRecord,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency } from '@/utils/currency'

type EditClientSubscriptionModalProps = {
  isOpen: boolean
  onClose: () => void
  selectedClient: TransformedClient
  onRefresh: () => void
}

// Helper function for rendering text input fields
const renderTextInput = (
  id: string,
  label: string,
  value: any,
  onChange: (value: any) => void,
  isEditMode: boolean,
  type: string = 'text',
  placeholder?: string
) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    {isEditMode ? (
      <Input
        id={id}
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ) : (
      <div className="p-2 bg-gray-50 rounded">{value || 'N/A'}</div>
    )}
  </div>
)

// Helper function for rendering number input fields
const renderNumberInput = (
  id: string,
  label: string,
  value: any,
  onChange: (value: number) => void,
  isEditMode: boolean,
  step?: string
) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    {isEditMode ? (
      <Input
        id={id}
        type="number"
        step={step}
        value={value || ''}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    ) : (
      <div className="p-2 bg-gray-50 rounded">{value || 'N/A'}</div>
    )}
  </div>
)

// Helper function for rendering datetime input fields
const renderDateTimeInput = (
  id: string,
  label: string,
  value: any,
  onChange: (value: string) => void,
  isEditMode: boolean
) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    {isEditMode ? (
      <Input
        id={id}
        type="datetime-local"
        value={value ? new Date(value).toISOString().slice(0, 16) : ''}
        onChange={e => onChange(e.target.value)}
      />
    ) : (
      <div className="p-2 bg-gray-50 rounded">
        {value ? new Date(value).toLocaleString() : 'N/A'}
      </div>
    )}
  </div>
)

// Helper function for rendering multi-select checkbox fields for features/permissions
const renderMultiSelectInput = (
  id: string,
  label: string,
  value: Record<string, boolean> | undefined,
  onChange: (value: Record<string, boolean>) => void,
  isEditMode: boolean,
  options: string[]
) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    {isEditMode ? (
      <div className="border border-gray-300 rounded p-3 max-h-40 overflow-y-auto">
        {options.map(option => (
          <div key={option} className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              id={`${id}-${option}`}
              checked={value?.[option] || false}
              onChange={e => {
                const newValue = { ...value }
                if (e.target.checked) {
                  newValue[option] = true
                } else {
                  delete newValue[option]
                }
                onChange(newValue)
              }}
              className="rounded"
            />
            <label
              htmlFor={`${id}-${option}`}
              className="text-sm cursor-pointer"
            >
              {option.replace(/_/g, ' ')}
            </label>
          </div>
        ))}
        {options.length === 0 && (
          <div className="text-sm text-gray-500">No options available</div>
        )}
      </div>
    ) : (
      <div className="p-2 bg-gray-50 rounded text-xs">
        {value && Object.keys(value).length > 0 ? (
          <div className="space-y-1">
            {Object.entries(value)
              .filter(([, enabled]) => enabled)
              .map(([key]) => (
                <div
                  key={key}
                  className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1"
                >
                  {key.replace(/_/g, ' ')}
                </div>
              ))}
          </div>
        ) : (
          'No features enabled'
        )}
      </div>
    )}
  </div>
)

// Helper function for rendering select dropdown fields
const renderSelectInput = (
  id: string,
  label: string,
  value: any,
  onChange: (value: string) => void,
  isEditMode: boolean,
  options: { value: string; label: string }[],
  formatDisplayValue?: (value: string) => string
) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    {isEditMode ? (
      <select
        id={id}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <div className="p-2 bg-gray-50 rounded">
        {formatDisplayValue ? formatDisplayValue(value) : value || 'N/A'}
      </div>
    )}
  </div>
)

// Helper function for rendering switch toggle fields
const renderSwitchInput = (
  id: string,
  label: string,
  value: boolean,
  onChange: (value: boolean) => void,
  isEditMode: boolean
) => (
  <div className="flex items-center space-x-2">
    <Switch
      id={id}
      checked={value || false}
      onCheckedChange={onChange}
      disabled={!isEditMode}
    />
    <Label htmlFor={id}>{label}</Label>
  </div>
)

const EditClientSubscriptionModal = ({
  isOpen,
  onClose,
  selectedClient,
  onRefresh,
}: EditClientSubscriptionModalProps): JSX.Element => {
  const { t } = useTranslation()
  const [editFormData, setEditFormData] = useState<
    Partial<SubscriptionPlanRecord>
  >(selectedClient?.planRecord || {})
  const [isEditMode, setIsEditMode] = useState(false)

  const { useUpdateSubscriptionPlanRecord, useDeleteSubscriptionPlanRecord } =
    usePlanData()

  // Mutation hooks for edit and delete
  const updateMutation = useUpdateSubscriptionPlanRecord(data => {
    console.log('Record updated successfully:', data)
    setIsEditMode(false)
    onRefresh() // Refresh the data
    onClose()
  })

  const deleteMutation = useDeleteSubscriptionPlanRecord(() => {
    console.log('Record deleted successfully')
    onRefresh() // Refresh the data
    onClose()
  })

  // Initialize form data when client changes
  useEffect(() => {
    if (selectedClient) {
      setEditFormData(selectedClient.planRecord)
      setIsEditMode(false)
    }
  }, [selectedClient])

  // Handle form input changes
  const handleInputChange = (
    field: keyof SubscriptionPlanRecord,
    value: any
  ) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle save changes
  const handleSaveChanges = () => {
    if (!selectedClient || !editFormData.id) return

    updateMutation.mutate({
      id: editFormData.id,
      data: editFormData,
    })
  }

  // Handle delete record
  const handleDeleteRecord = () => {
    if (!selectedClient || !editFormData.id) return

    if (
      // eslint-disable-next-line no-alert
      window.confirm(
        'Are you sure you want to delete this subscription record? This action cannot be undone.'
      )
    ) {
      deleteMutation.mutate(editFormData.id)
    }
  }

  const handleClose = () => {
    setIsEditMode(false)
    setEditFormData({})
    onClose()
  }

  // Customer support tier options
  const customerSupportTierOptions = [
    { value: 'FREE_TIER', label: 'Free' },
    { value: 'STARTER_TIER', label: 'Starter' },
    { value: 'GROWTH_TIER', label: 'Growth' },
    { value: 'PRO_TIER', label: 'Pro' },
    { value: 'ENTERPRISE_TIER', label: 'Enterprise' },
    { value: 'CUSTOM_TIER', label: 'Custom' },
  ]

  // Feature options from enums
  const featureEnableOptions = Object.values(FeatureEnableEnum)
  const contactChannelOptions = Object.values(ContactChannelIntegrations)
  const integrationOptions = Object.values(AllIntegrations)
  const classTypeOptions = Object.values(ClassTypeEnum)
  const promotionOptions = Object.values(PromotionType)

  if (!selectedClient || !selectedClient.planRecord || !editFormData) {
    return <></>
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="box-row justify-between mr-4">
            <span>Subscription Plan Record Details</span>
            <div className="flex items-center gap-2">
              {!isEditMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                >
                  <LuPencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditMode(false)
                      setEditFormData(selectedClient?.planRecord || {})
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveChanges}
                    disabled={updateMutation.isLoading}
                  >
                    {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteRecord}
                disabled={deleteMutation.isLoading}
              >
                <LuTrash2 className="h-4 w-4 mr-2" />
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {selectedClient && (
          <div className="box-col">
            {/* Client Information */}
            <div className="bg-blue-50 p-4 rounded-lg w-full">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <LuUsers className="h-4 w-4" />
                Client Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-medium">Site ID:</span>{' '}
                  {selectedClient.siteId}
                </div>
                <div>
                  <span className="font-medium">Record ID:</span>{' '}
                  {selectedClient.id}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  {selectedClient.status}
                </div>
                <div>
                  <span className="font-medium">Total Amount:</span>{' '}
                  {selectedClient.totalAmount}
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  Basic Information
                </h3>

                <div className="space-y-3">
                  {renderTextInput(
                    'planIds',
                    'Plan IDs',
                    editFormData?.planIds?.join(', '),
                    (value: string) =>
                      handleInputChange(
                        'planIds',
                        value
                          .split(',')
                          .map(id => parseInt(id.trim(), 10))
                          .filter(id => !Number.isNaN(id))
                      ),
                    isEditMode,
                    'text',
                    'Enter plan IDs separated by commas'
                  )}

                  <div>
                    <Label htmlFor="totalPrice">Total Price</Label>
                    {isEditMode ? (
                      <Input
                        id="totalPrice"
                        type="number"
                        step="0.01"
                        value={editFormData.totalPrice || ''}
                        onChange={e =>
                          handleInputChange(
                            'totalPrice',
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded">
                        {editFormData.totalPrice
                          ? formatCurrency(editFormData.totalPrice, 'HKD')
                          : 'N/A'}
                      </div>
                    )}
                  </div>

                  {renderSwitchInput(
                    'isTrial',
                    'Trial Account',
                    editFormData.isTrial || false,
                    (checked: boolean) => handleInputChange('isTrial', checked),
                    isEditMode
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <LuCalendar className="h-4 w-4" />
                  Important Dates
                </h3>

                <div className="space-y-3">
                  {renderDateTimeInput(
                    'purchaseDate',
                    'Purchase Date',
                    editFormData.purchaseDate,
                    (value: string) => handleInputChange('purchaseDate', value),
                    isEditMode
                  )}

                  {renderDateTimeInput(
                    'expiryDate',
                    'Expiry Date',
                    editFormData.expiryDate,
                    (value: string) => handleInputChange('expiryDate', value),
                    isEditMode
                  )}

                  {renderTextInput(
                    'stripeSubscriptionId',
                    'Stripe Subscription ID',
                    editFormData.stripeSubscriptionId,
                    (value: string) =>
                      handleInputChange('stripeSubscriptionId', value),
                    isEditMode
                  )}
                </div>
              </div>
            </div>

            {/* Quantities Section */}
            <div className="box-col">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                Quantities & Limits
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {renderNumberInput(
                  'baseUserQuantity',
                  'Base User Quantity',
                  editFormData.baseUserQuantity,
                  (value: number) =>
                    handleInputChange(
                      'baseUserQuantity',
                      parseInt(value.toString(), 10)
                    ),
                  isEditMode
                )}

                {renderNumberInput(
                  'schoolQuantity',
                  'School Quantity',
                  editFormData.schoolQuantity,
                  (value: number) =>
                    handleInputChange(
                      'schoolQuantity',
                      parseInt(value.toString(), 10)
                    ),
                  isEditMode
                )}

                {renderNumberInput(
                  'notificationQuantity',
                  'Notification Quantity',
                  editFormData.notificationQuantity,
                  (value: number) =>
                    handleInputChange(
                      'notificationQuantity',
                      parseInt(value.toString(), 10)
                    ),
                  isEditMode
                )}

                {renderNumberInput(
                  'setupFeeQuantity',
                  'Setup Fee Quantity',
                  editFormData.setupFeeQuantity,
                  (value: number) =>
                    handleInputChange(
                      'setupFeeQuantity',
                      parseInt(value.toString(), 10)
                    ),
                  isEditMode
                )}

                {renderNumberInput(
                  'adminQuantity',
                  'Admin Quantity',
                  editFormData.adminQuantity,
                  (value: number) =>
                    handleInputChange(
                      'adminQuantity',
                      parseInt(value.toString(), 10)
                    ),
                  isEditMode
                )}

                {renderNumberInput(
                  'tutorQuantity',
                  'Tutor Quantity',
                  editFormData.tutorQuantity,
                  (value: number) =>
                    handleInputChange(
                      'tutorQuantity',
                      parseInt(value.toString(), 10)
                    ),
                  isEditMode
                )}
              </div>
            </div>

            {/* Features & Permissions Section */}
            <div className="box-col">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                Features & Permissions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {renderMultiSelectInput(
                  'classTypeEnable',
                  'Class Type Enable',
                  editFormData.classTypeEnable,
                  (value: Record<string, boolean>) =>
                    handleInputChange('classTypeEnable', value),
                  isEditMode,
                  classTypeOptions
                )}

                {renderMultiSelectInput(
                  'featureEnable',
                  'Feature Enable',
                  editFormData.featureEnable,
                  (value: Record<string, boolean>) =>
                    handleInputChange('featureEnable', value),
                  isEditMode,
                  featureEnableOptions
                )}

                {renderMultiSelectInput(
                  'notificationChannels',
                  'Notification Channels',
                  editFormData.notificationChannels,
                  (value: Record<string, boolean>) =>
                    handleInputChange('notificationChannels', value),
                  isEditMode,
                  contactChannelOptions
                )}

                {renderMultiSelectInput(
                  'promotionTier',
                  'Promotion Tier',
                  editFormData.promotionTier,
                  (value: Record<string, boolean>) =>
                    handleInputChange('promotionTier', value),
                  isEditMode,
                  promotionOptions
                )}

                {renderMultiSelectInput(
                  'integration',
                  'Integration',
                  editFormData.integration,
                  (value: Record<string, boolean>) =>
                    handleInputChange('integration', value),
                  isEditMode,
                  integrationOptions
                )}

                {renderSelectInput(
                  'customerSupportTier',
                  'Customer Support Tier',
                  editFormData.customerSupportTier,
                  (value: string) =>
                    handleInputChange('customerSupportTier', value),
                  isEditMode,
                  customerSupportTierOptions,
                  (value: string) => value?.replace('_TIER', '') || 'N/A'
                )}
              </div>
            </div>

            {/* Raw Data Preview */}
            <div className="box-col">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                Raw Data (Read-Only)
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {JSON.stringify(selectedClient.planRecord, null, 2)}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="box-row justify-between">
              <div className="text-sm text-muted-foreground">
                {isEditMode
                  ? 'Make your changes and click Save Changes to update the record.'
                  : 'Click Edit to modify this subscription record.'}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EditClientSubscriptionModal
