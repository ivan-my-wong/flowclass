import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { IoMdInformationCircle } from 'react-icons/io'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import { deleteAdditionalFee, getAllAdditionalFee } from '@/api/additionalFee'
import ApiError, { handleApiError } from '@/api/errors/apiError'
import DeleteIcon from '@/assets/svgs/DeleteIcon'
import AlertBox from '@/components/Boxes/AlertBox'
import SvgIcon from '@/components/Images/SvgIcon'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import { useResponsive } from '@/hooks/useResponsive'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { getCurrencySymbol } from '@/utils/currency'

import CreateFee from './AdditionalFee/CreateFee'
import EditFee from './AdditionalFee/EditFee'

const AdditionalFee = () => {
  const { t } = useTranslation()
  const { isMobile } = useResponsive()
  const [isOpenAdd, setIsOpenAdd] = useState(false)
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false)
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false)
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const { currentSchool } = useSchoolData()
  const { currentSite } = useSiteData()

  const createNewFee = searchParams.get('createNewFee')
  const headerBackButton: HeaderBackButtonStatus = {
    title: t('component:menubar.promotion'),
    mode: 'add',
  }
  useEffect(() => {
    if (createNewFee) {
      setIsOpenAdd(true)
    }
  }, [createNewFee])

  // WIP: Hardcode data for the demo now, waiting for the API to be completed

  const { data } = useQuery(
    [QUERY_KEY.promotion.getAllAdditionalFeeKey],
    () => {
      return getAllAdditionalFee(
        currentSchool?.siteId ?? 0,
        currentSchool?.id ?? 0
      )
    }
  )

  const mutateDeleteFee = useMutation({
    mutationFn: (id: number) => deleteAdditionalFee(id),
    onSuccess: () => {
      toast.success(t('setting:additionalFee.deleteSuccess'))
      queryClient.invalidateQueries(QUERY_KEY.promotion.getAllAdditionalFeeKey)
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const rightHeaderContent = (
    <Button onClick={() => setIsOpenAdd(true)}>
      {isMobile
        ? t(`common:action:create`)
        : t(`setting:additionalFee.createFee`)}
    </Button>
  )

  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      rightHeader={rightHeaderContent}
    >
      <CreateFee open={isOpenAdd} handleClose={() => setIsOpenAdd(false)} />
      <div className="box-col-full p-4">
        <Heading>{t(`setting:menu.additionalFee`)}</Heading>
        {data?.length === 0 && (
          <>
            <AlertBox
              icon={<IoMdInformationCircle size="24px" />}
              content={t('teachingService:additionalFee.noFee')}
              css={{ fontWeight: 500 }}
            />
          </>
        )}
        {data?.map(data => (
          <Box
            key={data.id}
            justify="between"
            className="bg-backgroundLayer2 rounded-1"
          >
            <Box className="w-[80%]" align="start" direction="col">
              <Text className="overflow-hidden text-ellipsis">{data.name}</Text>

              <Text
                css={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                }}
              >
                {`${getCurrencySymbol(currentSite?.currency ?? '')}${
                  data.amount
                }`}
              </Text>
            </Box>

            <Box className="w-[20%] justify-end">
              {/* <SvgIcon onClick={() => handleEdit()} css={{ cursor: 'pointer' }}>
                <EditIcon />
              </SvgIcon> */}
              <SvgIcon
                css={{ marginLeft: '$3', cursor: 'pointer' }}
                onClick={() => setShowConfirmPopup(true)}
              >
                <DeleteIcon fill="#F87575" />
              </SvgIcon>
            </Box>

            <CustomedAlertDialog
              open={showConfirmPopup}
              setOpen={setShowConfirmPopup}
              description={t('setting:additionalFee.descriptionDelete')}
              title={`${t('setting:additionalFee.titleDeleteDialog')} ${
                data.name
              }`}
              alertType={AlertTypes.WARN}
              cancelText={t('common:action.cancel') as string}
              actionText={t('common:action.confirm') as string}
              onActionClick={() => {
                mutateDeleteFee.mutateAsync(data.id)
              }}
            />
            <EditFee
              open={isOpenEdit}
              handleClose={() => setIsOpenEdit(false)}
            />
          </Box>
        ))}
      </div>
    </ContentLayout>
  )
}

export default AdditionalFee
