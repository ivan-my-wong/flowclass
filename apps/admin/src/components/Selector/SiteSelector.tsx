import { useRef } from 'react'

import { useTranslation } from 'react-i18next'

import useSiteData from '@/hooks/useSiteData'
import AddSchoolModal, {
  AddSchoolModalHandle,
} from '@/pages/School/CreateSchoolModal'
import { Site } from '@/stores/siteData'

import Text from '../Texts/Text'
import { Combobox } from '../ui/Combobox'

const SiteSelector = () => {
  const { siteData, setCurrentSite } = useSiteData()
  const { t } = useTranslation()
  const addSchoolModalHandle = useRef<AddSchoolModalHandle>(null)

  const openModal = () => {
    addSchoolModalHandle.current?.handleOpenChange?.()
  }

  if (!siteData.sites.length) {
    return (
      <>
        <Text
          css={{ width: '100%' }}
          onClick={(event: React.FormEvent) => {
            openModal()
            event.stopPropagation()
          }}
        >
          {t(`school:addSchoolModalTitle`)}
        </Text>
        <AddSchoolModal ref={addSchoolModalHandle} hidden />
      </>
    )
  }

  const tabSelectProps = {
    placeholder: t('component:select.placeholder'),
    selectItems: [
      {
        group: t('component:select.selectSite'),
        itemValues: [
          ...siteData.sites.map((site: Site) => ({
            label: site.name,
            value: site.id.toString(),
          })),
        ],
      },
      // {
      //   group: t('common:action.create'),
      //   itemValues: [
      //     {
      //       label: t('component:select.addSite'),
      //       value: 'addNewSchool',
      //     },
      //   ],
      // },
    ],
    currentSelect: siteData.currentSite?.id.toString() || '',
    onValueChange: (value: string) => {
      if (value === 'addNewSchool') {
        openModal()
      } else {
        setCurrentSite(value)
      }
    },
  }

  return (
    <div className="w-full max-w-[400px] min-w-[300px] mx-2">
      <Combobox
        placeholder={tabSelectProps.placeholder}
        value={tabSelectProps.currentSelect}
        onValueChange={tabSelectProps.onValueChange}
        options={tabSelectProps.selectItems.flatMap(group => group.itemValues)}
        emptyText="No results found."
      />
      <AddSchoolModal ref={addSchoolModalHandle} hidden />
    </div>
  )
}

export default SiteSelector
