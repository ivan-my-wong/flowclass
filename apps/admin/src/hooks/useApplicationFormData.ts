import { useMemo } from 'react'

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
  assignApplicationForm,
  createApplicationForm,
  deleteApplicationForm,
  getApplicationForms,
  getCurrentAppicationForm,
  updateApplicationForm,
} from '../api/applicationForm'
import { ApiError, handleApiError } from '../api/errors/apiError'
import { QUERY_KEY } from '../constants/queryKey'
import { applicationFormState } from '../stores/applicationFormData'
import {
  ApplicationFormTypes,
  CreateApplicationFormTypes,
} from '../types/applicationForm'

import useInformationFieldData from './useInformationFieldData'
import useSchoolData from './useSchoolData'
import useSiteData from './useSiteData'

const useApplicationFormData = () => {
  const [applicationFormData, setApplicationFormData] =
    useRecoilState(applicationFormState)

  const { useFetchAllInformationFieldData } = useInformationFieldData()
  const fetchInformationFieldaResult = useFetchAllInformationFieldData()
  const { data } = fetchInformationFieldaResult
  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()
  const currentInstitutionId = schoolData.currentSchool?.id.toString() || ''
  const currentSiteId = siteData.currentSite?.id.toString() || ''
  const { t } = useTranslation()
  const currentApplicationFormId =
    applicationFormData.currentApplicationForm?.id || 0

  const defaultFields = useMemo(() => {
    return data?.map(field => field.isDefault) || []
  }, [data])

  const useFetchCurrentApplicationForm = (
    successfulCallback?: (data: ApplicationFormTypes) => void
  ): UseQueryResult<ApplicationFormTypes, unknown> => {
    const result = useQuery(
      [
        QUERY_KEY.enrollmentForm.getCurrentApplicationFormKey,
        currentApplicationFormId,
      ],
      () =>
        getCurrentAppicationForm(
          currentApplicationFormId,
          +currentInstitutionId,
          +currentSiteId
        ),
      {
        onSuccess: data => {
          setApplicationFormData(prev => ({
            ...prev,
            currentApplicationForm: data,
          }))
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          // handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!currentApplicationFormId,
      }
    )
    return result
  }
  const useFetchAllApplicationFormData = (
    successfulCallback?: (data: ApplicationFormTypes[]) => void
  ): UseQueryResult<ApplicationFormTypes[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.enrollmentForm.applicationFormListKey, currentInstitutionId],
      () => getApplicationForms(+currentInstitutionId, +currentSiteId),
      {
        onSuccess: data => {
          successfulCallback?.(data)
          const currentApplicationForm =
            data.find(
              (applicationForm: ApplicationFormTypes) =>
                applicationForm.id ===
                applicationFormData.currentApplicationForm?.id
            ) || null

          setApplicationFormData({
            currentApplicationForm,
            applicationForms: data,
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

  const setCurrentApplicationForm = (id: number | null) => {
    const currentApplicationForm = applicationFormData.applicationForms.find(
      (applicationForm: ApplicationFormTypes) => applicationForm.id === id
    )

    if (currentApplicationForm) {
      setApplicationFormData(prev => ({
        ...prev,
        currentApplicationForm,
      }))
    } else {
      setApplicationFormData(prev => {
        const currentForm =
          prev.currentApplicationForm || ({} as ApplicationFormTypes)

        return {
          ...prev,
          currentApplicationForm: {
            id: null,
            formId: null,
            institutionId: currentForm.institutionId || 0,
            name: 'Default form',
            updatedAt: new Date(),
            description: currentForm.description || '',
            fields: defaultFields || [],
            courses: [],
          },
        } as never
      })
    }
  }

  const useCreateApplicationForm = (
    successfulCallback?: (data: CreateApplicationFormTypes) => void
  ): UseMutationResult<
    ApplicationFormTypes,
    ApiError,
    Partial<ApplicationFormTypes>,
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (classData: Partial<CreateApplicationFormTypes>) => {
        return createApplicationForm(
          {
            ...classData,
          },
          +currentInstitutionId,
          +currentSiteId
        )
      },
      onSuccess: data => {
        toast.success(t('setting:applicationForm.createApplicationForm'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useAssignApplicationForm = () => {
    const mutation = useMutation({
      mutationFn: ({
        formId,
        courseId,
      }: {
        formId: number | null
        courseId: number
      }) => {
        return assignApplicationForm({
          institutionId: +currentInstitutionId,
          formId,
          courseId,
          siteId: +currentSiteId,
        })
      },
      onSuccess: () => {
        toast.success(t('setting:applicationForm.assignApplicationForm'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }
  const useDeleteApplicationForm = (
    successfulCallback?: (data: ApplicationFormTypes) => void
  ): UseMutationResult<ApplicationFormTypes, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (applicationFormId: number) =>
        deleteApplicationForm(
          applicationFormId,
          +currentInstitutionId,
          +currentSiteId
        ),
      onSuccess: data => {
        setApplicationFormData(prev => ({
          ...prev,
          applicationForms: prev.applicationForms.filter(applcationForm => {
            return applcationForm.id !== data.id
          }),
        }))
        toast.success(t('setting:applicationForm.deleteApplicationForm'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateApplicationForm = (
    successfulCallback?: (data: ApplicationFormTypes) => void
  ): UseMutationResult<
    ApplicationFormTypes,
    ApiError,
    Partial<ApplicationFormTypes>,
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (updatedFields: Partial<ApplicationFormTypes>) =>
        updateApplicationForm(
          updatedFields,
          +currentInstitutionId,
          +currentSiteId
        ),
      onSuccess: (data: ApplicationFormTypes) => {
        const tempCurrentInformationField: ApplicationFormTypes = {
          ...data,
        }

        setApplicationFormData(prev => ({
          ...prev,
          applicationForms: prev.applicationForms.map(field =>
            field.id === data.id ? tempCurrentInformationField : field
          ),
          currentInformationField: tempCurrentInformationField,
        }))
        successfulCallback?.(tempCurrentInformationField)
        toast.success(t('setting:applicationForm.updateApplicationForm'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }
  return {
    applicationFormData,
    useAssignApplicationForm,
    useFetchAllApplicationFormData,
    setCurrentApplicationForm,
    useCreateApplicationForm,
    useDeleteApplicationForm,
    useFetchCurrentApplicationForm,
    useUpdateApplicationForm,
  }
}

export default useApplicationFormData
