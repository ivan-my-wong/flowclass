import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import {
  fetchAutomationSettings,
  fetchInvoiceCampaigns,
  updateAutomationSettings,
} from '@/api/invoiceCampaign'
import { Spinner } from '@/components/Loaders/Spinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import { Label } from '@/components/ui/Label'
import ModalDialog from '@/components/ui/ModalDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import useSchoolData from '@/hooks/useSchoolData'
import { InvoiceCampaign } from '@/types/templateManagement'

export const AutomationSettingsModal = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  const { t } = useTranslation()
  const { currentSchool } = useSchoolData()
  const institutionId = currentSchool?.id ?? 0

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<InvoiceCampaign[]>([])

  const [enabled, setEnabled] = useState(false)
  const [templateId, setTemplateId] = useState<number | null>(null)
  const [day, setDay] = useState(1)

  useEffect(() => {
    if (open && institutionId) {
      loadData()
    }
  }, [open, institutionId])

  const loadData = async () => {
    setInitialLoading(true)
    try {
      const [{ data }, settingsResult] = await Promise.all([
        fetchInvoiceCampaigns(institutionId, { limit: 100 }),
        fetchAutomationSettings(institutionId),
      ])
      setCampaigns(data || [])
      if (settingsResult?.settings) {
        setEnabled(!!settingsResult.settings.enableInvoiceCampaignDuplication)
        setTemplateId(settingsResult.settings.invoiceCampaignTemplateId || null)
        setDay(settingsResult.settings.invoiceCampaignDuplicationDay || 1)
      }
    } catch (e) {
      toast.error('Failed to load settings')
    }
    setInitialLoading(false)
  }

  const handleSave = async () => {
    if (enabled && !templateId) {
      toast.error('Please select a template')
      return
    }
    setLoading(true)
    try {
      await updateAutomationSettings(institutionId, {
        enableInvoiceCampaignDuplication: enabled,
        invoiceCampaignTemplateId: templateId,
        invoiceCampaignDuplicationDay: day,
      })
      toast.success('Settings saved successfully')
      onClose()
    } catch (e) {
      toast.error('Failed to save settings')
    }
    setLoading(false)
  }

  return (
    <ModalDialog
      title="Automation Settings"
      open={open}
      onOpenChange={isOpen => !isOpen && onClose()}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={loading || initialLoading}
          >
            Save
          </Button>
        </div>
      }
    >
      {initialLoading ? (
        <div className="py-8 flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-between gap-4 py-2">
            <Label
              htmlFor="enable-monthly-duplication"
              className="text-sm font-medium cursor-pointer"
            >
              Enable automatic monthly duplication
            </Label>
            <Switch
              id="enable-monthly-duplication"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {enabled && (
            <>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="template-select"
                  className="text-sm font-medium"
                >
                  Select Template
                </Label>
                <Select
                  value={templateId ? String(templateId) : ''}
                  onValueChange={val => setTemplateId(val ? Number(val) : null)}
                >
                  <SelectTrigger id="template-select" className="w-full">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="trigger-day" className="text-sm font-medium">
                  Day of month to trigger
                </Label>
                <Input
                  id="trigger-day"
                  type="number"
                  min={1}
                  max={31}
                  value={day}
                  onChange={e => setDay(Number(e.target.value))}
                  placeholder="Day of month (1-31)"
                />
              </div>
            </>
          )}
        </div>
      )}
    </ModalDialog>
  )
}
