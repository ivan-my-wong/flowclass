import { useEffect, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { BsCircleFill } from 'react-icons/bs'
import { CgColorPicker } from 'react-icons/cg'

import { validateColor } from '../../utils/validate'
import Box from '../Containters/Box'

import TextInput from './TextInput'

export type ColorPickerProps = {
  label?: string
  id?: string
  defaultColor: string
  handleChange: (color: string) => any
}

const ColorPicker = ({ label, id, defaultColor, handleChange }: ColorPickerProps) => {
  const [color, setColor] = useState(defaultColor)

  const [colorInput, setColorInput] = useState(defaultColor)
  const [colorError, setColorError] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setColor(defaultColor)
    setColorInput(defaultColor)
    // reset({ color: defaultColor })
  }, [defaultColor])

  return (
    <Box direction="col">
      <div className="flex-row justify-start">
        <p className="input-label">{label}</p>
      </div>
      <Box align="center">
        <div style={{ color }}>
          <BsCircleFill size="1.5rem" />
        </div>

        <label htmlFor={id}>
          <CgColorPicker size="1.5rem" />
          <input
            type="color"
            id={id}
            name={id}
            value={color}
            style={{
              width: 0,
              height: 0,
              display: 'block',
              visibility: 'hidden',
            }}
            onChange={e => {
              e.preventDefault()
              e.stopPropagation()
              setColor(e.target.value)
              handleChange(e.target.value)
            }}
          />
        </label>
        <TextInput
          placeholder={colorInput}
          value={colorInput}
          type="text"
          vertical
          isError={colorError}
          maxLength={7}
          helperText={colorError ? (t('component:colorPicker.error') as string) : ''}
          onChange={(e: any) => {
            const newColor = e.target.value
            setColorInput(newColor)
            if (!validateColor(newColor)) {
              setColorError(true)
            } else {
              setColorError(false)
              setColor(newColor)
              handleChange(newColor)
            }
          }}
        />
      </Box>
    </Box>
  )
}

export default ColorPicker
