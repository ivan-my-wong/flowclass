import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { MdOutlineFileDownload, MdOutlineRemoveRedEye } from 'react-icons/md'

import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import { RecipientCampaign } from '@/types/templateManagement'

type ViewDocumentProps = {
  data: RecipientCampaign
}

const ViewDocument = (props: ViewDocumentProps) => {
  const { data } = props
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        iconBefore={<MdOutlineRemoveRedEye />}
        variant="primary-outline"
        onClick={() => setIsOpen(true)}
      >
        View Document
      </Button>
      <ModalDialog
        open={isOpen}
        title="View Document"
        onOpenChange={() => setIsOpen(false)}
      >
        <div className="flex flex-col items-center min-h-[300px]">
          <div className="flex justify-center items-center w-full flex-1 relative">
            <img
              src={data.documentUrl}
              alt={data.student?.name}
              className="max-w-full object-contain"
              style={{ width: '100%', height: 'auto', display: 'none' }}
              onLoad={e => {
                ;(e.target as HTMLImageElement).style.display = 'block'
                const loader = document.getElementById('img-loader')
                if (loader) loader.style.display = 'none'
              }}
              onError={e => {
                ;(e.target as HTMLImageElement).style.display = 'none'
                const loader = document.getElementById('img-loader')
                if (loader) loader.innerText = 'Failed to load image'
              }}
            />
            <span id="img-loader" className="text-gray-500 absolute">
              Loading...
            </span>
          </div>
          <div className="mt-6 flex gap-4 w-full">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
            <Button
              className="w-full"
              iconBefore={<MdOutlineFileDownload />}
              onClick={() => {
                const link = document.createElement('a')
                link.href = data.documentUrl
                link.target = '_blank'
                link.rel = 'noopener noreferrer'
                link.download = `${data.student?.name}-document.pdf`
                link.click()
              }}
            >
              Download
            </Button>
          </div>
        </div>
      </ModalDialog>
    </>
  )
}

export default ViewDocument
