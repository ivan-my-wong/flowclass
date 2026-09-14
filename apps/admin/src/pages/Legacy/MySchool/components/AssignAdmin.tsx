import { forwardRef, useImperativeHandle, useState } from 'react'

import { Content, Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { debounce } from 'lodash-es'
import { useTranslation } from 'react-i18next'
import { AiOutlineClose } from 'react-icons/ai'
import { FiEdit } from 'react-icons/fi'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { assignAdmin, getAdmin } from '@/api/schoolManagment'
import SvgIcon from '@/components/Images/SvgIcon'
import { TextInput } from '@/components/Inputs/TextInput'
import { StyledOverlay } from '@/components/Popups/Modal'
import CloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import { keyframes, styled } from '@/styles'
import { AdminSchool, School } from '@/types/school'
import { cn } from '@/utils/cn'

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(.1)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
})

const StyledContent = styled(Content, {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$background',
  position: 'fixed',
  top: '50%',
  left: '50%',
  gap: '$4',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90%',
  minWidth: '50%',
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: '$medium',
  padding: '$large',
  boxShadow: `$shadows[1]`,
  zIndex: '$modalContent',
  animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  '@sm': {
    minWidth: '90%',
  },
})

export type AssignAdminModalProps = {
  hidden?: boolean
  school: School
  handleAssignAdminSuccess: () => void
}

export type AssignAdminModalHandle = {
  handleOpenChange: () => void
}

const AssignAdminModal = forwardRef<
  AssignAdminModalHandle,
  AssignAdminModalProps
>(({ hidden, handleAssignAdminSuccess, school }, ref) => {
  const [open, setOpen] = useState<boolean>(false)
  const [listAdmin, setListAdmin] = useState<AdminSchool[]>()
  const [keyword, setkeyWord] = useState<string>('')
  const [selectedAdmin, setSelectedAdmin] = useState<AdminSchool>()
  const { t } = useTranslation()

  const useFetchAdminSchoolData = useQuery(
    [QUERY_KEY.site.getAdminSchoolKey],
    () => getAdmin(keyword),
    {
      onSuccess: data => {
        setListAdmin(data)
        return data
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
      cacheTime: 0,
      enabled: !!keyword,
    }
  )
  const { refetch } = useFetchAdminSchoolData
  const debouncedSearch = debounce(() => {
    refetch()
  }, 300)

  const handleInputChange = (event: any) => {
    const newValue = event.target.value
    setkeyWord(newValue)
    debouncedSearch()
  }
  const mutation = useMutation({
    mutationFn: () => assignAdmin(school.id, selectedAdmin?.id || 0),
    onSuccess: () => {
      toast.success(`${t('school:mySchool.titleAssignAdminDialog')}`)
      handleAssignAdminSuccess()
    },
    onError: (error: ApiError) => {
      toast.error(`${error.message}`)
    },
  })
  const handleAssignAdmin = () => {
    mutation.mutateAsync()
    setSelectedAdmin(undefined)
    setOpen(!open)
  }
  const handleOpenChange = () => {
    setSelectedAdmin(undefined)
    setOpen(!open)
  }

  useImperativeHandle(ref, () => ({
    handleOpenChange,
  }))

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Trigger asChild>
        <Button
          className={cn({
            hidden,
          })}
          variant="ghost"
          iconBefore={<FiEdit />}
        >
          {t('teachingService:class.editPhase')}
        </Button>
      </Trigger>
      <Portal>
        <StyledOverlay />
        <StyledContent>
          <Title>
            {t('school:mySchool.assignAdmin')}
            {school.name}
          </Title>
          <Separator />
          <TextInput type="text" onChange={e => handleInputChange(e)} />
          {!selectedAdmin ? (
            <Box
              direction="col"
              gap="lg"
              className="bg-background-layer-2 rounded-sm max-h-[20vh] overflow-y-scroll"
            >
              {listAdmin &&
                listAdmin.map(el => {
                  return (
                    <Element onClick={() => setSelectedAdmin(el)} key={el.id}>
                      {el.email}
                    </Element>
                  )
                })}
            </Box>
          ) : (
            <Box justify="between">
              <Text>
                {t('school:mySchool.assignAdmin')} {selectedAdmin.email}
              </Text>
              <SvgIcon onClick={() => setSelectedAdmin(undefined)}>
                <AiOutlineClose />
              </SvgIcon>
            </Box>
          )}

          <Button onClick={() => handleAssignAdmin()}>
            {t('school:mySchool.assign')}
          </Button>
          <CloseButton />
        </StyledContent>
      </Portal>
    </Root>
  )
})
const Element = styled('div', {
  cursor: 'pointer',
  width: '100%',
  padding: '$2 $4',
  '&:hover': {
    backgroundColor: '$backgroundLayer3',
  },
})
export default AssignAdminModal
