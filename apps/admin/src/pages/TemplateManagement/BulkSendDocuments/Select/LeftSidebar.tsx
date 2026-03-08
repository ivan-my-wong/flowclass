import { useTranslation } from 'react-i18next'
import { FaFileAlt, FaUser } from 'react-icons/fa'
import { RxCross2 } from 'react-icons/rx'

import { Input } from '@/components/ui/Inputs/Input'
import { StudentEnrolmentRecord } from '@/types/student'
import { DocumentTemplate } from '@/types/templateManagement'

import SelectDocuments from './SelectDocument'

type LeftSidebarProps = {
  campaignId?: string
  name: string
  setName: (name: string) => void
  selectedStudents: StudentEnrolmentRecord[]
  selectedDocument?: DocumentTemplate
  setSelectedDocument: (document?: DocumentTemplate) => void
}

const LeftSidebar = (props: LeftSidebarProps) => {
  const {
    campaignId,
    name,
    setName,
    setSelectedDocument,
    selectedDocument,
    selectedStudents,
  } = props

  const { t } = useTranslation()

  const isDisabled = !!campaignId

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-background-layer-3 rounded-lg p-4">
        <p className="text-sm font-semibold mb-2">Campaign Name</p>

        <Input
          type="text"
          placeholder="Enter campaign name"
          className="w-full"
          data-testid="campaign-name-input"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={isDisabled}
        />
      </div>

      <div className="border border-background-layer-3 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold mb-2">Document Template</p>
          {!isDisabled && (
            <SelectDocuments setSelectedDocument={setSelectedDocument} />
          )}
        </div>
        {selectedDocument ? (
          <div className="flex gap-2 items-start bg-white border rounded-xl p-4 border-background-layer-3">
            <div className="bg-gray-100 w-8 h-8 flex items-center justify-center rounded">
              <FaFileAlt className="text-gray-500 text-lg" />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">
                    {selectedDocument.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedDocument?.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDocument(undefined)}
                  className="text-gray-400 hover:text-gray-600"
                  hidden={isDisabled}
                >
                  <RxCross2 className="text-lg" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">
                  {selectedDocument.type}
                </span>
                <span className="text-gray-500">
                  {selectedDocument.fieldData?.length} fields
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10 border border-dashed border-background-layer-4 rounded-lg p-4">
            <FaFileAlt className="mx-auto text-3xl mb-3" />
            <p className="font-medium">No template selected</p>
            <p className="text-sm">Choose a document template to continue</p>
          </div>
        )}
      </div>

      <div className="border border-background-layer-3 rounded-lg p-4 bg-white">
        <p className="text-sm font-semibold mb-2">
          Selected Students ({selectedStudents.length})
        </p>
        {selectedStudents.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <FaUser className="mx-auto text-3xl mb-3" />
            <p className="font-medium">No students selected</p>
            <p className="text-sm">Select students from the list</p>
          </div>
        ) : (
          <ul className="text-sm space-y-2">
            {selectedStudents.map(student => (
              <li key={student.email}>{student.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default LeftSidebar
