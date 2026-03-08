import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'

import { createAdditionalFee } from '../../../api/additionalFee'
import ApiError, { handleApiError } from '../../../api/errors/apiError'
import LoadingButton from '../../../components/Buttons/LoadingButton'
import Box from '../../../components/Containers/Box'
import Drawer from '../../../components/Drawer/Drawer'
import TextInput from '../../../components/Inputs/TextInput'
import Text from '../../../components/Texts/Text'
import { QUERY_KEY } from '../../../constants/queryKey'
import useSchoolData from '../../../hooks/useSchoolData'
// import useSchoolData from '../../../hooks/useSchoolData'
import ContentLayout from '../../../layouts/ContentLayout'

// import { validateInputLength } from '../../../utils/validate'

interface Props {
  open: boolean
  handleClose: () => void
}

const CreateFee = ({ open, handleClose }: Props) => {
  const { t } = useTranslation()

  const { currentSchool } = useSchoolData()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (data: {
      siteId: number
      institutionId: number
      name: string
      amount: number
    }) => createAdditionalFee(data),
    onSuccess: () => {
      toast.success(t('setting:additionalFee.createSuccess'))
      queryClient.invalidateQueries(QUERY_KEY.promotion.getAllAdditionalFeeKey)
      handleClose()
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  // const mutateUpdateFee = useMutation({
  //   mutationFn: ({
  //     id,
  //     updateData,
  //   }: {
  //     id: number
  //     updateData: Partial<AdditionalFee>
  //   }) => updateAdditionalFee(id, updateData),
  //   onSuccess: () => {
  //     toast.success(t('teachingService:additionalFee.deleteSuccess'))
  //     queryClient.invalidateQueries(QUERY_KEY.promotion.getAllAdditionalFeeKey)
  //   },
  //   onError: (error: ApiError) => {
  //     handleApiError({ error, t })
  //   },
  // })

  const handleCreate = (field: FieldValues) => {
    mutateAsync({
      siteId: currentSchool?.siteId ?? 0, // replace with actual siteId
      institutionId: currentSchool?.id ?? 0, // replace with actual institutionId
      name: field.name,
      amount: Number(field.fee),
    })
  }

  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'cross',
    action: () => {
      handleClose()
    },
  }

  const leftHeaderContent = (
    <Box css={{ fontSize: '$6' }}>{t('setting:additionalFee.createFee')}</Box>
  )

  const rightHeaderContent = (
    <LoadingButton isLoading={isLoading} onClick={handleSubmit(handleCreate)}>
      {t('setting:applicationForm.save')}
    </LoadingButton>
  )
  return (
    <Drawer open={open}>
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={leftHeaderContent}
        rightHeader={rightHeaderContent}
      >
        <Box direction="column" css={{ padding: '$4 $2' }} gap="large">
          <Box direction="column" align="flex-start">
            <Text size="mediumLarge" bold>
              {t('setting:additionalFee.name')}
            </Text>
            <Text>{t('setting:additionalFee.additionalFeeDisplay')}</Text>
            <TextInput
              placeholder={`${t('setting:additionalFee.namePlaceholder')}`}
              isError={!!errors.name}
              helperText={errors.name?.message as string}
              {...register('name', {
                required: t('common:errors.required') as string,
              })}
            />
          </Box>
          <Box direction="column" align="flex-start">
            <Text size="mediumLarge" bold>
              {t('setting:additionalFee.fee')}
            </Text>
            <TextInput
              placeholder={`${t('setting:additionalFee.feePlaceholder')}`}
              isError={!!errors.fee}
              helperText={errors.fee?.message as string}
              {...register('fee', {
                required: t('common:errors.required') as string,
              })}
            />
          </Box>
          <Box direction="column" align="flex-start">
            <Text size="mediumLarge" bold>
              {t('setting:additionalFee.condition')}
            </Text>
            <Box
              css={{ backgroundColor: '$backgroundLayer3', borderRadius: '$1' }}
              padding="medium"
            >
              <Text> {t('setting:additionalFee.compulsory')}</Text>
            </Box>
          </Box>
        </Box>
      </ContentLayout>
    </Drawer>
  )
}

export default CreateFee
