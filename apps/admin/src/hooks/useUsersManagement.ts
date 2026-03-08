import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { getInstructorAnalytics, getInstructors } from '@/api/instructors'
import {
  acceptInviteWithRegister,
  getInvitationByToken,
} from '@/api/invitation'
import {
  changeAliasPassword,
  deleteUser,
  exportClassLessonsCsv,
  getClassLessonsOfInstructor,
  getUserList,
  getUserRole,
  inviteUser,
  updateUser,
  updateUserPassword,
  updateUserPermission,
} from '@/api/userManagement'
import { QUERY_KEY } from '@/constants/queryKey'
import { Site } from '@/stores/siteData'
import { IPaginatedData } from '@/types/pagination'
import {
  BaseUser,
  BaseUserRole,
  ChangeAliasPasswordDto,
  ChangeUserPasswordDto,
  ExportCsvPayload,
  InstructorAnalyticsResponse,
  SinglePermission,
  StaffUserType,
  UpcomingClasses,
  UpcomingClassesDto,
} from '@/types/user'
import {
  AcceptInviteFormData,
  InviteSuccessResponse,
  InviteUserFormData,
} from '@/types/userManagement'

import useSchoolData from './useSchoolData'
import useSiteData from './useSiteData'

const useUsersManagement = () => {
  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()
  const { t } = useTranslation()
  const currentSiteId = siteData?.currentSite?.id || 0
  const currentSchoolId = schoolData?.currentSchool?.id || 0
  const queryClient = useQueryClient()
  const fetchUsersKey = [
    QUERY_KEY.userManagement.fetchUsersKey,
    currentSiteId,
    currentSchoolId,
  ]
  const useFetchUsers = (
    onSuccessCallback?: (data: IPaginatedData<StaffUserType[]>) => void
  ) => {
    return useQuery({
      queryKey: fetchUsersKey,
      queryFn: () =>
        getUserList({ siteId: currentSiteId, schoolId: currentSchoolId }),
      onSuccess: (data: IPaginatedData<StaffUserType[]>) => {
        onSuccessCallback?.(data)
      },
    })
  }

  const useInviteUser = (
    onSuccessCallback?: (data: InviteSuccessResponse[]) => void
  ) => {
    return useMutation<InviteSuccessResponse[], ApiError, InviteUserFormData>(
      QUERY_KEY.user.inviteUserKey,
      (payload: InviteUserFormData) => {
        return inviteUser(currentSchoolId, currentSiteId, payload)
      },
      {
        onSuccess: (data: InviteSuccessResponse[]) => {
          onSuccessCallback?.(data)
          toast.success(t('setting:userManagement.inviteSuccess'))
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useAcceptInvite = (onSuccessCallback?: (data: Site[]) => void) => {
    return useMutation<Site[], ApiError, AcceptInviteFormData>({
      mutationFn: (data: AcceptInviteFormData) =>
        acceptInviteWithRegister({
          token: data.token ?? '',
          agree: true,
          firstName: data.firstName,
          email: data.email,
          password: data.password,
          phone: data.phone,
        }),
      onSuccess: (data: Site[]) => {
        onSuccessCallback?.(data)
        toast.success(t('login:register.inviteSuccess'))
      },
      onError: (error: ApiError) => {
        if (error.message.includes('isModerate')) {
          toast.error(t('login:errors.strongPassword'))
        } else {
          handleApiError({ error, t })
        }
      },
    })
  }

  const useGetInvitationByToken = (
    token: string,
    onSuccessCallback?: () => void
  ) => {
    return useQuery(
      [QUERY_KEY.user.getInvitationKey, token],
      () => getInvitationByToken(token ?? ''),
      {
        onSuccess: () => {
          onSuccessCallback?.()
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useDeleteUser = (onSuccessCallback?: () => void) => {
    return useMutation<void, ApiError, string>({
      mutationFn: (userId: string) => deleteUser(userId, currentSiteId),
      onSuccess: () => {
        onSuccessCallback?.()
        toast.success(t('account:deleteAccount.successDeleteAccount'))
        queryClient.invalidateQueries(fetchUsersKey)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdateUser = (
    userId: number,
    onSuccessCallback?: (user: StaffUserType) => void
  ) => {
    return useMutation<StaffUserType, ApiError, StaffUserType>({
      mutationFn: (data: StaffUserType) =>
        updateUser(userId, data, currentSchoolId),
      onSuccess: (user: StaffUserType) => {
        onSuccessCallback?.(user)
        toast.success(t('setting:userManagement.updateSuccess'))
        queryClient.invalidateQueries(fetchUsersKey)
        queryClient.invalidateQueries([
          QUERY_KEY.user.getDetailUserKey,
          userId,
          currentSchoolId,
        ])
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdateUserPermission = (
    userId: number,
    onSuccessCallback?: (user: BaseUserRole) => void
  ) => {
    return useMutation<BaseUserRole, ApiError, SinglePermission[]>({
      mutationFn: (data: SinglePermission[]) =>
        updateUserPermission(userId, data, currentSiteId),
      onSuccess: (user: BaseUserRole) => {
        onSuccessCallback?.(user)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t, showToast: true })
      },
    })
  }

  const useUpdateUserPassword = (
    userId: number,
    onSuccessCallback?: () => void
  ) => {
    return useMutation<void, ApiError, ChangeUserPasswordDto>({
      mutationFn: (data: ChangeUserPasswordDto) =>
        updateUserPassword(userId, data, currentSiteId),
      onSuccess: () => {
        onSuccessCallback?.()
        toast.success(t('setting:userManagement.updatePasswordSuccess'))
        queryClient.invalidateQueries(fetchUsersKey)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useChangeAliasPassword = (onSuccessCallback?: () => void) => {
    return useMutation<void, ApiError, ChangeAliasPasswordDto>({
      mutationFn: (data: ChangeAliasPasswordDto) =>
        changeAliasPassword(data, currentSchoolId),
      onSuccess: () => {
        onSuccessCallback?.()
        toast.success(t('student:changePassword.success'))
        // Invalidate student-related queries to refresh data
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.student.getStudentDetailKey],
        })
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useGetUserRole = (userId: number) => {
    return useQuery(
      [QUERY_KEY.user.getDetailUserKey, userId, currentSchoolId],
      () => getUserRole(userId, currentSchoolId),
      {
        enabled: !!userId && !!currentSchoolId,
      }
    )
  }

  const useGetInstructors = (
    onSuccessCallback?: (data: StaffUserType[]) => void
  ) => {
    return useQuery(
      [QUERY_KEY.user.getInstructorsKey, currentSiteId, currentSchoolId],
      () => getInstructors(currentSiteId, currentSchoolId),
      {
        onSuccess: (data: StaffUserType[]) => {
          onSuccessCallback?.(data)
        },
      }
    )
  }

  const useGetInstructorAnalytics = (
    instructorId: number,
    params: Omit<UpcomingClassesDto, 'siteId' | 'institutionId'>,
    onSuccessCallback?: (data: InstructorAnalyticsResponse) => void
  ) => {
    return useQuery(
      [
        QUERY_KEY.user.getInstructorAnalyticsKey,
        currentSiteId,
        currentSchoolId,
        params.startDate,
        params.endDate,
      ],
      () =>
        getInstructorAnalytics({
          instructorId,
          siteId: currentSiteId,
          institutionId: currentSchoolId,
          startDate: params.startDate,
          endDate: params.endDate,
          courseIds: params.courseIds,
          classIds: params.classIds,
          locationIds: params.locationIds,
        }),
      {
        enabled: !!instructorId && !!currentSchoolId && !!currentSiteId,
        onSuccess: (data: InstructorAnalyticsResponse) => {
          onSuccessCallback?.(data)
        },
      }
    )
  }

  const useGetClassLessonsOfInstructor = (
    params: Omit<UpcomingClassesDto, 'siteId' | 'institutionId'>,
    onSuccessCallback?: (data: UpcomingClasses[]) => void
  ) => {
    return useQuery(
      [
        QUERY_KEY.user.getUpComingClassesKey,
        currentSiteId,
        currentSchoolId,
        params.instructorId,
        params.courseIds,
        params.classIds,
        params.locationIds,
        params.startDate,
        params.endDate,
      ],
      () =>
        getClassLessonsOfInstructor({
          ...params,
          siteId: currentSiteId,
          institutionId: currentSchoolId,
        }),
      {
        enabled: !!params.instructorId && !!currentSiteId && !!currentSchoolId,
        onSuccess: (data: UpcomingClasses[]) => {
          onSuccessCallback?.(data)
        },
      }
    )
  }

  const useExportLessonsCvs = (onSuccessCallback?: () => void) => {
    return useMutation<void, ApiError, ExportCsvPayload>({
      mutationFn: (data: ExportCsvPayload) =>
        exportClassLessonsCsv(
          {
            ...data.params,
            siteId: currentSiteId,
            institutionId: currentSchoolId,
          },
          data.fileName
        ),
      onSuccess: () => {
        onSuccessCallback?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    useFetchUsers,
    useInviteUser,
    useAcceptInvite,
    useGetInvitationByToken,
    useDeleteUser,
    useUpdateUser,
    useUpdateUserPassword,
    useGetInstructors,
    useGetInstructorAnalytics,
    useGetClassLessonsOfInstructor,
    useGetUserRole,
    useUpdateUserPermission,
    useExportLessonsCvs,
    useChangeAliasPassword,
  }
}

export default useUsersManagement
