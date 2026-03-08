// eslint-disable-next-line simple-import-sort/imports
import { forwardRef, useMemo, useState } from 'react'

import { HexColorPicker } from 'react-colorful'

import { LuX } from 'react-icons/lu'
import type { ButtonProps } from '@/components/ui/Button'

import { Input } from '@/components/ui/Inputs/Input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { useForwardedRef } from '@/hooks/useForwardedRef'

interface ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  field?: any
  popoverTitle?: string | null
}

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, 'value' | 'onChange' | 'onBlur'> & ColorPickerProps
>(
  (
    { disabled, value, onChange, onBlur, field, popoverTitle = 'Custom' },
    forwardedRef
  ) => {
    const ref = useForwardedRef(forwardedRef)
    const [open, setOpen] = useState(false)
    const DEFAULT_COLOR = '#3b82f6'
    const parsedValue = useMemo(() => {
      return field?.value || value || DEFAULT_COLOR
    }, [field?.value, value])

    const handleChange = (newValue: string) => {
      field?.onChange?.(newValue)
      onChange?.(newValue)
    }

    const isValidHex = (hex: string): boolean => {
      const HEX_COLOR_REGEX = /^[0-9A-Fa-f]{1,6}$/
      return HEX_COLOR_REGEX.test(hex)
    }
    const validateAndResetIfInvalid = () => {
      // Get the current hex value without the # prefix
      const hexValue = parsedValue.replace('#', '').toUpperCase()

      // If hex is invalid or empty, reset to default color
      if (!isValidHex(hexValue) || hexValue.length === 0) {
        handleChange(DEFAULT_COLOR)
      }
    }

    const handleBlur = () => {
      field?.onBlur?.()
      onBlur?.()
      validateAndResetIfInvalid()
    }

    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild disabled={disabled} onBlur={handleBlur}>
          <div
            data-testid="color-picker"
            className="flex items-center gap-1 px-2 py-1.5 w-28 bg-gray-100 rounded hover:border-gray-300"
          >
            <div
              className="h-5 w-5 rounded border"
              style={{
                backgroundColor: parsedValue,
              }}
            />
            <span className="text-sm font-medium text-gray-700">
              {parsedValue.toUpperCase()}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0 rounded-md border border-gray-200">
          <div
            className="custom-layout flex flex-col"
            data-testid="color-picker-popover"
          >
            <div className="flex items-center justify-between p-2">
              <div className="font-bold text-sm text-primary">
                {popoverTitle}
              </div>
              <LuX
                className="cursor-pointer text-primary"
                onClick={() => setOpen(false)}
              />
            </div>
            <HexColorPicker
              color={parsedValue}
              onChange={handleChange}
              className="gap-[10px]"
            />
            <div className="flex items-center justify-center ml-6 gap-1 mt-2 mb-4 border border-gray-200 pl-2 w-24 rounded-md">
              <span className="text-primary">#</span>
              <Input
                maxLength={6}
                className="h-8 border-none p-0"
                onChange={e => {
                  const value = e?.currentTarget?.value.toUpperCase()
                  handleChange(`#${value}`)
                }}
                onBlur={validateAndResetIfInvalid}
                ref={ref}
                value={parsedValue.replace('#', '').toUpperCase()}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
)
ColorPicker.displayName = 'ColorPicker'

export { ColorPicker }
