import * as React from 'react'

import { LuCheck, LuChevronsUpDown } from 'react-icons/lu'

import { cn } from '@/utils/cn'

import { Button } from './Button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './Command'
import { Popover, PopoverContent, PopoverTrigger } from './Popover'

interface ComboboxProps {
  options: { label: string; value: string }[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  emptyText?: string
}

export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = 'Select option...',
      emptyText = 'No results found.',
    },
    forwardedRef
  ) => {
    const [open, setOpen] = React.useState(false)
    const [selected, setSelected] = React.useState(value || '')
    const divRef = React.useRef<HTMLDivElement>(null)
    const ref = forwardedRef || divRef

    React.useEffect(() => {
      setSelected(value || '')
    }, [value])

    return (
      <div ref={ref} className="w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <span className="truncate">
                {selected
                  ? options.find(option => option.value === selected)?.label
                  : placeholder}
              </span>
              <LuChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder={placeholder} />
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {options.map(option => (
                    <CommandItem
                      key={option.value}
                      value={option.label.trim()}
                      onSelect={currentValue => {
                        const selectedOption = options.find(
                          opt => opt.label.trim() === currentValue
                        )
                        if (selectedOption) {
                          setSelected(selectedOption.value)
                          onValueChange?.(selectedOption.value)
                          setOpen(false)
                        }
                      }}
                      className="flex items-center"
                    >
                      <LuCheck
                        className={cn(
                          'mr-2 h-4 w-4 flex-shrink-0',
                          selected === option.value
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

Combobox.displayName = 'Combobox'
