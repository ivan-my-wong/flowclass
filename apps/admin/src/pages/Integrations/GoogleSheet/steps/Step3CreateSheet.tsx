import * as React from 'react'
import { useEffect, useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { LuInfo, LuLoader2 } from 'react-icons/lu'
import { toast } from 'sonner'

import Tabs from '@/components/TabWithListAndButton/Tabs'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { useIntegrationGoogle } from '@/hooks/useIntegrationGoogle' // For createSheet mutation
import {
  CreateSheetPayload,
  GoogleIntegrationStatus,
  GoogleSheetConfiguration,
  GoogleSyncFrequency,
} from '@/types/external/googleIntegration.type'

import { GoogleSheetWizardState } from '../index' // Import shared state type

// Define what constitutes a tab for data preview
export interface DataPreviewTab {
  id: 'studentInfo' | 'courseEnrollment' | 'progressTracking'
  label: string
  dataType: 'STUDENT_CRM' | 'PAYMENT_PROOF' | 'COURSE_PROGRESS' // Example, align with backend
  columns: string[]
}

interface Step3CreateSheetProps {
  wizardState: GoogleSheetWizardState
  initialIntegrationStatus?: GoogleIntegrationStatus | null
  previewTabsData?: DataPreviewTab[]
  onNavigateBack: () => void
  onSheetSuccessfullyCreated: (sheetDetails: GoogleSheetConfiguration) => void
  refetchStatusAfterCreate: () => void
}

interface FormData {
  autoSync: boolean
  syncFrequency: GoogleSyncFrequency
  formatDataAutomatically: boolean
  createSeparateSheets: boolean
  enableChangeNotifications: boolean
}

const Step3CreateSheet: React.FC<Step3CreateSheetProps> = ({
  wizardState,
  initialIntegrationStatus,
  previewTabsData,
  onNavigateBack,
  onSheetSuccessfullyCreated,
  refetchStatusAfterCreate,
}) => {
  const { createSheet } = useIntegrationGoogle()

  const defaultValues: FormData = {
    autoSync: true,
    syncFrequency: GoogleSyncFrequency.DAILY,
    formatDataAutomatically: true,
    createSeparateSheets: false,
    enableChangeNotifications: false,
  }

  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues,
  })

  const autoSyncEnabled = watch('autoSync')

  const [activePreviewTabId, setActivePreviewTabId] = useState<
    DataPreviewTab['id'] | undefined
  >(
    previewTabsData && previewTabsData.length > 0
      ? previewTabsData[0].id
      : undefined
  )

  useEffect(() => {
    if (previewTabsData && previewTabsData.length > 0) {
      const currentTabExists = previewTabsData.some(
        tab => tab.id === activePreviewTabId
      )
      if (!activePreviewTabId || !currentTabExists) {
        setActivePreviewTabId(previewTabsData[0].id)
      }
    } else {
      setActivePreviewTabId(undefined)
    }
  }, [previewTabsData, activePreviewTabId])

  const onSubmit = async (data: FormData) => {
    if (!wizardState.spreadsheetName) {
      toast.error('Spreadsheet name is missing. Please go back and set it.')
      return
    }
    if (!wizardState.selectedFolder?.id) {
      toast.error('Folder ID is missing. Please go back and select a folder.')
      return
    }

    const payload: CreateSheetPayload = {
      spreadsheetName: wizardState.spreadsheetName,
      googleDriveFolderId: wizardState.selectedFolder.id,
    }

    console.log(
      'Submitting payload based on current CreateSheetPayload type:',
      payload
    )
    console.log('Form Data (not included in current payload): ', data)

    try {
      const response = await createSheet.mutateAsync(payload)
      toast.success('Google Sheet created successfully!')
      refetchStatusAfterCreate()
      onSheetSuccessfullyCreated(response)
    } catch (error: any) {
      console.error('Error creating Google Sheet:', error)
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        'Failed to create Google Sheet.'
      toast.error(errorMessage)
    }
  }

  const tabItemsForCustomTabs: { value: string; label: string }[] =
    React.useMemo(() => {
      return previewTabsData
        ? previewTabsData.map(tab => ({ value: tab.id, label: tab.label }))
        : []
    }, [previewTabsData])

  const activeTabData = React.useMemo(() => {
    return previewTabsData?.find(tab => tab.id === activePreviewTabId)
  }, [previewTabsData, activePreviewTabId])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Data Preview</h3>
        {tabItemsForCustomTabs.length > 0 && activePreviewTabId ? (
          <>
            <Tabs
              labels={tabItemsForCustomTabs.map((tab: any) => tab.label)}
              defaultValue={activePreviewTabId}
            >
              {activeTabData && (
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {activeTabData.columns.map(col => (
                          <TableHead key={col}>{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          colSpan={activeTabData.columns.length}
                          className="text-center text-muted-foreground"
                        >
                          No sample data to display.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </Tabs>
          </>
        ) : (
          <p className="text-muted-foreground">
            Data preview is currently unavailable.
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Sync Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Controller
              name="autoSync"
              control={control}
              render={({ field }) => (
                <Switch
                  id="autoSync"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="autoSync" className="flex items-center">
              Auto-sync data
              <LuInfo className="h-4 w-4 ml-1.5 text-muted-foreground" />
            </Label>
          </div>
          {autoSyncEnabled && (
            <div className="ml-8">
              <Label htmlFor="syncFrequency">Sync Frequency</Label>
              <Controller
                name="syncFrequency"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      id="syncFrequency"
                      className="w-[180px] mt-1"
                    >
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Advanced Options</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Controller
              name="formatDataAutomatically"
              control={control}
              render={({ field }) => (
                <Switch
                  id="formatDataAutomatically"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="formatDataAutomatically">
              Format data automatically
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="createSeparateSheets"
              control={control}
              render={({ field }) => (
                <Switch
                  id="createSeparateSheets"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="createSeparateSheets">
              Create separate sheets for each data type
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="enableChangeNotifications"
              control={control}
              render={({ field }) => (
                <Switch
                  id="enableChangeNotifications"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled
                />
              )}
            />
            <Label
              htmlFor="enableChangeNotifications"
              className="text-muted-foreground"
            >
              Enable change notifications (Coming soon)
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onNavigateBack}
          disabled={createSheet.isLoading}
        >
          Back
        </Button>
        <Button type="submit" disabled={createSheet.isLoading}>
          {createSheet.isLoading && (
            <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Google Sheet
        </Button>
      </div>
      {createSheet.error && (
        <p className="text-sm font-medium text-destructive mt-2">
          Error:{' '}
          {(createSheet.error as any)?.message || 'An unknown error occurred'}
        </p>
      )}
    </form>
  )
}

export default Step3CreateSheet
