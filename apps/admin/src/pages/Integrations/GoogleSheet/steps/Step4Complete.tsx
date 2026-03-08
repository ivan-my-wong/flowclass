import * as React from 'react'

import { useTranslation } from 'react-i18next'
import {
  LuCheckCircle,
  LuExternalLink,
  LuPlusCircle,
  LuSettings,
} from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { GoogleSheetConfiguration } from '@/types/external/googleIntegration.type'

interface Step4CompleteProps {
  currentSheetDetails?: GoogleSheetConfiguration | null
  onCreateAnother: () => void
}

const Step4Complete: React.FC<Step4CompleteProps> = ({
  currentSheetDetails,
  onCreateAnother,
}) => {
  const { t } = useTranslation('integration')

  const handleOpenSheet = () => {
    if (currentSheetDetails?.spreadsheetUrl) {
      try {
        window.open(
          currentSheetDetails.spreadsheetUrl,
          '_blank',
          'noopener,noreferrer'
        )
      } catch (error) {
        console.error('Error opening sheet:', error)
      }
    }
  }

  const handleManage = () => {
    console.log(
      'Manage action triggered for:',
      currentSheetDetails?.spreadsheetId
    )
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-4 md:p-6">
      <LuCheckCircle className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-semibold mb-2">
        {t('googleSheet.step4.title')}
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        {t('googleSheet.step4.description')}
      </p>

      {currentSheetDetails?.spreadsheetId ? (
        <Card className="w-full max-w-lg mb-8 text-left">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                    fill="#34A853"
                  />
                  <path d="M20 8H14V2L20 8Z" fill="#A9D9AD" />
                  <path d="M16 13H8V15H16V13Z" fill="white" />
                  <path d="M16 17H8V19H16V17Z" fill="white" />
                  <path d="M12 11H8V9H12V11Z" fill="white" />
                </svg>
              </div>
              <div>
                <p className="font-medium">
                  {currentSheetDetails.spreadsheetName ||
                    t('googleSheet.step4.untitled')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentSheetDetails.googleDriveFolderName
                    ? `${t('googleSheet.step4.myDrive')} > ${
                        currentSheetDetails.googleDriveFolderName
                      }`
                    : t('googleSheet.step4.myDrive')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleManage}>
                <LuSettings className="h-4 w-4 mr-1" />
                {t('googleSheet.step4.manage')}
              </Button>
              <Button
                size="sm"
                onClick={handleOpenSheet}
                disabled={!currentSheetDetails.spreadsheetUrl}
              >
                <LuExternalLink className="h-4 w-4 mr-1" />
                {t('googleSheet.step4.openSheet')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground mb-8">
          {t('googleSheet.step4.noDetails')}
        </p>
      )}

      <Button onClick={onCreateAnother} size="lg">
        <LuPlusCircle className="h-5 w-5 mr-2" />
        {t('googleSheet.step4.createAnother')}
      </Button>
    </div>
  )
}

export default Step4Complete
