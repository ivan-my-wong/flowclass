import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'

import {
  getDivitConfig,
  saveDivitConfig,
  type SaveDivitConfigPayload,
} from '../../api/divit'
import PaymentSection from '../PaymentMethods/PaymentSection'

const QUERY_KEY_DIVIT_CONFIG = 'divitConfig'

const DivitSettingsSection = (): React.ReactElement => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()

  const institutionId = schoolData.currentSchool?.id as number
  const siteId = siteData.currentSite?.id as number

  const [apiKey, setApiKey] = useState('')
  const [signatureKey, setSignatureKey] = useState('')
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>(
    'sandbox',
  )
  const [enabled, setEnabled] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSigKey, setShowSigKey] = useState(false)

  const { data: config, isLoading } = useQuery(
    [QUERY_KEY_DIVIT_CONFIG, institutionId],
    () => getDivitConfig(institutionId),
    { enabled: !!institutionId },
  )

  useEffect(() => {
    if (config) {
      setEnvironment(config.environment)
      setEnabled(config.enabled)
    }
  }, [config])

  const { mutate: saveConfig, isLoading: isSaving } = useMutation(
    (payload: SaveDivitConfigPayload) => saveDivitConfig(payload),
    {
      onSuccess: () => {
        toast.success('Divit settings saved')
        setApiKey('')
        setSignatureKey('')
        queryClient.invalidateQueries([QUERY_KEY_DIVIT_CONFIG, institutionId])
      },
      onError: () => {
        toast.error('Failed to save Divit settings')
      },
    },
  )

  const handleSave = () => {
    if (!institutionId || !siteId) return
    saveConfig({
      institutionId,
      siteId,
      apiKey: apiKey || undefined,
      signatureKey: signatureKey || undefined,
      environment,
      enabled,
    })
  }

  const envToggle = (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm ${
          environment === 'sandbox' ? 'font-semibold' : 'text-text-subtle'
        }`}
      >
        Sandbox
      </span>
      <Switch
        checked={environment === 'production'}
        onCheckedChange={val => setEnvironment(val ? 'production' : 'sandbox')}
      />
      <span
        className={`text-sm ${
          environment === 'production' ? 'font-semibold' : 'text-text-subtle'
        }`}
      >
        Production
      </span>
    </div>
  )

  const enableToggle = (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-subtle">Enable</span>
      <Switch checked={enabled} onCheckedChange={setEnabled} />
    </div>
  )

  return (
    <PaymentSection
      title="Online payment (Handled by FPS by divit)"
      isCenter
      footer="Keys are stored encrypted. Leave fields blank to keep existing keys."
      footerAction={
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="whitespace-nowrap"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      }
    >
      <div className="flex flex-col gap-4 w-full">
        <p className="text-gray-500">
          to setup a divit merchant account, please visit&nbsp;
          <a
            className="text-primary"
            href="https://divit.com.hk"
            target="_blank"
          >
            here
          </a>
        </p>

        <div className="flex items-center justify-between">
          {envToggle}
          {enableToggle}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <Label htmlFor="divit-api-key">API Key</Label>
            <div className="relative">
              <Input
                id="divit-api-key"
                type={showApiKey ? 'text' : 'password'}
                placeholder={
                  config?.apiKeyMasked
                    ? '(saved — enter new value to replace)'
                    : 'dvt_…'
                }
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="pr-16"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-subtle underline"
                onClick={() => setShowApiKey(v => !v)}
              >
                {showApiKey ? 'hide' : 'show'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <Label htmlFor="divit-sig-key">Signature Key</Label>
            <div className="relative">
              <Input
                id="divit-sig-key"
                type={showSigKey ? 'text' : 'password'}
                placeholder={
                  config?.signatureKeyMasked
                    ? '(saved — enter new value to replace)'
                    : 'dvt_…'
                }
                value={signatureKey}
                onChange={e => setSignatureKey(e.target.value)}
                className="pr-16"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-subtle underline"
                onClick={() => setShowSigKey(v => !v)}
              >
                {showSigKey ? 'hide' : 'show'}
              </button>
            </div>
          </div>
        </div>

        {environment === 'sandbox' && (
          <p className="text-xs text-amber-500">
            Sandbox mode — payments will not be charged. Switch to Production
            when you go live.
          </p>
        )}
      </div>
    </PaymentSection>
  )
}

export default DivitSettingsSection
