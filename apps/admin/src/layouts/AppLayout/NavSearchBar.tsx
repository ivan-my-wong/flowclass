import { FocusEventHandler, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import keyboardjs from 'keyboardjs'

import { SimpleSelectorItemProps } from '@/components/Selector/Select'

import Button from '../../components/Buttons/Button'
import ScrollArea from '../../components/Containers/ScrollArea'
import { TextInput } from '../../components/Inputs/TextInput'
import Kbd from '../../components/Texts/Kbd'
import Text from '../../components/Texts/Text'

const SEARCHABLE_PATH = {}
const PATH_OPTIONS = Object.entries(
  SEARCHABLE_PATH
).map<SimpleSelectorItemProps>(([key, path]) => ({
  label: key,
  value: path as string,
}))

const getFilteredOption = (
  options: SimpleSelectorItemProps[],
  targetValue: string
) => {
  const searchValue = targetValue.toLowerCase()
  return options.filter(
    option =>
      option.label.toLowerCase().includes(searchValue) ||
      option.value?.toString().toLowerCase().includes(searchValue)
  )
}

export type SearchOptionItemProps = SimpleSelectorItemProps & {
  onSelect: (args: SearchOptionItemProps['value']) => void
}

const SearchOptionItem: React.FC<SearchOptionItemProps> = ({
  label,
  value,
  onSelect,
}) => {
  return (
    <li>
      <Button
        variant="ghost"
        onClick={e => {
          e.stopPropagation()
          onSelect(value)
        }}
        className="w-full text-left p-1"
      >
        {label}
      </Button>
    </li>
  )
}

const NavSearchBar: React.FC = () => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filteredOptions, setFilteredOptions] = useState<
    SimpleSelectorItemProps[]
  >([])
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)

  keyboardjs.bind('ctrl + k', e => {
    e?.preventDefault()
    inputRef.current?.focus()
  })

  useEffect(() => {
    const newFilteredOptions = getFilteredOption(PATH_OPTIONS, searchValue)
    setFilteredOptions(newFilteredOptions)
  }, [searchValue])

  const handleFocus: FocusEventHandler = () => {
    setIsSelectOpen(true)
  }

  const handleBlur: FocusEventHandler<HTMLDivElement> = e => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setSearchValue('')
      setIsSelectOpen(false)
    }
  }

  const handleSelect = async (newPath: string | number) => {
    setIsSelectOpen(false)
    setSearchValue('')
    navigate(newPath.toString())
  }

  return (
    <div onBlur={handleBlur}>
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <Kbd>ctrl</Kbd>
        <Kbd>K</Kbd>
      </div>
      <TextInput
        ref={inputRef}
        value={searchValue}
        onChange={(e: any) => setSearchValue(e.target.value)}
        onFocus={handleFocus}
        className="w-[200px]"
        placeholder="Search Page"
        onKeyDown={e => {
          if (e.key === 'Escape') {
            inputRef.current?.blur()
          }
        }}
      />

      {isSelectOpen && (
        <div className="w-[200px] absolute origin-top-center rounded-md bg-background shadow-[0_0_10px_var(--shadow)] p-1">
          <Kbd className="absolute top-4 right-4">Tab</Kbd>
          <ScrollArea>
            {filteredOptions.length > 0 ? (
              <ul role="listbox" className="list-none p-1 m-0">
                {filteredOptions.map(opt => (
                  <SearchOptionItem
                    key={opt.label}
                    {...opt}
                    onSelect={handleSelect}
                  />
                ))}
              </ul>
            ) : (
              <Text className="text-center p-2">No Result</Text>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

export default NavSearchBar
