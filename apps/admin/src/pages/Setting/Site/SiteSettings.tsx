import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { IoIosInformationCircle } from 'react-icons/io'
import { MdLanguage } from 'react-icons/md'

import ActionCard from '../../../components/Cards/ActionCard'
import Heading from '../../../components/Texts/Heading'

const items = [
  {
    label: 'setting:menu.languageTimezone',
    icon: <MdLanguage />,
    path: '/contact?tab=regionLanguage',
  },
]

const SiteSetting = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="p-4">
      <Heading size="medium">{t('setting:pageTitle')}</Heading>
      <div className="p-5 border border-border rounded my-5 flex flex-row">
        <div className="mr-5 text-warn">
          <IoIosInformationCircle />
        </div>

        {t('setting:freeAlert')}
        <button
          type="button"
          className="ml-auto float-right text-primary-subtle cursor-pointer bg-transparent border-0 p-0 font-inherit"
          onClick={() => {
            navigate('/subscription')
          }}
        >
          {t('setting:upgrade')}
        </button>
      </div>

      <ActionCard items={items} />
    </div>
  )
}

export default SiteSetting
