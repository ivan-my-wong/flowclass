import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react'

import { ArchiveIcon } from '@radix-ui/react-icons'
import { Item } from '@radix-ui/react-toggle-group'
import type { Identifier, XYCoord } from 'dnd-core'
import { useDrag, useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { FaCheck, FaSpinner } from 'react-icons/fa'
import { MdDragIndicator, MdGroupWork } from 'react-icons/md'
import { RiInsertColumnLeft } from 'react-icons/ri'

import CopyIcon from '@/assets/svgs/CopyIcon'
import DeleteIcon from '@/assets/svgs/DeleteIcon'
import EditIcon from '@/assets/svgs/EditIcon'
import UndoIcon from '@/assets/svgs/UndoIcon'
import useClassData from '@/hooks/useClassData'
import { loadingSpinner, styled } from '@/styles'
import { Classes } from '@/types/classes'
import { DataTestId } from '@/types/common'
import { cn } from '@/utils/cn'

import DropdownMenu, {
  DropDownMenuItemType,
} from '../DropDownMenus/DropDownMenu'
import SvgIcon from '../Images/SvgIcon'
import RawInput from '../Inputs/RawInput'
import { Spinner } from '../Loaders/Spinner'
import Text from '../Texts/Text'
import Box from '../ui/Box'

import { ToggleGroupLabelsProps } from './ToggleGroup'

export enum ToggleGroupDropdownMenuModules {
  DUPLICATE,
  MULTIPLE_CLASS,
  EDIT,
  DELETE,
  ARCHIVE,
  UNARCHIVE,
}

export type ToggleGroupItemProps = {
  index: number
  item: ToggleGroupLabelsProps
  onChange: (value: { value: string | number; label: string }) => void
  handleOrderSection?: (...args: any[]) => any
  isDraggable?: boolean
  isDuplicating?: boolean
  isStandalone?: boolean
  type: string
  dropdownMenuModules?: ToggleGroupDropdownMenuModules[]
} & DataTestId

export interface DragItem {
  index: number
  id: string
  type: string
}

const comboToggleGroupCss = {
  all: 'unset',
  cursor: 'pointer',
  // boxShadow: '$1',
  gap: '$2',
  background: '$backgroundLayer2',
  color: '$text',
  minHeight: '$8',
  display: 'flex',
  fontSize: '$4',
  lineHeight: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$2 $1',
  borderRadius: '$small',
  width: '100%',
  minWidth: '8rem',

  // '&:hover': { backgroundColor: '$primarySubtle', color: '$textContrast' },
  // '&[data-state=on]': {
  //   border: '3px solid $colors$primary',
  // },

  variants: {
    status: {
      normal: {},
      highlight: {},
      error: {
        borderBottom: '3px solid $colors$warn!important',
        '&:hover': { color: '$secondarySubtle' },
      },
    },
  },
}

const standaloneCss = {
  all: 'unset',
  cursor: 'pointer',
  // boxShadow: '$1',
  gap: '$2',
  background: '$backgroundLayer2',
  color: '$text',
  height: '$8',
  display: 'flex',
  fontSize: '$4',
  lineHeight: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$2 $2 $2 $4',
  borderRadius: '$small',
  width: '100%',
  minWidth: '8rem',
  '&:hover': { backgroundColor: '$primarySubtle', color: '$textContrast' },
  '&[data-state=on]': {
    border: '3px solid $colors$primary',
  },

  variants: {
    status: {
      normal: {},
      highlight: {},
      error: {
        borderBottom: '3px solid $colors$warn!important',
        '&:hover': { color: '$secondarySubtle' },
      },
    },
  },
}

const ToggleGroupItemComponent = ({
  index,
  item,
  onChange,
  handleOrderSection,
  isDraggable,
  isDuplicating,
  isStandalone,
  type,
  dropdownMenuModules,
  dataTestId,
}: ToggleGroupItemProps): JSX.Element => {
  const [multipleClass, setMultipleClass] = useState<boolean>(
    item.indicators?.multipleClass ?? false
  )
  const [dropIn] = useState<boolean>(item.indicators?.dropIn ?? false)
  const [isIndicatorLoading, setIsIndicatorLoading] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)
  const editValue = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const { useSetMultipleClasses } = useClassData()

  const [tmpEditvalue, setTmpEditValue] = useState<string>('')
  const [, drag] = useDrag(() => ({
    type: 'ITEM',
    item: { index },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))
  const handleSetMultipleClassSuccess = (data: Classes): void => {
    setMultipleClass(data.setMultipleClass)
    setIsIndicatorLoading(false)
  }
  const setMultipleClassesResult = useSetMultipleClasses(
    handleSetMultipleClassSuccess
  )
  const confirmEdit = () => {
    const newEditValue = editValue?.current?.value || ''
    if (item?.onEdit?.(item.value?.toString(), newEditValue)) {
      setIsEditing(false)
    }
  }
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >(() => ({
    accept: 'ITEM',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      const clientOffset = monitor.getClientOffset()

      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      if (!(typeof dragIndex === 'undefined') && handleOrderSection) {
        handleOrderSection(dragIndex, hoverIndex)
      }
      // eslint-disable-next-line no-param-reassign
      item = { ...item, index: hoverIndex }
    },
  }))
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (item.label) {
      setTmpEditValue(item.label)
    }
  }, [])
  drag(drop(ref))

  const ToggleGroupItem = styled(
    Item,
    isStandalone ? standaloneCss : comboToggleGroupCss
  )

  const effectiveDropdownModules =
    item.dropdownMenuModules || dropdownMenuModules

  // Rendering dropdown menu items
  const renderMenuItems = useMemo<DropDownMenuItemType[]>(() => {
    return (effectiveDropdownModules || [])
      ?.map(dropdownItem => {
        if (dropdownItem === ToggleGroupDropdownMenuModules.EDIT) {
          return {
            type: 'item',
            content: (
              <>
                <SvgIcon css={{ marginRight: '1rem' }}>
                  <EditIcon />
                </SvgIcon>
                <Text>{t(`teachingService:dropDownMenu.edit${type}`)}</Text>
              </>
            ),
            onClick: () => {
              setIsEditing(true)
            },
          }
          // renderMenuItems.push({
          //   type: 'separator',
          // })
        }
        if (dropdownItem === ToggleGroupDropdownMenuModules.DUPLICATE) {
          return {
            type: 'item',
            content: (
              <>
                <SvgIcon css={{ marginRight: '1rem' }}>
                  <CopyIcon />
                </SvgIcon>
                <Text>{t(`teachingService:dropDownMenu.copy${type}`)}</Text>
              </>
            ),
            onClick: () => {
              if (item.onDuplicate) {
                item?.onDuplicate?.(item.value?.toString())
              }
            },
          }
          // renderMenuItems.push({
          //   type: 'separator',
          // })
        }
        if (dropdownItem === ToggleGroupDropdownMenuModules.MULTIPLE_CLASS) {
          return {
            type: 'item',
            content: (
              <>
                <SvgIcon css={{ marginRight: '1rem' }}>
                  {multipleClass ? <UndoIcon /> : <MdGroupWork />}
                </SvgIcon>
                <Text>
                  {multipleClass
                    ? t('teachingService:dropDownMenu.removeMultipleClass')
                    : t('teachingService:dropDownMenu.multipleClass')}
                </Text>
              </>
            ),
            onClick: async () => {
              setIsIndicatorLoading(true)
              await setMultipleClassesResult.mutateAsync({
                classId: Number(item.value),
              })
            },
          }
          // renderMenuItems.push({
          //   type: 'separator',
          // })
        }
        if (dropdownItem === ToggleGroupDropdownMenuModules.ARCHIVE) {
          return {
            type: 'item',
            content: (
              <>
                <SvgIcon
                  css={{ marginRight: '1rem', color: 'var(--colors-primary)' }}
                >
                  <ArchiveIcon />
                </SvgIcon>
                <Text>{t(`teachingService:dropDownMenu.archive${type}`)}</Text>
              </>
            ),
            onClick: () => {
              if (item.onArchive) {
                item?.onArchive?.(item.value?.toString())
              }
            },
          }
        }
        if (dropdownItem === ToggleGroupDropdownMenuModules.UNARCHIVE) {
          return {
            type: 'item',
            content: (
              <>
                <SvgIcon
                  css={{ marginRight: '1rem', color: 'var(--colors-primary)' }}
                >
                  <UndoIcon />
                </SvgIcon>

                <Text>
                  {t(`teachingService:dropDownMenu.unarchive${type}`)}
                </Text>
              </>
            ),
            onClick: () => {
              if (item.onUnarchive) {
                item?.onUnarchive?.(item.value?.toString())
              }
            },
          }
        }
        if (dropdownItem === ToggleGroupDropdownMenuModules.DELETE) {
          return {
            type: 'item',
            content: (
              <>
                <SvgIcon
                  css={{
                    marginRight: '1rem',
                  }}
                >
                  <DeleteIcon fill="var(--colors-warn)" />
                </SvgIcon>
                <Text>{t(`teachingService:dropDownMenu.delete${type}`)}</Text>
              </>
            ),
            onClick: () => {
              if (item.onDelete) {
                item?.onDelete?.(item.value?.toString())
              }
            },
          }
        }
        return undefined
      })
      .filter(Boolean) as DropDownMenuItemType[]
  }, [dropdownMenuModules, item, t])

  return (
    <Box ref={isDraggable ? ref : null} data-handler-id={handlerId}>
      {item.isDirty && (
        <div
          className="absolute top-[0.5rem] right-[0.5rem] w-2 h-2 rounded-full bg-primary"
          data-testid="dirty-indicator"
        />
      )}
      <ToggleGroupItem
        key={item.label}
        value={item.value?.toString()}
        aria-label={item.value?.toString()}
        aria-placeholder={item.label}
        status={item.status as ComponentProps<typeof ToggleGroupItem>['status']}
        data-testid={dataTestId}
        onClick={() => {
          if (!isEditing) {
            onChange({ value: item.value, label: item.label })
          }
        }}
        css={{
          justifyContent: item.actionButton ? 'space-between' : 'center',
          minHeight: item.icon ? '$16' : undefined,
        }}
      >
        {isEditing ? (
          <>
            <RawInput
              ref={editValue}
              placeholder={item.label}
              defaultValue={item.label}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  confirmEdit()
                }
              }}
            />

            <FaCheck
              onClick={() => {
                confirmEdit()
              }}
            />
          </>
        ) : (
          <>
            {isDraggable && <MdDragIndicator />}

            <Box
              direction="col"
              align="start"
              gap="2"
              className="w-full min-w-0"
            >
              {item.icon && (
                <span className="flex-shrink-0 flex items-center">
                  {item.icon}
                </span>
              )}
              <div
                ref={textRef}
                className={cn(
                  'text-left w-full whitespace-normal overflow-hidden overflow-wrap-break-word text-ellipsis'
                )}
                role="presentation"
                data-testid="toggle-group-item-label"
                aria-label={item.label}
              >
                {item.label}
              </div>
            </Box>

            {isDuplicating && <Spinner />}
            {isIndicatorLoading && (
              <SvgIcon
                css={{ animation: `${loadingSpinner} 1s linear infinite` }}
              >
                <FaSpinner />
              </SvgIcon>
            )}
            {multipleClass && (
              <SvgIcon>
                <MdGroupWork />
              </SvgIcon>
            )}
            {dropIn && (
              <SvgIcon>
                <RiInsertColumnLeft />
              </SvgIcon>
            )}
            {item.actionButton &&
              effectiveDropdownModules &&
              effectiveDropdownModules.length > 0 && (
                <DropdownMenu
                  menuItems={renderMenuItems}
                  contentProps={{ minWidth: '16rem', zIndex: 999 }}
                />
              )}
          </>
        )}
      </ToggleGroupItem>
    </Box>
  )
}

export default ToggleGroupItemComponent
