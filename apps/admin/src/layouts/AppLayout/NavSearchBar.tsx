import { FocusEventHandler, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import keyboardjs from 'keyboardjs'

import { SimpleSelectorItemProps } from '@/components/Selector/Select'

import Button from '../../components/Buttons/Button'
import ScrollArea from '../../components/Containers/ScrollArea'
import { TextInput } from '../../components/Inputs/TextInput'
import Kbd from '../../components/Texts/Kbd'
import Text from '../../components/Texts/Text'
import { styled } from '../../styles'

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

const SelectOptionListWrapper = styled('div', {
  width: '200px',
  position: 'absolute',
  transformOrigin: 'top center',
  borderRadius: '$medium',
  backgroundColor: '$background',
  boxShadow: '0 0 10px $colors$shadowColor',
  padding: '$min',
})

const SelectOptionList = styled('ul', {
  listStyle: 'none',
  padding: '$min',
  margin: 0,
})

const SearchOptionItem: React.FC<SearchOptionItemProps> = ({
  label,
  value,
  onSelect,
}) => {
  return (
    <li>
      <Button
        variants="text"
        onClick={e => {
          e.stopPropagation()
          onSelect(value)
        }}
        css={{ width: '100%', textAlign: 'left', padding: '$min' }}
      >
        {label}
      </Button>
    </li>
  )
}

const SearchKbdCombo = styled('div', {
  position: 'absolute',
  right: '$small',
  top: '50%',
  transform: 'translate(0, -50%)',
})

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
      <SearchKbdCombo>
        <Kbd>ctrl</Kbd>
        <Kbd>K</Kbd>
      </SearchKbdCombo>
      <TextInput
        ref={inputRef}
        value={searchValue}
        onChange={(e: any) => setSearchValue(e.target.value)}
        onFocus={handleFocus}
        css={{ width: '200px' }}
        placeholder="Search Page"
        onKeyDown={e => {
          if (e.key === 'Escape') {
            inputRef.current?.blur()
          }
        }}
      />

      {isSelectOpen && (
        <SelectOptionListWrapper>
          <Kbd css={{ position: 'absolute', top: '$4', right: '$4' }}>Tab</Kbd>
          <ScrollArea>
            {filteredOptions.length > 0 ? (
              <SelectOptionList role="listbox">
                {filteredOptions.map(opt => (
                  <SearchOptionItem
                    key={opt.label}
                    {...opt}
                    onSelect={handleSelect}
                  />
                ))}
              </SelectOptionList>
            ) : (
              <Text
                css={{
                  textAlign: 'center',
                  padding: '$small',
                }}
              >
                No Result
              </Text>
            )}
          </ScrollArea>
        </SelectOptionListWrapper>
      )}
    </div>
  )
}

export default NavSearchBar
