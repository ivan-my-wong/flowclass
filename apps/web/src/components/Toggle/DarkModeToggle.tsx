import { useRecoilState } from 'recoil'

import { MdDarkMode, MdLightMode } from 'react-icons/md'

import IconButton from '../Buttons/IconButton'

const DarkModeToggle = ({
  iconOnly = false,
  darkModeState = false,
}: {
  iconOnly?: boolean
  darkModeState: any
}) => {
  const [isDarkMode, setDarkMode] = useRecoilState(darkModeState)

  const toggleDarkMode = () => {
    setDarkMode((val: boolean) => !val)
  }

  return (
    <div className="box-row text-textSubtle cursor-pointer select-none" onClick={toggleDarkMode}>
      <IconButton icon={isDarkMode ? <MdLightMode /> : <MdDarkMode />} title="Change color theme" />
      {!iconOnly && (isDarkMode ? 'Light Mode' : 'Dark Mode')}
    </div>
  )
}

export default DarkModeToggle
