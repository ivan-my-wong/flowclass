import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LuTrash2, LuX } from 'react-icons/lu'
import { toast } from 'sonner'

import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import Text from '@/components/ui/Text'
import useGlobalConfirm from '@/hooks/useGlobalConfirm'
import useTemplateManagement from '@/hooks/useTemplateManagement'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { DocumentTemplate } from '@/types/templateManagement'

type BulkActionComponentProps = {
  countText: string
  selectedCount: number
  selectedRows: DocumentTemplate[]
  onClearSelection: () => void
}
const BulkActionComponent = ({
  selectedCount,
  selectedRows,
  countText,
  onClearSelection,
}: BulkActionComponentProps) => {
  const { t } = useTranslation()
  const { useDeleteDocumentTemplate } = useTemplateManagement()
  const { isLoading, mutateAsync: handleDelete } = useDeleteDocumentTemplate(
    false,
    false
  )

  const { setConfirm, closeConfirm } = useGlobalConfirm(isLoading)

  const onClickDelete = () => {
    setConfirm({
      title: t('templateManagement:dialog.titleDeleteDialog').toString(),
      description: t(
        'templateManagement:dialog:descriptionDeleteTemplate'
      ).toString(),
      alertType: AlertTypes.WARN,
      confirmText: t('common:action.confirm').toString(),
      cancelText: t('common:action.cancel').toString(),
      onConfirm: async () => {
        try {
          // for (const row of selectedRows) {
          //   await handleDelete(row.id)
          // }
          toast.success(t('templateManagement:success.deleteTemplate'))
        } catch (error: any) {
          console.error(error)
          toast.error(t('templateManagement:errors.deleteTemplate'))
        } finally {
          closeConfirm()
        }
      },
    }).open()
  }

  return (
    <>
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
          >
            <Box
              className="bg-background-layer-2 shadow-sm px-2 py-2 rounded-md mt-2"
              justify="between"
            >
              <Box>
                <Button
                  onClick={onClearSelection}
                  variant="ghost"
                  className="rounded-full h-8 w-8 hover:bg-background-disabled hover:text-text-sub justify-center text-center p-0"
                >
                  <span className="text-primary">
                    <LuX fill="currentColor" />
                  </span>
                </Button>

                <Text className="text-sm mr-auto text-text-subtle">
                  {selectedCount} {countText}
                </Text>
              </Box>
              <Box className="gap-x-2" justify="end">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                  loading={isLoading}
                  title={t('common:action.delete').toString()}
                  onClick={onClickDelete}
                >
                  <LuTrash2 />
                </Button>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
export default BulkActionComponent
