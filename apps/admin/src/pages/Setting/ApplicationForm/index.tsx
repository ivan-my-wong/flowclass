import { useEffect } from 'react'
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuSend } from 'react-icons/lu'

import AlertBox from '@/components/Boxes/AlertBox'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import useApplicationFormData from '@/hooks/useApplicationFormData'
import { useResponsive } from '@/hooks/useResponsive'
import ContentLayout from '@/layouts/ContentLayout'

import ApplicationCard from './ApplicationCard'

const ApplicationForm = () => {
  const { t } = useTranslation()
  const { isMobile } = useResponsive()
  const navigate = useNavigate()
  const {
    useFetchAllApplicationFormData,
    useDeleteApplicationForm,
    applicationFormData,
  } = useApplicationFormData()
  const fetchApplicationFormResult = useFetchAllApplicationFormData()
  const { isLoading, isError, isSuccess, isIdle, data, refetch } =
    fetchApplicationFormResult

  const [searchParams] = useSearchParams()
  useEffect(() => {
    if (searchParams.get('tab') === 'add') {
      navigate('/settings/application-form/add')
    }
  }, [])

  const deleteForm = useDeleteApplicationForm()
  const handleDeleteField = (id: number) => {
    deleteForm.mutateAsync(id).then(() => {
      refetch()
    })
  }

  const rightHeaderContent = (
    <Button
      className="w-full"
      onClick={() => navigate('/settings/application-form/add')}
    >
      {isMobile
        ? t(`common:action:create`)
        : t(`setting:applicationForm.createNewForm`)}
    </Button>
  )
  return (
    <ContentLayout
      // headerBackButton={headerBackButton}
      leftHeader={
        <Heading>{t('setting:applicationForm.applicationForm')}</Heading>
      }
      rightHeader={rightHeaderContent}
    >
      <div className="box-col-full px-4 pt-4">
        <AlertBox
          content={t('setting:applicationForm.description')}
          actionLink="/settings/student-information-field"
          actionText={
            t('setting:applicationForm.createCustomDataField') as string
          }
          icon={<LuSend />}
        />
      </div>

      {isIdle && (
        <FullScreenAlertBox text={t(`setting:applicationForm.noForms`)} />
      )}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess &&
        applicationFormData &&
        applicationFormData.applicationForms.length === 0 && (
          <FullScreenAlertBox text={t(`setting:applicationForm.noForms`)} />
        )}
      {isSuccess &&
        applicationFormData &&
        applicationFormData.applicationForms.length > 0 && (
          <>
            <div className="box-col p-4 gap-4">
              {applicationFormData.applicationForms.map(applicationForm => {
                return (
                  <ApplicationCard
                    key={applicationForm.id}
                    data={applicationForm}
                    setOpen={() =>
                      navigate(
                        `/settings/application-form/edit?formId=${applicationForm.id}`
                      )
                    }
                    handleDeleteField={handleDeleteField}
                  />
                )
              })}
            </div>
          </>
        )}
      <Outlet />
    </ContentLayout>
  )
}

export default ApplicationForm
