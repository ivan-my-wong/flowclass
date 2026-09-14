import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import ApiError from '@/api/errors/apiError'
import { removeAssignAdmin } from '@/api/schoolManagment'
import AdminIcon from '@/assets/svgs/myschool/adminIcon'
import ImageAspect from '@/components/Images/ImageAspect'
import SvgIcon from '@/components/Images/SvgIcon'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { schoolState } from '@/stores/schoolData'
import { AdminSchool, School } from '@/types/school'

import AdminElement from './AdminElement'
import AssignAdminModal, { AssignAdminModalHandle } from './AssignAdmin'

interface Props {
  data: School
  setFeatAgain: () => void
}

const SchoolCard = ({ data, setFeatAgain }: Props) => {
  const [, setSchoolData] = useRecoilState(schoolState)

  const naviagte = useNavigate()
  const { t } = useTranslation()
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminSchool>()
  const assignAdminModalHandle = useRef<AssignAdminModalHandle>(null)
  // const [isOpenAssign, setIsOpenAssign] = useState<boolean>(false)
  const openModal = () => {
    assignAdminModalHandle.current?.handleOpenChange?.()
  }
  const mutation = useMutation({
    mutationFn: () => removeAssignAdmin(data.id, selectedAdmin?.id || 0),
    onSuccess: () => {
      toast.success(`${t('school:mySchool.titleRemoveAssignAdminDialog')}`)
      setFeatAgain()
    },
    onError: (error: ApiError) => {
      toast.error(`${error.message}`)
    },
  })
  const handleRemoveAdmin = () => {
    mutation.mutateAsync()
    setShowConfirmPopup(true)
  }
  const handleChooseAdminRemove = (value: AdminSchool) => {
    setSelectedAdmin(value)
    setShowConfirmPopup(true)
  }
  const handleSelecSchool = async () => {
    // const currentSchool = await getCurrentSchool(data.id)
    setSchoolData(prev => ({ ...prev, currentSchool: data }))
    naviagte('/home')
  }
  return (
    <Box direction="col" className="rounded-br-lg rounded-bl-lg">
      <ImageAspect
        alt={data ? data.name : ''}
        width="100%"
        ratio={3 / 1}
        src={data.bannerImage || ''}
      />
      <Box direction="col" className="px-6" align="start">
        <Box justify="between">
          <Box className="-mt-16" justify="start">
            <ImageAspect
              style={{ borderRadius: '10px' }}
              alt="a"
              width="8rem"
              ratio={1 / 1}
              src={data.logo || ''}
            />
          </Box>
          <Button className="py-3 px-8" onClick={() => handleSelecSchool()}>
            {t('school:mySchool.enterEditor')}
          </Button>
        </Box>

        <Text css={{ fontSize: '$5', fontWeight: 'bold' }}>{data.name}</Text>
        <Box
          justify="between"
          className="mt-12 pt-3 border-t border-t-text-disabled"
        >
          <Box justify="start">
            <SvgIcon>
              <AdminIcon />
            </SvgIcon>
            {t('school:mySchool.schoolAdmin')}
          </Box>
          <Box
            justify="end"
            className="cursor-pointer text-primary"
            onClick={() => openModal()}
          >
            {t('common:action.add')}
          </Box>
        </Box>

        {data && data?.admins[0].id !== null ? (
          <Box align="start" direction="col" className="mb-4">
            {data &&
              data.admins.map(el => {
                return (
                  <AdminElement
                    key={el.id}
                    data={el}
                    handleDelete={() => handleChooseAdminRemove(el)}
                  />
                )
              })}
          </Box>
        ) : (
          <Box justify="start" className="mb-4">
            <Text css={{ color: '$textSubtle' }}>
              {t('school:mySchool.notAssigned')}
            </Text>
          </Box>
        )}
      </Box>
      <AssignAdminModal
        ref={assignAdminModalHandle}
        hidden
        school={data}
        handleAssignAdminSuccess={setFeatAgain}
      />
      <CustomedAlertDialog
        open={showConfirmPopup}
        setOpen={setShowConfirmPopup}
        description={t('school:mySchool:descriptionDeleteLesson')}
        title={`${t('school:mySchool.titleDeleteDialog')}`}
        alertType={AlertTypes.WARN}
        cancelText="Cancel"
        actionText="Confirm"
        onActionClick={handleRemoveAdmin}
      />
    </Box>
  )
}

export default SchoolCard
