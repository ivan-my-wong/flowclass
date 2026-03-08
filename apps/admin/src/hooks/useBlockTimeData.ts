import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import {
  createBlockTime,
  deleteBlockTime,
  getAllExistBlockTimes,
  getCurrentBlockTime,
  updateBlockTime,
} from '../api/blockTime'
import { ApiError, handleApiError } from '../api/errors/apiError'
import { QUERY_KEY } from '../constants/queryKey'
import { blockTimeState } from '../stores/blockTime'
import { BlockTime, CreateBlockTimeProps } from '../types/settingBlockTime'

import useSchoolData from './useSchoolData'
import useSiteData from './useSiteData'

const useBlockTimeData = () => {
  const [blockTimeData, setBlockTimeData] = useRecoilState(blockTimeState)

  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()
  const currentInstitutionId = schoolData.currentSchool?.id.toString() || ''
  const currentSiteId = siteData.currentSite?.id.toString() || ''
  const { t } = useTranslation()
  const currentBlockTimeId = blockTimeData.currentBlockTime?.id || 0

  const useFetchCurrentBlockTime = (
    successfulCallback?: (data: BlockTime) => void
  ): UseQueryResult<BlockTime, unknown> => {
    const result = useQuery(
      [QUERY_KEY.blockTime.currentBlockTimeKey, currentBlockTimeId],
      () =>
        getCurrentBlockTime(
          currentBlockTimeId,
          currentInstitutionId,
          currentSiteId
        ),
      {
        onSuccess: data => {
          setBlockTimeData(prev => ({ ...prev, currentBLockTime: data }))
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!currentBlockTimeId,
      }
    )
    return result
  }
  const useFetchAllblockTimeData = (): UseQueryResult<BlockTime[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.blockTime.blockTimeListKey, currentInstitutionId],
      () => getAllExistBlockTimes(currentInstitutionId, currentSiteId),
      {
        onSuccess: data => {
          const currentBlockTime =
            data.find(
              (blockTime: BlockTime) =>
                blockTime.id === blockTimeData.currentBlockTime?.id
            ) || (data.length > 0 ? data[0] : null)

          setBlockTimeData({
            currentBlockTime,
            blockTimes: data,
            initFetch: true,
          })
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!currentInstitutionId,
      }
    )
    return result
  }

  const setCurrentBlockTime = (id: number | string) => {
    const currentBlockTime = blockTimeData.blockTimes.find(
      // eslint-disable-next-line eqeqeq
      (blockTime: BlockTime) => blockTime.id === id
    )
    if (currentBlockTime) {
      setBlockTimeData(prev => ({
        ...prev,
        currentBlockTime,
      }))
    }
  }

  const useCreateBlockTime = (
    successfulCallback?: (data: CreateBlockTimeProps) => void
  ): UseMutationResult<BlockTime, ApiError, Partial<BlockTime>, unknown> => {
    const mutation = useMutation({
      mutationFn: (classData: Partial<BlockTime>) => {
        return createBlockTime(
          {
            ...classData,
            institutionId: +currentInstitutionId,
          },
          currentInstitutionId,
          currentSiteId
        )
      },
      onSuccess: data => {
        toast.success(t('setting:systemSettings.createBlockTimeSuccess'))
        if (data.isHaveClassLessonRepeat) {
          toast.warning(t('setting:systemSettings.warningBlockTime'))
        }
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }
  const useUpdateBlockTime = (
    id: number, // Add id parameter here
    successfulCallback?: (data: CreateBlockTimeProps) => void
  ): UseMutationResult<BlockTime, ApiError, Partial<BlockTime>, unknown> => {
    const mutation = useMutation({
      mutationFn: (classData: Partial<BlockTime>) => {
        return updateBlockTime(
          classData,
          id, // Pass id to the updateBlockTime function
          currentInstitutionId,
          currentSiteId
        )
      },
      onSuccess: data => {
        toast.success(t('setting:systemSettings.updateBlockTimeSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }
  const useDeleteBlockTime = (
    successfulCallback?: (data: BlockTime) => void
  ): UseMutationResult<BlockTime, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (blockTimeId: number) =>
        deleteBlockTime(blockTimeId, currentInstitutionId, currentSiteId),
      onSuccess: data => {
        setBlockTimeData(prev => ({
          ...prev,
          blockTimes: prev.blockTimes.filter(blockTime => {
            return blockTime.id !== data.id
          }),
        }))
        toast.success(t('setting:systemSettings.deleteBlockTimeSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  return {
    blockTimeData,
    useUpdateBlockTime,
    useFetchAllblockTimeData,
    useFetchCurrentBlockTime,
    setCurrentBlockTime,
    useCreateBlockTime,
    useDeleteBlockTime,
  }
}

export default useBlockTimeData
