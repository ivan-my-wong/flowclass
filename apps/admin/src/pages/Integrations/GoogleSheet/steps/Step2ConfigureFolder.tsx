import * as React from 'react'

import { LuFolder, LuSearch } from 'react-icons/lu'
import { UseQueryResult } from 'react-query'

import AlertBox from '@/components/Boxes/AlertBox'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Inputs/Input'
import { Label } from '@/components/ui/Label'
import { ScrollArea } from '@/components/ui/ScrollArea'
import Text from '@/components/ui/Text'
import { GoogleDriveFolder } from '@/types/external/googleIntegration.type'

import { GoogleSheetWizardState } from '../index'

interface Step2ConfigureFolderProps {
  wizardState: GoogleSheetWizardState
  onNavigateBack: () => void
  driveFoldersQuery: UseQueryResult<GoogleDriveFolder[], Error>
  fetchDriveFolders: (enabled?: boolean) => void
  onConfigurationComplete: (
    folder: GoogleDriveFolder | null,
    name: string
  ) => void
}

const Step2ConfigureFolder: React.FC<Step2ConfigureFolderProps> = ({
  wizardState,
  onNavigateBack,
  driveFoldersQuery,
  fetchDriveFolders,
  onConfigurationComplete,
}) => {
  const [selectedFolder, setSelectedFolder] =
    React.useState<GoogleDriveFolder | null>(wizardState.selectedFolder || null)
  const [spreadsheetName, setSpreadsheetName] = React.useState<string>(
    wizardState.spreadsheetName || ''
  )
  const [searchTerm, setSearchTerm] = React.useState('')

  React.useEffect(() => {
    fetchDriveFolders(true)
  }, [fetchDriveFolders])

  React.useEffect(() => {
    if (!spreadsheetName) {
      const month = new Date().toLocaleString('default', { month: 'long' })
      const year = new Date().getFullYear()
      setSpreadsheetName(`Flowclass Data - ${month} ${year}`)
    }
  }, [spreadsheetName])

  const handleFolderSelect = (folder: GoogleDriveFolder) => {
    setSelectedFolder(folder)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpreadsheetName(e.target.value)
  }

  const handleNext = () => {
    if (selectedFolder && spreadsheetName.trim()) {
      onConfigurationComplete(selectedFolder, spreadsheetName.trim())
    }
  }

  const filteredFolders = React.useMemo(() => {
    if (!driveFoldersQuery.data) return []
    return driveFoldersQuery.data.filter(folder =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [driveFoldersQuery.data, searchTerm])

  const isNextDisabled = !selectedFolder || !spreadsheetName?.trim()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configure Destination</CardTitle>
        <Text className="text-sm text-muted-foreground">
          Select where you want to create your new Google Sheet and give it a
          name.
        </Text>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="font-semibold mb-2">Google Drive Destination</h3>
          <div className="space-y-2">
            <Label>Choose Google Drive Folder</Label>
            {selectedFolder && (
              <div className="text-sm p-2 bg-muted rounded-md flex items-center space-x-2">
                <LuFolder className="text-blue-500" />
                <span>{selectedFolder.name}</span>
              </div>
            )}
            <div className="relative">
              <LuSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search folders..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
                disabled={driveFoldersQuery.isLoading}
              />
            </div>
            <ScrollArea className="h-60 w-full rounded-md border">
              <div className="p-2">
                {driveFoldersQuery.isLoading && (
                  <div className="space-y-2 p-2">
                    {[...Array(5)].map((_, i) => (
                      <SkeletonLoader key={i} className="h-8 w-full" />
                    ))}
                  </div>
                )}
                {driveFoldersQuery.isError && (
                  <AlertBox
                    type="error"
                    content={`Error fetching folders: ${driveFoldersQuery.error.message}`}
                  />
                )}
                {driveFoldersQuery.isSuccess &&
                  filteredFolders.length === 0 && (
                    <Text className="text-sm text-center text-muted-foreground py-4">
                      {searchTerm
                        ? 'No matching folders found.'
                        : 'No folders found.'}
                    </Text>
                  )}
                {driveFoldersQuery.isSuccess &&
                  filteredFolders.map(folder => (
                    <button
                      type="button"
                      key={folder.id}
                      onClick={() => handleFolderSelect(folder)}
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-accent ${
                        selectedFolder?.id === folder.id
                          ? 'bg-accent ring-2 ring-blue-500'
                          : ''
                      }`}
                    >
                      <LuFolder className="text-gray-500" />
                      <span className="text-sm">{folder.name}</span>
                    </button>
                  ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2 pt-4">
            <Label htmlFor="spreadsheet-name">Spreadsheet Name</Label>
            <Input
              id="spreadsheet-name"
              placeholder="e.g., Flowclass Data - May 2025"
              value={spreadsheetName}
              onChange={handleNameChange}
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onNavigateBack}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={isNextDisabled}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Step2ConfigureFolder
