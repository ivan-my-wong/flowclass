import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FaPlus } from 'react-icons/fa'
import { FiDollarSign } from 'react-icons/fi'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import {
  assignAdditionalFeeToCourse,
  getAllAdditionalFee,
  unassignAdditionalFeeToCourse,
} from '@/api/additionalFee'
import ApiError, { handleApiError } from '@/api/errors/apiError'
import AlertBox from '@/components/Boxes/AlertBox'
import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import Drawer from '@/components/Drawer/Drawer'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Text from '@/components/Texts/Text'
import { QUERY_KEY } from '@/constants/queryKey'
import useCourseData from '@/hooks/useCourseData'
import useSchoolData from '@/hooks/useSchoolData'
// import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
// import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
// import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'

interface Props {
  open: boolean
  handleClose: () => void
}

// WIP: Hardcode data for the demo now, waiting for the API to be completed

export const AssignFeeColumn = ({
  isOpenAssignFee,
}: {
  isOpenAssignFee?: boolean
}): React.ReactElement => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { currentSchool } = useSchoolData()
  const { currentCourse } = useCourseData()
  const queryClient = useQueryClient()

  const { data } = useQuery(
    [QUERY_KEY.promotion.getAllAdditionalFeeKey],
    () => {
      return getAllAdditionalFee(
        currentSchool?.siteId ?? 0,
        currentSchool?.id ?? 0
      )
    }
  )

  const mutateAssignCourse = useMutation({
    mutationFn: ({
      additionalFeeId,
      courseId,
    }: {
      additionalFeeId: number
      courseId: number
    }) => assignAdditionalFeeToCourse(additionalFeeId, courseId),
    onSuccess: () => {
      toast.success(t('setting:additionalFee.createSuccess'))
      queryClient.invalidateQueries(QUERY_KEY.promotion.getAllAdditionalFeeKey)
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const mutateUnassignCourse = useMutation({
    mutationFn: ({
      additionalFeeId,
      courseId,
    }: {
      additionalFeeId: number
      courseId: number
    }) => unassignAdditionalFeeToCourse(additionalFeeId, courseId),
    onSuccess: () => {
      toast.success(t('setting:additionalFee.unassignSuccess'))
      queryClient.invalidateQueries(QUERY_KEY.promotion.getAllAdditionalFeeKey)
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  return (
    <div className="box-col-full">
      {data?.length === 0 && (
        <>
          <AlertBox
            content={t('teachingService:additionalFee.noFee')}
            actionText={
              t('teachingService:additionalFee.createNewFee') as string
            }
            actionLink="/settings/additional-fee"
            css={{ fontWeight: 500 }}
          />
          {isOpenAssignFee && (
            <Button
              variants="outlined"
              iconBefore={<FaPlus />}
              onClick={() =>
                navigate('/settings/additional-fee?createNewFee=true')
              }
            >
              {t('teachingService:additionalFee.createNewFee')}
            </Button>
          )}
        </>
      )}

      {data?.map(data => {
        const exists = data.courseIds.includes(currentCourse?.id ?? 0)
        return (
          <Box
            key={data.id}
            justify="space-between"
            css={{
              background: '$backgroundLayer3',
              borderRadius: '$1',
            }}
            padding="medium"
          >
            <Box
              css={{ width: '65%' }}
              justify="flex-start"
              direction="row"
              wrap
            >
              <Text css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {data.name}
              </Text>

              <div className="flex items-center overflow-hidden overflow-ellipsis">
                <FiDollarSign />
                {data.amount}
              </div>
              <Text css={{ display: 'flex', flexBasis: '100%' }}>
                {data.condition}
              </Text>
            </Box>

            <Box
              css={{
                width: '35%',
                '@xs': {
                  flexDirection: 'column',
                },
              }}
              justify="flex-end"
            >
              {exists && (
                <Button
                  onClick={() =>
                    mutateUnassignCourse.mutateAsync({
                      additionalFeeId: data.id,
                      courseId: currentCourse?.id ?? 0,
                    })
                  }
                  css={{
                    width: '65%',
                    backgroundColor: '$textDisabled',
                    '@sm': { padding: '$min $small' },
                  }}
                >
                  {t('teachingService:additionalFee.remove')}
                </Button>
              )}
              {!exists && (
                <Button
                  variants="outlined"
                  onClick={() =>
                    mutateAssignCourse.mutateAsync({
                      additionalFeeId: data.id,
                      courseId: currentCourse?.id ?? 0,
                    })
                  }
                  css={{
                    width: '65%',

                    '@sm': { padding: '$min $large' },
                  }}
                >
                  {t('teachingService:additionalFee.add')}
                </Button>
              )}
            </Box>
          </Box>
        )
      })}
    </div>
  )
}
const AssignFee = ({ open, handleClose }: Props) => {
  const { t } = useTranslation()
  // const { schoolData } = useSchoolData()
  // const currentInstitutionId = schoolData.currentSchool?.id || 0

  const handleCloseAndRemoveData = () => {
    handleClose()
  }

  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'cross',
    action: () => {
      handleCloseAndRemoveData()
    },
  }

  const leftHeaderContent = (
    <Box css={{ fontSize: '$6' }}>
      {t('teachingService:additionalFee.addFee')}
    </Box>
  )

  return (
    <Drawer open={open}>
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={leftHeaderContent}
      >
        <AssignFeeColumn isOpenAssignFee={open} />
      </ContentLayout>
    </Drawer>
  )
}

export default AssignFee
