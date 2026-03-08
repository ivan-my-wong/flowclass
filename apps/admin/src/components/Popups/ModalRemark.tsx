import React, { useEffect, useState } from 'react'

import {
  Arrow,
  Content,
  Portal,
  Root,
  Trigger,
} from '@radix-ui/react-dropdown-menu'
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
import { AddStudentMemoRequestDto } from '@/types/studentMemo'
import { cn } from '@/utils/cn'

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
  contentProps?: React.CSSProperties
  contentClassName?: string
  title: string
  placeholder: string
  defaultValue: string
  studentId: number
}

const ModalRemark = ({
  trigger,
  contentProps,
  contentClassName,
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
      <Trigger asChild>
        <div className="flex items-center justify-center cursor-pointer">
          {trigger}
        </div>
      </Trigger>

      <Portal>
        <Content
          sideOffset={10}
          style={contentProps}
          className={cn(
            'flex flex-col min-w-[20rem] bg-background rounded-md p-4 gap-4',
            'border border-tertiary shadow-lg',
            'data-[state=open]:data-[side=top]:animate-slide-down-fade',
            'data-[state=open]:data-[side=right]:animate-slide-left-fade',
            'data-[state=open]:data-[side=bottom]:animate-slide-up-fade',
            'data-[state=open]:data-[side=left]:animate-slide-right-fade',
            contentClassName
          )}
        >
          <Text>{title}</Text>

          <IconButton
            onClick={() => setOpen(false)}
            plain
            icon={<MdOutlineClose />}
            className="absolute top-2.5 right-2.5"
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
            className="bg-background-layer-4 border-background-disabled placeholder:text-background-disabled"
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

          <Arrow className="fill-tertiary" />
        </Content>
      </Portal>
    </Root>
  )
}

export default ModalRemark

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
