import { useEffect, useState } from 'react'

import { useDebounce } from '@uidotdev/usehooks'
import { useTranslation } from 'react-i18next'

import AlertBox from '@/components/Boxes/AlertBox'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import PaginatedItems from '@/components/Pagination/Pagination'
import useConfirm from '@/hooks/useGlobalConfirm'
import useWhatsappTemplateData from '@/hooks/useWhatsappTemplateData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { PaginateOptionParams } from '@/types/pagination'
import { WhatsappTemplate } from '@/types/whatsappTemplate'

import EmptyData from './EmptyData'
import FilterWhatsappTemplate from './FilterWhatsappTemplate'
import WhatsappTemplateItem from './WhatsappTemplateItem'

const ListWhatsappTemplate = (): JSX.Element => {
  const { t } = useTranslation()
  const [params, setParams] = useState<
    Record<string, any> & PaginateOptionParams
  >({
    name: '',
    status: 'ALL',
    assignedTo: 'ALL',
    num: 10,
    page: 1,
    order: 'ASC',
    orderBy: 'id',
  })
  const { useFetchListWhatsappTemplate, useDeleteWhatsappTemplate } =
    useWhatsappTemplateData()
  const {
    data: whatsappTemplates,
    isLoading: isWhatsAppTemplateLoading,
    refetch,
  } = useFetchListWhatsappTemplate(params)

  const { mutateAsync: submitDelete, isLoading: isDeleting } =
    useDeleteWhatsappTemplate()
  const { setConfirm, closeConfirm } = useConfirm(isDeleting)

  const onDelete = (item: WhatsappTemplate) => {
    setConfirm({
      title: t('whatsappTemplate:delete.title').toString(),
      description: t('whatsappTemplate:delete.description').toString(),
      cancelText: t('common:action.cancel').toString(),
      confirmText: t('common:action.confirm').toString(),
      alertType: AlertTypes.WARN,
      onConfirm: () => {
        submitDelete(item.id as number).then(() => {
          closeConfirm()
        })
      },
    }).open()
  }

  const searchDebounce = useDebounce(params.name, 500)
  useEffect(() => {
    const searchByName = async () => {
      if (searchDebounce) {
        refetch()
      }
    }

    searchByName()
  }, [searchDebounce, refetch])

  useEffect(() => {
    if (params.status || params.assignedTo || params.page) {
      refetch()
    }
  }, [params.status, params.assignedTo, refetch, params.page])

  const renderNoData = () => {
    if (isWhatsAppTemplateLoading) {
      return <SkeletonLoader height="20rem" />
    }
    if (((whatsappTemplates?.content || [])?.length || 0) <= 0) {
      return <EmptyData />
    }
    return <></>
  }

  return (
    <div className="box-col p-4">
      <AlertBox
        content={t('setting:whatsappSetting.reminder')}
        actionText={t('setting:whatsappSetting.whatsAppApiSettings') as string}
        actionLink="/integrations/twilio"
      />
      <FilterWhatsappTemplate params={params} setParams={setParams} />
      <div className="flex flex-col gap-4 justify-start items-start w-full">
        {renderNoData()}
        {whatsappTemplates?.content && (
          <PaginatedItems
            meta={whatsappTemplates?.meta}
            className="w-full flex"
            itemWrapperClassName="space-y-4 mb-4"
            isBottomPagination
            pageButtonProps={{
              onChangePage: page => setParams({ ...params, page }),
              onClickBack: () => {
                setParams({ ...params, page: (params.page as number) - 1 })
              },
              onClickNext: () => {
                setParams({ ...params, page: (params.page as number) + 1 })
              },
              next: 'Next',
              back: 'Back',
            }}
          >
            {whatsappTemplates?.content &&
              whatsappTemplates?.content.map(item => (
                <WhatsappTemplateItem
                  item={item}
                  key={`whatsapp-template-${item.id}`}
                  onDelete={() => onDelete(item)}
                />
              ))}
          </PaginatedItems>
        )}
      </div>
    </div>
  )
}

export default ListWhatsappTemplate
