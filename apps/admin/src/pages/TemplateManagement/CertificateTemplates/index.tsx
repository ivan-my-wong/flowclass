import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FiEdit, FiTrash } from 'react-icons/fi'
import { IoMdAdd } from 'react-icons/io'
import { LiaCertificateSolid } from 'react-icons/lia'
import { RiImportFill } from 'react-icons/ri'

import AlertBox from '@/components/Boxes/AlertBox'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import useConfirm from '@/hooks/useGlobalConfirm'
import useTemplateManagement from '@/hooks/useTemplateManagement'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { DocumentTemplate } from '@/types/templateManagement'

import BulkActionComponent from './BulkActionComponent'
import CampaignsList from './CampaignList'

const DocumentTemplates = () => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const { useGetDocumentTemplates, useDeleteDocumentTemplate } =
    useTemplateManagement()

  const { data } = useGetDocumentTemplates()

  const { mutateAsync: handleDelete, isLoading } = useDeleteDocumentTemplate()
  const { setConfirm, closeConfirm } = useConfirm(isLoading)

  const [selected, setSelected] = useState<DocumentTemplate[]>([])

  const hasNoData = !data || data.length === 0

  return (
    <ContentLayout
      leftHeader={
        <div>
          <h1 className="text-xl font-bold">
            {t('component:menubar.certificateTemplates')}
          </h1>
        </div>
      }
      rightHeader={
        <div className="flex gap-2 mt-2">
          {/* <Button iconBefore={<RiImportFill />} variant="primary-outline">
            {t('templateManagement:buttons.import')}
          </Button> */}
          <Button
            iconBefore={<IoMdAdd />}
            onClick={() => navigate('/certificate-templates/editor')}
          >
            {t('templateManagement:buttons.newDocument')}
          </Button>
        </div>
      }
    >
      <div className="w-full px-4">
        {!hasNoData && (
          <BulkActionComponent
            selectedRows={selected}
            selectedCount={selected.length}
            countText={t('templateManagement:dialog.selectedRecords')}
            onClearSelection={() => setSelected([])}
          />
        )}
      </div>

      {hasNoData ? (
        <div className="w-full p-4">
          <AlertBox
            content={t('templateManagement:empty.noTemplatesFound')}
            actionText={t('templateManagement:buttons.createNew')}
            actionLink="/certificate-templates/editor"
            status="info"
            icon={<LiaCertificateSolid />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-4">
          {data?.map(item => {
            return (
              <div
                key={`template-${item.id}`}
                className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden"
              >
                <div className="bg-blue-100 py-8 px-6 flex justify-center relative">
                  <LiaCertificateSolid className="text-primary text-4xl" />
                  <button
                    type="button"
                    className="absolute top-3 right-3"
                    onClick={() => {
                      setSelected(prev =>
                        prev.includes(item)
                          ? prev.filter(i => i.id !== item.id)
                          : [...prev, item]
                      )
                    }}
                  >
                    <Checkbox
                      className="bg-white"
                      checked={selected.some(o => o.id === item.id)}
                    />
                  </button>
                </div>
                <div className="p-6">
                  <div className="">
                    <span className="inline-block text-xs font-medium bg-green-100 text-green-600 rounded-full px-2 py-0.5 mb-2 capitalize">
                      {item.status}
                    </span>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      {item.name}
                    </h2>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <Button
                        iconBefore={<FiEdit />}
                        onClick={() => {
                          navigate(`/certificate-templates/editor/${item.id}`)
                        }}
                      >
                        {t('templateManagement:buttons.edit')}
                      </Button>
                      <Button
                        iconBefore={<FiTrash />}
                        variant="destructive-outline"
                        onClick={() => {
                          setConfirm({
                            title: t(
                              'templateManagement:dialog.titleDeleteDialog'
                            ).toString(),
                            description: t(
                              'templateManagement:dialog:descriptionDeleteTemplate'
                            ).toString(),
                            alertType: AlertTypes.WARN,
                            cancelText: t('common:action.cancel').toString(),
                            confirmText: t('common:action.confirm').toString(),
                            onConfirm: () => {
                              handleDelete(item.id)
                              closeConfirm()
                            },
                          }).open()
                        }}
                      >
                        {t('templateManagement:buttons.delete')}
                      </Button>
                    </div>
                    <CampaignsList campaigns={item?.campaigns} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ContentLayout>
  )
}

export default DocumentTemplates
