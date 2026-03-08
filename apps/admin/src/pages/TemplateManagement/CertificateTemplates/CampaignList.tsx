import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FaList, FaUser } from 'react-icons/fa'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import useTemplateManagement from '@/hooks/useTemplateManagement'
import {
  BulkSendDocument,
  BulkSendDocumentStatus,
} from '@/types/templateManagement'

const CampaignsList = ({ campaigns }: { campaigns?: BulkSendDocument[] }) => {
  const [open, setOpen] = useState(false)

  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Button
        iconBefore={<FaList />}
        onClick={() => setOpen(true)}
        disabled={!campaigns?.length}
      >
        {t('templateManagement:buttons.campaignsList')}
      </Button>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              Campaigns List
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 space-y-4 mb-4">
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {campaigns?.map((campaign, index) => (
                <li
                  key={index}
                  className="border border-background-layer-3 p-2 rounded-md cursor-pointer hover:bg-blue-200"
                  onClick={() =>
                    navigate(`/bulk-send-documents/select/${campaign.id}`)
                  }
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{campaign?.title}</div>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {dayjs(campaign?.createdAt).format('YYYY/MM/DD')}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CampaignsList
