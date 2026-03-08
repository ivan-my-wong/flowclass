import { useTranslation } from 'react-i18next'

type MenuItemProps = {
  activeSection: string
  setActiveSection: (section: string) => void
  title: string
}

const MenuItem = (props: MenuItemProps) => {
  const { activeSection, setActiveSection, title } = props
  const { t } = useTranslation()
  return (
    <a
      href={`#${title}`}
      id={title}
      className={`px-4 py-2 font-medium ${
        activeSection === title || activeSection === ''
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600'
      }`}
      onClick={e => {
        e.preventDefault()
        setActiveSection(title)
        document.getElementById(title)?.scrollIntoView({ behavior: 'smooth' })
      }}
    >
      {t(`availability:${title}`)}
    </a>
  )
}

export default MenuItem
