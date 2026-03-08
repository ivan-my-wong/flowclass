import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaUser } from 'react-icons/fa'
import { FiUser } from 'react-icons/fi'
import { IoRefresh } from 'react-icons/io5'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import useTemplateManagement from '@/hooks/useTemplateManagement'
import {
  BulkSendDocument,
  getDocumentColorByStatus,
  RecipientCampaignStatus,
} from '@/types/templateManagement'

import ViewDocument from './ViewDocument'

const RecipientsList = ({
  campaign,
}: {
  campaign: BulkSendDocument
}): JSX.Element => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const { useGetRecipientsListByCampaignd, useResendDocumentCampaign } =
    useTemplateManagement()
  const { data: recipients = [], refetch } = useGetRecipientsListByCampaignd(
    campaign.id
  )
  const { mutateAsync: handleResend, isLoading } = useResendDocumentCampaign()

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <Button
        size="sm"
        iconBefore={<FaUser className="text-white text-sm" />}
        onClick={() => setIsOpen(true)}
      >
        {t('templateManagement:recipientsList.viewRecipients')}
      </Button>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {t('templateManagement:recipientsList.campaignRecipients')}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription>
              {t('templateManagement:recipientsList.template')}{' '}
              {campaign.document?.name}
            </DialogDescription>
            <div className="space-y-4 my-4">
              {recipients.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {t('templateManagement:recipientsList.noRecipientsAvailable')}
                </p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {recipients.map((recipient, index) => (
                    <li
                      key={`recipient-${recipient.id}-${index}`}
                      className="border border-background-layer-3 p-2 rounded-md flex gap-3 items-center"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm bg-gray-200">
                        <FiUser />
                      </div>
                      <div className="flex justify-between w-full items-center">
                        <div>
                          <div className="flex items-center justify-between mb-1 gap-3">
                            <div className="font-medium text-sm">
                              {recipient?.student?.name}
                            </div>
                            <div
                              className={[
                                'text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 capitalize',
                                getDocumentColorByStatus(recipient.status),
                              ].join(' ')}
                            >
                              {recipient.status}
                            </div>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {recipient?.student?.phone}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {recipient?.student?.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            iconBefore={<IoRefresh />}
                            onClick={() =>
                              handleResend({ recipientId: recipient.id }).then(
                                res => {
                                  if (!res.error) refetch()
                                }
                              )
                            }
                            disabled={isLoading}
                          >
                            {isLoading
                              ? t('templateManagement:recipientsList.resending')
                              : t('templateManagement:recipientsList.resend')}
                          </Button>
                          {recipient.status !==
                            RecipientCampaignStatus.FAILED && (
                            <ViewDocument data={recipient} />
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RecipientsList
