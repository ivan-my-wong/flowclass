import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import { STALE_TIME } from '@/constants/common'

import { ApiError, handleApiError } from '../api/errors/apiError'
import {
  createInformationField,
  deleteInformationField,
  getCurrentInformationField,
  getInformationFields,
  reOrderFields,
  updateInformationField,
} from '../api/informationField'
import { QUERY_KEY } from '../constants/queryKey'
import { informationFieldState } from '../stores/informationFieldData'
import {
  CreateInformationFieldTypes,
  InformationFieldTypes,
} from '../types/applicationForm'

import useSchoolData from './useSchoolData'
import useSiteData from './useSiteData'

const useInformationFieldData = () => {
  const [informationFieldData, setInformationFieldData] = useRecoilState(
    informationFieldState
  )

  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()
  const currentInstitutionId = schoolData.currentSchool?.id.toString() || ''
  const currentSiteId = siteData.currentSite?.id.toString() || ''

  const { t } = useTranslation()
  const currentApplicationFormId =
    informationFieldData.currentInformationField?.id || 0

  const useFetchCurrentInformationField = (
    successfulCallback?: (data: InformationFieldTypes) => void
  ): UseQueryResult<InformationFieldTypes, unknown> => {
    const result = useQuery(
      [
        QUERY_KEY.informationField.getCurrentInformationFieldKey,
        currentApplicationFormId,
      ],
      () =>
        getCurrentInformationField(
          currentApplicationFormId,
          +currentInstitutionId,
          +currentSiteId
        ),
      {
        onSuccess: data => {
          setInformationFieldData(prev => ({
            ...prev,
            currentInformationField: data,
          }))
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!currentApplicationFormId,
      }
    )
    return result
  }
  const useFetchAllInformationFieldData = (): UseQueryResult<
    InformationFieldTypes[],
    unknown
  > => {
    const result = useQuery(
      [
        QUERY_KEY.informationField.informationFieldListKey,
        currentInstitutionId,
      ],
      () => getInformationFields(+currentInstitutionId, +currentSiteId),
      {
        onSuccess: data => {
          const currentInformationField =
            data.find(
              (informationField: InformationFieldTypes) =>
                informationField.id ===
                informationFieldData.currentInformationField?.id
            ) || (data.length > 0 ? data[0] : null)
          setInformationFieldData({
            currentInformationField,
            informationFields: data,
            initFetch: true,
          })
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        staleTime: STALE_TIME,
      }
    )
    return result
  }

  const setCurrentInformationField = (id: number | string) => {
    const currentInformationField = informationFieldData.informationFields.find(
      // eslint-disable-next-line eqeqeq
      (informationField: InformationFieldTypes) => informationField.id === id
    )
    if (currentInformationField) {
      setInformationFieldData(prev => ({
        ...prev,
        currentInformationField,
      }))
    }
  }
  const useUpdateInformationField = (
    successfulCallback?: (data: InformationFieldTypes) => void
  ): UseMutationResult<
    InformationFieldTypes,
    ApiError,
    Partial<InformationFieldTypes>,
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (updatedFields: Partial<InformationFieldTypes>) =>
        updateInformationField(
          updatedFields,
          +currentInstitutionId,
          +currentSiteId
        ),
      onSuccess: (data: InformationFieldTypes) => {
        const tempCurrentInformationField: InformationFieldTypes = {
          ...data,
        }

        setInformationFieldData(prev => ({
          ...prev,
          informationFields: prev.informationFields.map(field =>
            field.id === data.id ? tempCurrentInformationField : field
          ),
          currentInformationField: tempCurrentInformationField,
        }))
        successfulCallback?.(tempCurrentInformationField)
        toast.success(t('setting:studentInformation.updateInformationField'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }
  const useCreateInformationForm = (
    successfulCallback?: (data: CreateInformationFieldTypes) => void
  ): UseMutationResult<
    InformationFieldTypes,
    ApiError,
    Partial<InformationFieldTypes>,
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (classData: Partial<InformationFieldTypes>) => {
        return createInformationField(
          {
            ...classData,
          },
          +currentInstitutionId,
          +currentSiteId
        )
      },
      onSuccess: data => {
        toast.success(t('setting:studentInformation.createInformationField'))

        if (data && !!data.institutionId) {
          successfulCallback?.(data as CreateInformationFieldTypes)
        }
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useDeleteInformationField = (
    successfulCallback?: (data: InformationFieldTypes) => void
  ): UseMutationResult<InformationFieldTypes, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (informationFieldId: number) =>
        deleteInformationField(
          informationFieldId,
          +currentInstitutionId,
          +currentSiteId
        ),
      onSuccess: data => {
        setInformationFieldData(prev => ({
          ...prev,
          informationFields: prev.informationFields.filter(informationField => {
            return informationField.id !== data.id
          }),
        }))
        toast.success(t('setting:studentInformation.deleteInformationField'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }
  const useReOrderInformationField = (): UseMutationResult<
    InformationFieldTypes,
    ApiError,
    number[],
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (ids: number[]) =>
        reOrderFields(+currentSiteId, +currentInstitutionId, ids),
      onSuccess: () => {
        toast.success(t('setting:studentInformation.reOrderInformationField'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  return {
    useUpdateInformationField,
    useFetchAllInformationFieldData,
    setCurrentInformationField,
    useCreateInformationForm,
    useDeleteInformationField,
    useReOrderInformationField,
    useFetchCurrentInformationField,
  }
}

export default useInformationFieldData
