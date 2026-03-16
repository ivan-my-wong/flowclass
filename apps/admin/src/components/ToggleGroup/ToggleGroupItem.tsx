import { useEffect, useMemo, useRef, useState } from 'react'

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
                <SvgIcon className="mr-4">
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
                <SvgIcon className="mr-4">
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
                <SvgIcon className="mr-4">
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
                <SvgIcon className="mr-4 text-primary">
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
                <SvgIcon className="mr-4 text-primary">
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
                <SvgIcon className="mr-4">
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
      <Item
        key={item.label}
        value={item.value?.toString()}
        aria-label={item.value?.toString()}
        aria-placeholder={item.label}
        data-testid={dataTestId}
        className={cn(
          'cursor-pointer gap-2 bg-background-layer-2 text-text flex items-center justify-center p-2 rounded-sm w-full min-w-32',
          isStandalone
            ? 'h-8 p-2 pl-4 hover:bg-primary-subtle hover:text-text-contrast data-[state=on]:border-[3px] data-[state=on]:border-primary'
            : 'min-h-8 py-2 px-1',
          item.status === 'error' &&
            'border-b-[3px] border-warn hover:text-secondary-subtle',
          item.actionButton ? 'justify-between' : 'justify-center',
          item.icon && 'min-h-16'
        )}
        onClick={() => {
          if (!isEditing) {
            onChange({ value: item.value, label: item.label })
          }
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
              <SvgIcon className="animate-spin">
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
      </Item>
    </Box>
  )
}

export default ToggleGroupItemComponent
