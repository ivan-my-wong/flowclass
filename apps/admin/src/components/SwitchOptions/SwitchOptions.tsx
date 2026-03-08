import { useState } from 'react'

type SwitchOptionsProps = {
  options: { label: string; value: string }[]
  onChange?: (value: string) => void
  width: number
}

const SwitchOptions = ({
  options,
  width,
  onChange,
}: SwitchOptionsProps): JSX.Element => {
  const [activeIndex, setActiveIndex] = useState(0)
  const optionCount = options.length

  const handleSelect = (index: number, value: string) => {
    setActiveIndex(index)
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <div
      className="relative grid text-sm h-10 bg-gray-100 rounded-lg p-[2px]"
      style={{
        width: `${width}px`,
        gridTemplateColumns: `repeat(${optionCount}, 1fr)`,
      }}
    >
      {/* highlight */}
      <div
        className="absolute top-[2px] bottom-[2px] bg-white rounded-md shadow transition-all duration-300"
        style={{
          width: `calc(${100 / optionCount}% - 4px)`,
          left: `calc(${(100 / optionCount) * activeIndex}% + 2px)`,
        }}
      />

      {/* options */}
      {options.map((opt, idx) => (
        <button
          key={opt.value}
          className={`flex items-center justify-center font-medium relative z-10 cursor-pointer ${
            activeIndex === idx ? 'text-black' : 'text-gray-400'
          }`}
          type="button"
          onClick={() => handleSelect(idx, opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default SwitchOptions
