import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FaTrashAlt } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { ApiError, handleApiError } from '@/api/errors/apiError'
import { updateCustomSite } from '@/api/siteManagement'
import banner from '@/assets/fallback/imageFailed.png'
import logoImage from '@/assets/logos/flowclass_icon.png'
import Box from '@/components/Containers/Box'
import ImageAspect from '@/components/Images/ImageAspect'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import useSchoolData from '@/hooks/useSchoolData'
import { CustomSiteUpdateProps, siteState } from '@/stores/siteData'

interface SchoolCardProps {
  id: number
  name: string
  url: string | null
  bannerImage: string | null
  logo: string | null
  isDefault: boolean
  onSetDefault: () => void
}

const SchoolCard = ({
  id,
  name,
  url,
  bannerImage,
  logo,
  isDefault,
  onSetDefault,
}: SchoolCardProps): JSX.Element => {
  const { t } = useTranslation()
  const { setCurrentSchool, useDeleteSchool } = useSchoolData()
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false)
  const [isInputValid, setIsInputValid] = useState<boolean>(false)
  const navigate = useNavigate()

  const deleteSchool = useDeleteSchool()

  const handleViewSchool = () => {
    setCurrentSchool(id)
    navigate('/home')
  }

  const handleConfirm = () => {
    deleteSchool.mutate(id)
  }

  const { currentSite } = useRecoilValue(siteState)
  const schoolUrl = `https://${currentSite?.url}/@${url ?? ''}`

  const { mutateAsync: mutateAsyncUpadteDefaultSchool } = useMutation({
    mutationFn: ({
      siteId,
      site,
    }: {
      siteId: number
      site: Partial<CustomSiteUpdateProps>
    }) => updateCustomSite(siteId, site),
    onSuccess: () => {
      toast.success(t('teachingService:class.updateClassSuccess'))
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const handleSetDefaultSchool = async (): Promise<void> => {
    if (currentSite) {
      await mutateAsyncUpadteDefaultSchool({
        siteId: currentSite.id,
        site: { defaultInstitutionId: id },
      })
      onSetDefault()
    }
  }

  return (
    <div className="flex flex-col !important relative rounded-lg border border-text-disabled shadow-sm w-[45%] overflow-hidden sm:w-full">
      <div className="flex rounded-md">
        <ImageAspect
          s3="public"
          ratio={16 / 9}
          width="100%"
          src={bannerImage ?? banner}
          alt="Banner image"
          borderRadius="1rem"
        />
      </div>
      <Box responsive justify="flex-start" className="pb-4 px-4">
        <ImageAspect
          s3="public"
          ratio={1}
          width="20%"
          src={logo ?? logoImage}
          alt="Logo image"
          borderRadius="1rem"
        />

        <Box direction="column" align="flex-start" className="ml-4">
          <Heading align="left">{name}</Heading>
          <Text className="mb-2">{schoolUrl}</Text>
          <Box justify="flex-start" wrap>
            <Button onClick={handleViewSchool}>{t(`school:viewSchool`)}</Button>
            <Button
              variant="outline"
              onClick={() => {
                window.open(
                  schoolUrl,
                  '_blank' // <- This is what makes it open in a new window.
                )
              }}
            >
              {t(`school:visitSchoolSite`)}
            </Button>
            <Button
              variant="outline"
              onClick={handleSetDefaultSchool}
              disabled={isDefault}
            >
              {isDefault
                ? t(`school:defaultSchool`)
                : t(`school:setDefaultSchool`)}
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={() => setShowConfirmPopup(true)}
            >
              <FaTrashAlt />
            </Button>
          </Box>
        </Box>
      </Box>
      <CustomedAlertDialog
        loading={deleteSchool.isLoading}
        open={showConfirmPopup}
        setOpen={setShowConfirmPopup}
        description={t('school:deleteSchool.textInput') as string}
        title={t('school:deleteSchool.title') as string}
        inputRequired
        isInputValid={isInputValid}
        cancelText={t('school:deleteSchool.cancel') as string}
        actionText={t('school:deleteSchool.confirm') as string}
        onInputChange={value => {
          if (value === 'delete') {
            setIsInputValid(true)
          } else {
            setIsInputValid(false)
          }
        }}
        onActionClick={handleConfirm}
      />
    </div>
  )
}

export default SchoolCard
