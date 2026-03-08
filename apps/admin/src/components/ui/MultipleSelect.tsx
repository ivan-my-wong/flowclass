import {
  ComponentPropsWithoutRef,
  MutableRefObject,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useClickAway } from '@uidotdev/usehooks'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { LuCheck, LuChevronDown, LuX } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './Command'

type OptionType = { label: string | null; value: string | number }

type GroupOptions = {
  label: string
  options: OptionType[]
}

type PropType = {
  isGroup?: boolean
  options: OptionType[] | GroupOptions[]
  value?: OptionType[]
  placeholder?: string | null
  searchPlaceholder?: string | null
  onChangeValue?: (values: OptionType[]) => void
} & ComponentPropsWithoutRef<'div'>
const MultiSelect = ({
  isGroup = false,
  options,
  className,
  placeholder,
  searchPlaceholder,
  value,
  onChangeValue,
}: PropType): JSX.Element => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const refDropdown: MutableRefObject<HTMLDivElement> = useClickAway(() => {
    setIsOpen(false)
  })
  const ref = useRef<HTMLButtonElement | null>(null)

  const toggleDropdown = () => setIsOpen(!isOpen)

  const handleSelectOption = (option: OptionType) => {
    if (!value || !onChangeValue) return
    const itemExist = value?.find(opt => opt.value === option.value)
    if (itemExist) {
      onChangeValue(value.filter(val => val.value !== itemExist.value))
    } else {
      onChangeValue([...value, option])
    }
  }

  const dropdownContentStyle = useMemo(() => {
    const { offsetWidth, clientLeft, clientTop } = ref?.current || {
      offsetWidth: 0,
      clientTop: 0,
      clientLeft: 0,
    }
    return {
      width: `${offsetWidth}px`,
      transform: `translate(${clientLeft}px, ${clientTop}px)`,
    }
  }, [ref?.current])

  const handleRemove = (event: any, data: OptionType) => {
    event.preventDefault()
    if (!onChangeValue || !value) return
    onChangeValue(value?.filter(d => d.value !== data.value))
  }

  return (
    <div className={clsx(['relative w-full', className])}>
      <button
        onClick={toggleDropdown}
        type="button"
        ref={ref}
        className="flex items-center justify-between p-2 border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded cursor-pointer w-full"
      >
        <span className="flex flex-wrap line-clamp-2 gap-1 w-11/12 text-sm max-h-20 overflow-y-auto">
          {value && value.length > 0
            ? value.map(data => (
                <Badge key={`${data.label}-${data.value}`}>
                  {data.label}
                  <LuX
                    className="ml-2 cursor-pointer"
                    onClick={event => handleRemove(event, data)}
                  />
                </Badge>
              ))
            : placeholder}
        </span>
        <LuChevronDown className="text-gray-500 w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="fixed z-popover w-full mt-1 bg-white border border-gray-300 rounded shadow max-h-40 overflow-y-auto"
          style={dropdownContentStyle}
          ref={refDropdown}
        >
          {isGroup && (
            <Command>
              <CommandInput
                placeholder={
                  searchPlaceholder || t('common:action.search').toString()
                }
              />
              <CommandList>
                <CommandEmpty>No timezone found.</CommandEmpty>
                {(options as GroupOptions[]).map(group => (
                  <CommandGroup key={group.label} heading={group.label}>
                    {group.options.map(option => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          handleSelectOption(option)
                        }}
                      >
                        <LuCheck
                          className={cn(
                            'mr-2 h-4 w-4',
                            (value || [])
                              .map(value => value.value)
                              .includes(option.value)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          )}
          {!isGroup &&
            (options as OptionType[]).map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectOption(option)}
                className="w-full flex gap-x-2 items-center px-2 py-3 cursor-pointer hover:bg-gray-100 text-sm"
              >
                {(value || []).map(d => d.value).includes(option.value) ? (
                  <LuCheck className="ml-2 text-gray-700 w-4" />
                ) : (
                  <span className="w-6" />
                )}
                <span>{option.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

export default MultiSelect
