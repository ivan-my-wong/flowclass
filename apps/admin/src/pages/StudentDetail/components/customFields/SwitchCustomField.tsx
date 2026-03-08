import { useEffect, useState } from 'react'

import { Root, Thumb } from '@radix-ui/react-switch'
import { FieldValues, UseFormSetValue } from 'react-hook-form'

type Props = {
  label?: string
  labelAfter?: string
  name: string
  setValue: UseFormSetValue<FieldValues>
}

const SwitchCustomField = ({
  label,
  labelAfter,
  name,
  setValue,
}: Props): JSX.Element => {
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    setValue(name, false)
  }, [])

  const onCheckedChange = () => {
    setValue(name, !checked)
    setChecked(!checked)
  }
  return (
    <div className="flex items-center justify-center">
      {label && <p className="input-label">{label}</p>}
      <Root
        className="bg-backgroundLayer3 focus:shadow-shadowColor data-[state=checked]:bg-primary relative h-[25px] w-[42px] cursor-default rounded-full shadow-sm outline-none focus:shadow-[0_0_0_2px]"
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <Thumb className="bg-background shadow-shadowColor block h-[21px] w-[21px] translate-x-0.5 rounded-full shadow-[0_2px_2px] transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
      </Root>

      {labelAfter && <p className="input-label">{labelAfter}</p>}
    </div>
  )
}

export default SwitchCustomField
