import React, { useEffect, useState } from 'react'

import {
  Arrow,
  Content,
  Portal,
  Root,
  Trigger,
} from '@radix-ui/react-dropdown-menu'
import { CSS } from '@stitches/react'
import { useTranslation } from 'react-i18next'
import { GiConfirmed } from 'react-icons/gi'
import { MdOutlineClose } from 'react-icons/md'
import { RiDeleteBinLine } from 'react-icons/ri'
import { useMutation, useQueryClient } from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { addMemo } from '@/api/student'
import { QUERY_KEY } from '@/constants/queryKey'
import { schoolState } from '@/stores/schoolData'
import { remarksState } from '@/stores/studentData'
import { keyframes, styled } from '@/styles'
import { AddStudentMemoRequestDto } from '@/types/studentMemo'

import IconButton from '../Buttons/IconButton'
import LoadingButton from '../Buttons/LoadingButton'
import TextArea from '../Inputs/TextArea'
import Text from '../Texts/Text'
import Box from '../ui/Box'

type MenuItemProps = {
  disabled?: boolean
  content: string | React.ReactNode
  rightContent?: React.ReactNode
  onClick?: () => void
}

export type DropDownMenuItemType = MenuItemProps & { type: 'item' }

interface DropdownMenuProps {
  trigger: JSX.Element
  contentProps?: CSS
  title: string
  placeholder: string
  defaultValue: string
  studentId: number
}

const StyledClose = styled(IconButton, {
  position: 'absolute!important',
  top: 10,
  right: 10,
})
const ModalRemark = ({
  trigger,
  contentProps,
  title,
  placeholder,
  defaultValue,
  studentId,
}: DropdownMenuProps): JSX.Element => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const currentSchool = useRecoilValue(schoolState)
  const [remarks, setRemarks] = useRecoilState(remarksState)
  const institutionId = currentSchool?.currentSchool?.id

  const queryClient = useQueryClient()
  const memo = remarks?.[studentId].memo || ''
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (data: AddStudentMemoRequestDto) => addMemo(data),
    onSuccess: data => {
      if (data.memo === null) {
        toast.success(t('student:memo.deleteMemoSuccess'))
      } else {
        toast.success(t('student:memo.createMemoSuccess'))
      }

      queryClient.invalidateQueries([
        QUERY_KEY.site.getCurrentSchoolKey,
        institutionId,
      ])
      setRemarks(prevRemarks => ({
        ...prevRemarks,
        [studentId]: {
          ...prevRemarks[studentId],
          isShow: false,
        },
      }))
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const saveRemark = () => {
    if (memo === '') {
      toast.warning(t('student:memo.memoEmpty'))
    } else {
      mutateAsync({
        userId: studentId,
        institutionId: institutionId ?? 0,
        memo,
      })
    }
  }

  const deleteRemark = () => {
    if (memo === '') {
      setRemarks(prevRemarks => ({
        ...prevRemarks,
        [studentId]: {
          ...prevRemarks[studentId],
          isShow: false,
        },
      }))
      toast.success(t('student:memo.deleteMemoSuccess'))
    } else {
      mutateAsync({
        userId: studentId,
        institutionId: institutionId ?? 0,
        memo: null,
      })
    }
  }

  useEffect(() => {
    if (!institutionId) {
      setOpen(false)
      toast.error(t('common:errors.INSTITUTION_NOT_FOUND'))
    }
  }, [institutionId])
  return (
    <Root modal open={open} onOpenChange={setOpen}>
      <StyledTrigger asChild>
        {/* // special case */}
        {trigger}
      </StyledTrigger>

      <Portal>
        <StyledContent sideOffset={10} css={contentProps}>
          <Text>{title}</Text>

          <StyledClose
            onClick={() => setOpen(false)}
            plain
            icon={<MdOutlineClose />}
          />

          <TextArea
            onClick={e => e.stopPropagation()}
            rows={5}
            defaultValue={defaultValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              const { value } = e.target

              setRemarks(prevRemarks => ({
                ...prevRemarks,
                [studentId]: {
                  ...prevRemarks[studentId],
                  memo: value,
                },
              }))
            }}
            resize={false}
            css={{
              backgroundColor: '$backgroundLayer4',
              borderColor: '$backgroundDisabled',
              '&::placeholder': {
                color: '$backgroundDisabled',
              },
            }}
            placeholder={placeholder}
          />
          <Box>
            <LoadingButton
              iconBefore={<GiConfirmed />}
              disabled={isLoading}
              isLoading={isLoading}
              onClick={() => {
                saveRemark()
              }}
            >
              {t('common:action.confirm')}
            </LoadingButton>
            <LoadingButton
              iconBefore={<RiDeleteBinLine />}
              color="warn"
              disabled={isLoading}
              isLoading={isLoading}
              onClick={() => {
                deleteRemark()
              }}
            >
              {t('common:action.delete')}
            </LoadingButton>
          </Box>

          <StyledArrow />
        </StyledContent>
      </Portal>
    </Root>
  )
}

export default ModalRemark

const StyledTrigger = styled(Trigger, {
  // width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
})

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const contentStyles = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: '20rem',
  backgroundColor: '$background',
  borderRadius: '$1',
  padding: '1rem',
  gap: '1rem',
  border: '1px solid $tertiary',
  boxShadow: `0px 10px 20px -20px $tertiary, 0px 10px 20px -20px $tertiary`,
  animationDuration: '400ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'transform, opacity',
  zIndex: 1,
  '&[data-state="open"]': {
    '&[data-side="top"]': { animationName: slideDownAndFade },
    '&[data-side="right"]': { animationName: slideLeftAndFade },
    '&[data-side="bottom"]': { animationName: slideUpAndFade },
    '&[data-side="left"]': { animationName: slideRightAndFade },
  },
}

const StyledContent = styled(Content, contentStyles)

const StyledArrow = styled(Arrow, { fill: '$tertiary' })

// const itemStyles = {
//   all: 'unset',
//   fontSize: '$3',
//   color: '$text',
//   borderRadius: '$1',
//   display: 'flex',
//   alignItems: 'center',
//   height: '3rem',
//   cursor: 'pointer',
//   position: 'relative',
//   justifyContent: 'flex-start',
//   paddingLeft: '1.2rem',
//   userSelect: 'none',
//   zIndex: 2000,

//   '&[data-disabled]': {
//     color: '$textDisabled',
//     pointerEvents: 'none',
//   },

//   '&[data-highlighted]': {
//     backgroundColor: '$backgroundLayer3',
//   },
// }

// const StyledItem = styled(Item, itemStyles)

// const RightSlot = styled('div', {
//   marginLeft: 'auto',
//   paddingLeft: '$8',
//   color: '$textSubtle',
//   '[data-highlighted] > &': { color: '$textContrast' },
//   '[data-disabled] &': { color: '$textDisabled' },
// })
