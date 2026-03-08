import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'

import StepIndicator from '@/components/ProgressIndicator/StepIndicator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useIntegrationGoogle } from '@/hooks/useIntegrationGoogle'
import type { GoogleDriveFolder } from '@/types/external/googleIntegration.type'

import Step1Connect from './steps/Step1Connect'
import Step2ConfigureFolder from './steps/Step2ConfigureFolder'
import Step3CreateSheet from './steps/Step3CreateSheet'
import Step4Complete from './steps/Step4Complete'

const WIZARD_STEPS = ['Connect', 'Configure', 'Create', 'Complete']

export interface GoogleSheetWizardState {
  selectedFolder?: GoogleDriveFolder
  spreadsheetName?: string
}

const GoogleSheetIntegrationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [wizardState, setWizardState] = useState<GoogleSheetWizardState>({})

  const {
    sheetIntegrationStatus,
    refetchSheetIntegrationStatus,
    driveFolders,
    fetchDriveFolders,
  } = useIntegrationGoogle()

  const {
    data: currentSheetIntegrationStatus, // This is GoogleIntegrationStatus | undefined
    isLoading: isLoadingStatus,
  } = sheetIntegrationStatus

  useEffect(() => {
    if (!isLoadingStatus) {
      const isActive = currentSheetIntegrationStatus?.isActive
      const sheetConfigured =
        !!currentSheetIntegrationStatus?.sheetConfiguration?.spreadsheetId // Corrected access

      if (!isActive && currentStep !== 1) {
        setCurrentStep(1)
      } else if (isActive && !sheetConfigured && currentStep > 2) {
        // Optional: Navigate to step 2 if connected but not configured
        // setCurrentStep(2);
      }
    }
  }, [currentSheetIntegrationStatus, isLoadingStatus, currentStep])

  useEffect(() => {
    if (currentStep === 2 && currentSheetIntegrationStatus?.isActive) {
      fetchDriveFolders(true)
    }
  }, [currentStep, currentSheetIntegrationStatus?.isActive, fetchDriveFolders])

  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length))
  }, [])

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }, [])

  const onStep1Completed = useCallback(() => {
    if (currentSheetIntegrationStatus?.isActive) {
      handleNext()
    } else {
      refetchSheetIntegrationStatus()
    }
  }, [currentSheetIntegrationStatus, handleNext, refetchSheetIntegrationStatus])

  const onStep1Disconnected = useCallback(() => {
    setCurrentStep(1)
    refetchSheetIntegrationStatus()
  }, [refetchSheetIntegrationStatus])

  const onStep2Completed = useCallback(
    (folder: GoogleDriveFolder | null, name: string) => {
      if (folder) {
        setWizardState(prev => ({
          ...prev,
          selectedFolder: folder,
          spreadsheetName: name,
        }))
      }
      handleNext()
    },
    [handleNext]
  )

  const onSheetSuccessfullyCreatedInStep3 = useCallback(() => {
    refetchSheetIntegrationStatus()
    handleNext()
  }, [handleNext, refetchSheetIntegrationStatus])

  const renderStepContent = () => {
    const wizardControlProps = {
      onNavigateBack: handleBack,
      onNavigateNext: handleNext,
    }

    const displayProps = {
      initialIntegrationStatus: currentSheetIntegrationStatus,
      isWizardLoading: isLoadingStatus,
    }

    switch (currentStep) {
      case 1:
        return (
          <Step1Connect
            {...displayProps}
            onConnectionComplete={onStep1Completed}
            onDisconnectionComplete={onStep1Disconnected}
            onNavigateNext={handleNext}
          />
        )
      case 2:
        return (
          <Step2ConfigureFolder
            {...wizardControlProps}
            {...displayProps}
            driveFoldersQuery={driveFolders}
            fetchDriveFolders={fetchDriveFolders}
            onConfigurationComplete={onStep2Completed}
            wizardState={wizardState}
          />
        )
      case 3:
        return (
          <Step3CreateSheet
            {...wizardControlProps}
            {...displayProps}
            wizardState={wizardState}
            onSheetSuccessfullyCreated={onSheetSuccessfullyCreatedInStep3}
            refetchStatusAfterCreate={refetchSheetIntegrationStatus}
          />
        )
      case 4:
        return (
          <Step4Complete
            {...displayProps}
            currentSheetDetails={
              currentSheetIntegrationStatus?.sheetConfiguration
            } // Corrected access
            onCreateAnother={() => {
              setCurrentStep(1)
              setWizardState({})
              refetchSheetIntegrationStatus()
            }}
          />
        )
      default:
        return <div>Invalid Step</div>
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Google Sheets Integration</CardTitle>
        </CardHeader>

        <CardContent>
          <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep - 1} />
          <div className="mt-6">
            <React.Suspense
              fallback={<div className="text-center py-4">Loading step...</div>}
            >
              {renderStepContent()}
            </React.Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GoogleSheetIntegrationPage
