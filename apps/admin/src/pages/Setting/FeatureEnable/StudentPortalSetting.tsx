import { t } from 'i18next'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { updateWebpageStyle } from '@/api/settingSite'
import studentLoginImage from '@/assets/settings/studentLogin.png'
import ImageAspect from '@/components/Images/ImageAspect'
import Heading from '@/components/Texts/Heading'
import Switch from '@/components/Toggle/Switch'
import Text from '@/components/ui/Text'
import { useResponsive } from '@/hooks/useResponsive'
import useSchoolData from '@/hooks/useSchoolData'
import { UpdateWebpageInstitutionSettingProps } from '@/types/settingWebpageInstitution'

const StudentPortalSetting = () => {
  const { isMobile } = useResponsive()
  const { useFetchCurrentSchoolSetting, currentSchool } = useSchoolData()
  const { data } = useFetchCurrentSchoolSetting()
  const { refetch } = useFetchCurrentSchoolSetting()

  const { mutateAsync: handleUpdate } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: UpdateWebpageInstitutionSettingProps
    }) => {
      return updateWebpageStyle(id, {
        ...data,
        institutionId: currentSchool?.id,
      })
    },
    onSuccess: data => {
      if (data) {
        toast.success(t('setting:studentPortal.updateSuccess'))
      } else {
        toast.error(t('setting:studentPortal.updateError'))
      }
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  return (
    <div className="box-col-full gap-8">
      <div className="box-responsive border rounded-lg p-4">
        <div className="box-col-full gap-4 items-start">
          <Heading>{t(`setting:studentPortal.heading`)}</Heading>
          <Switch
            checked={data?.studentLogin ?? false}
            className="justify-start"
            textClassName="w-[60%]"
            onCheckedChange={studentLogin => {
              if (data?.id) {
                handleUpdate({
                  id: data?.id,
                  data: {
                    studentLogin,
                  },
                }).then(() => refetch())
              }
            }}
            label={t(`setting:studentPortal.label`)}
          />
          <Text className="text-sm">
            {t(`setting:notificationSettings.tierRestriction`)}
          </Text>
        </div>
        <ImageAspect
          src={studentLoginImage}
          alt="displayEmailLogo"
          width={isMobile ? '100%' : '40%'}
        />
      </div>
    </div>
  )
}

export default StudentPortalSetting
