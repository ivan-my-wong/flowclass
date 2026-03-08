// ArchivedClassesSection.tsx
import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import CustomAccordion, {
  AccordionItemProps,
} from '@/components/Accordions/Accordion'
import CollapsibleWrapper from '@/components/Accordions/Collapsible'
import ToggleGroup, {
  ToggleGroupLabelsProps,
} from '@/components/ToggleGroup/ToggleGroup'
import { ToggleGroupDropdownMenuModules } from '@/components/ToggleGroup/ToggleGroupItem'
import Box from '@/components/ui/Box'
import { Mobile, NotMobile } from '@/hooks/useResponsive'

interface ArchivedClassesSectionProps {
  archivedCount: number
  archivedToggleGroupLabels: ToggleGroupLabelsProps[]
  archivedAccordionItems: AccordionItemProps[]
  currentSection: string | number
  setCurrentSection: (value: string | number) => void
  isDuplicating: boolean
  type: string
  mobileMode: 'select' | 'accordion'
}

const ArchivedClassesSection = ({
  archivedCount,
  archivedToggleGroupLabels,
  archivedAccordionItems,
  currentSection,
  setCurrentSection,
  isDuplicating,
  type,
  mobileMode,
}: ArchivedClassesSectionProps): JSX.Element | null => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  if (archivedCount === 0) return null

  const title = t('teachingService:publishCourse.countArchived', {
    count: archivedCount,
  })

  const visibleChildren: JSX.Element[] = []

  const hiddenChildren: JSX.Element[] = []

  if (archivedToggleGroupLabels.length > 0) {
    hiddenChildren.push(
      <Box key="archived-classes-content" direction="col" gap="4">
        <NotMobile key="not-mobile">
          <Box direction="col">
            <ToggleGroup
              dataTestId="archived-toggle-group-item"
              currentItem={String(currentSection)}
              onChange={item => {
                setCurrentSection(item.value)
              }}
              items={archivedToggleGroupLabels}
              isDraggable={false}
              isDuplicating={isDuplicating}
              draggable={false}
              type={type}
              dropdownMenuModules={[ToggleGroupDropdownMenuModules.UNARCHIVE]}
            />
          </Box>
        </NotMobile>
        <Mobile key="mobile">
          {mobileMode === 'accordion' && (
            <CustomAccordion items={archivedAccordionItems} />
          )}
        </Mobile>
      </Box>
    )
  }

  return (
    <Box padding="base">
      <Box direction="col" gap="4">
        <div className="w-full">
          <CollapsibleWrapper
            title={title}
            visibleChildren={visibleChildren}
            hiddenChildren={hiddenChildren}
            collapsibleOpen={isOpen}
            setCollapsibleOpen={setIsOpen}
          />
        </div>
      </Box>
    </Box>
  )
}

export default ArchivedClassesSection
