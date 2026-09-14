import { forwardRef, useImperativeHandle, useState } from 'react'

import {
  Content,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
} from '@radix-ui/react-dialog'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import Box from '@/components/Containers/Box'
import { TextInput } from '@/components/Inputs/TextInput'
import { Spinner } from '@/components/Loaders/Spinner'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import useCourseData from '@/hooks/useCourseData'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { keyframes, styled } from '@/styles'
import { Course } from '@/types/course'
import { generatePathFromName } from '@/utils/generate-link.utils'
import { validateDomain } from '@/utils/validate'

import { initializeCourseSectionValues } from './EditCourse/PageContent'

const StyledOverlay = styled(Overlay, {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  position: 'fixed',
  inset: 0,
})

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

type CreateCourseModalProps = {
  hidden?: boolean

  handleCreateCourseSuccess: (course: Course) => void
}

export type CreateCourseModalHandle = {
  handleOpenChange: () => void
}

const CreateCourseModal = forwardRef<
  CreateCourseModalHandle,
  CreateCourseModalProps
>(({ hidden, handleCreateCourseSuccess }, ref) => {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()
  const [open, setOpen] = useState<boolean>(false)

  const coursePath = watch('path')

  const { t } = useTranslation()
  const { useCreateCourse, useFetchAllCourseData } = useCourseData()
  const createCourse = useCreateCourse(handleCreateCourseSuccess)
  const { currentSite } = useRecoilValue(siteState)
  const { currentSchool } = useRecoilValue(schoolState)
  const fetchCourseDataResult = useFetchAllCourseData()

  const customLink = `https://${currentSite?.url}/@${
    currentSchool?.url ?? ''
  }/${coursePath ?? ''}`

  const handleOpenChange = () => {
    setOpen(!open)
  }

  useImperativeHandle(ref, () => ({
    handleOpenChange,
  }))

  const onSubmit = (data: FieldValues) => {
    createCourse.mutateAsync({
      name: data.name,
      path: data.path,
      longDescriptions: initializeCourseSectionValues(),
      // type: createCourseType,
    })

    setGtmEvent({
      // courseType: createCourseType,
      coursePath: data.path,
      event: GtmEvent.createCourse,
    })
  }

  const validateUniquePath = (path: string): boolean => {
    const pathsArray = fetchCourseDataResult?.data?.map(obj => obj.path)
    return !pathsArray?.includes(path)
  }

  const handleNameChange = (event: any) => {
    const newNameValue = event.target.value
    const newPathValue = generatePathFromName(newNameValue)
    setValue('name', newNameValue)
    setValue('path', newPathValue)
  }

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Trigger asChild>
        <></>
      </Trigger>
      <Portal>
        <StyledOverlay />
        <StyledContent>
          <Title>{t('teachingService:createCourseModal.title')}</Title>
          <Separator />
          <Text>{`${t('teachingService:createCourseModal.textInput')}:`}</Text>
          <Box
            justify="space-between"
            responsive
            css={{
              '@sm': {
                gap: '$6',
                alignItems: 'flex-start',
              },
            }}
          >
            <Box
              direction="column"
              justify="flex-start"
              css={{ '@sm': { alignItems: 'flex-start' } }}
            >
              <Box>
                <TextInput
                  label={t(`teachingService:createCourseModal.name`)}
                  id="name"
                  isError={!!errors.name}
                  helperText={errors.name?.message as string}
                  {...register('name', {
                    required: t('login:errors.required') as string,
                  })}
                  onChange={handleNameChange}
                />
              </Box>
              <Box>
                <TextInput
                  label={t(`teachingService:createCourseModal.path`)}
                  id="path"
                  isError={!!errors.path}
                  helperText={errors.path?.message as string}
                  {...register('path', {
                    required: t('login:errors.required') as string,
                    validate: (value: string) => {
                      if (!validateDomain(value)) {
                        return t('onboarding:errors.invalidDomain') as string
                      }

                      if (!validateUniquePath(value)) {
                        return t(
                          'teachingService:createCourseModal.duplicatePath'
                        ) as string
                      }

                      return undefined
                    },
                  })}
                />
              </Box>
              <Text css={{ marginTop: '$4' }}>{`${t(
                `teachingService:view.courseLink`
              )}: `}</Text>
              <Text
                css={{
                  wordBreak: 'break-all',
                  lineHeight: 1.25,
                  textDecoration: 'underline',
                }}
              >
                {customLink}
              </Text>
            </Box>
          </Box>

          <Button
            className="w-fit self-end"
            onClick={handleSubmit(onSubmit)}
            disabled={createCourse.isLoading}
          >
            {createCourse.isLoading ? (
              <Spinner size="small" />
            ) : (
              t(`teachingService:createCourseModal.confirm`)
            )}
          </Button>
          <ModalCloseButton />
        </StyledContent>
      </Portal>
    </Root>
  )
})

export default CreateCourseModal
