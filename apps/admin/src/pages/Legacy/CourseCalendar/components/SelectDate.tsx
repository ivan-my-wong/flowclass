import React, { useEffect, useState } from 'react'

import CalendarIcon from '@/assets/svgs/lessondatetime/calendarIcon'
import SvgIcon from '@/components/Images/SvgIcon'
import Box from '@/components/ui/Box'
import { styled } from '@/styles'

import '@/styles/components/select.css'

interface Props {
  options: {
    label: string
    value: string | undefined
  }[]
  onChange: (value: string | undefined) => void
  defaultValue: string | undefined
  disabled?: boolean
}
const SelectDate = ({
  options,
  defaultValue,
  onChange,
  disabled,
}: Props): JSX.Element => {
  const [selected, setSelected] = useState<string | undefined>(defaultValue)

  useEffect(() => {
    if (disabled) {
      setSelected(defaultValue)
    }
  }, [defaultValue, disabled])
  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value)
    onChange(e.target.value)
  }
  return (
    <Box
      className="bg-background-layer-2 py-2 px-3 rounded-sm"
      justify="between"
    >
      <Select
        disabled={disabled}
        defaultValue={defaultValue}
        style={{ color: '#5C95FF' }}
        onChange={e => handleOnChange(e)}
      >
        {options.map(item => {
          return (
            <Option
              key={item.value}
              value={item.value}
              selected={selected === item.value}
            >
              {item.label}
            </Option>
          )
        })}
      </Select>
      <SvgIcon>
        <CalendarIcon />
      </SvgIcon>
    </Box>
  )
}
const Select = styled('select', {
  padding: '$1 $3',
  border: 'none',
  background: '$backgroundLayer2',
  // color: '$primary',
  fontWeight: 'bold',
  fontSize: '$4',
  // borderRadius: '5px',
  width: '100%',
  textAlign: 'start',
})
const Option = styled('option', {
  color: '$text',
})
export default SelectDate
