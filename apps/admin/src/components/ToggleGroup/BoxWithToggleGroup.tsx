import React, { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import ArchivedClassesSection from '@/pages/TeachingService/EditCourse/Class/ArchivedClasses'
import { Classes } from '@/types/classes'
import { cn } from '@/utils/cn'

import { Mobile, NotMobile } from '../../hooks/useResponsive'
import CustomAccordion, { AccordionItemProps } from '../Accordions/Accordion'
import IconButton from '../Buttons/IconButton'
import SelectDefault from '../Selector/Select'
import Box from '../ui/Box'

import ToggleGroup, { ToggleGroupLabelsProps } from './ToggleGroup'
import { ToggleGroupDropdownMenuModules } from './ToggleGroupItem'

type BoxWithToggleGroupProps = {
  title: string
  actionButton?: React.ReactNode
  handleActionButtonClick?: (...args: any[]) => any
  toggleGroupLabels: ToggleGroupLabelsProps[]
  currentSection: string
  setCurrentSection: (...args: any[]) => any
  children: React.ReactNode
  handleOrderSection?: (...args: any[]) => any
  isDraggable?: boolean
  isDuplicating?: boolean
  // new dnd kit
  handleDragEnd?: (newData: any[]) => void
  draggable?: boolean
  type?: string
  dropdownMenuModules?: ToggleGroupDropdownMenuModules[]
  mobileMode?: 'select' | 'accordion'
  orderedClasses?: Classes[]
  unarchiveClassResult?: { mutateAsync: (id: number) => Promise<any> }
  className?: string
}

const BoxWithToggleGroup = ({
  title,
  actionButton,
  handleActionButtonClick,
  toggleGroupLabels,
  currentSection,
  setCurrentSection,
  handleOrderSection,
  isDraggable,
  handleDragEnd,
  draggable,
  children,
  isDuplicating,
  type = '',
  dropdownMenuModules,
  mobileMode = 'accordion',
  orderedClasses,
  unarchiveClassResult,
  className,
}: BoxWithToggleGroupProps): React.ReactElement => {
  const { t } = useTranslation()

  const { activeToggleGroupLabels, archivedToggleGroupLabels } = useMemo(() => {
    const activeLabels = toggleGroupLabels.filter(label => {
      const classId = Number(label.value)
      if (Number.isNaN(classId)) return true
      const classObj = orderedClasses?.find(c => c.id === classId)
      return !classObj?.isArchived
    })

    const archivedLabels = toggleGroupLabels
      .filter(label => {
        const classId = Number(label.value)
        const classObj = orderedClasses?.find(c => c.id === classId)
        return classObj?.isArchived
      })
      .map(label => {
        const classId = Number(label.value)
        return {
          ...label,
          onDelete: undefined,
          onUnarchive:
            label.onUnarchive ||
            (unarchiveClassResult
              ? async () => {
                  await unarchiveClassResult.mutateAsync(classId)
                }
              : undefined),
          dropdownMenuModules: [ToggleGroupDropdownMenuModules.UNARCHIVE],
        }
      })

    return {
      activeToggleGroupLabels: activeLabels,
      archivedToggleGroupLabels: archivedLabels,
    }
  }, [toggleGroupLabels, orderedClasses, unarchiveClassResult])

  const tabSelectProps = {
    placeholder: t('component:select.placeholder'),
    selectItems: [
      {
        group: t('component:select.section'),
        itemValues: activeToggleGroupLabels,
      },
    ],
    currentSelect: currentSection,
    onValueChange: (value: string) => {
      setCurrentSection(value)
    },
  }

  const accordionItems: AccordionItemProps[] = [
    {
      itemValue: 'item-1',
      triggerTitle: t('component:select.expand'),
      triggerContent: (
        <ToggleGroup
          currentItem={currentSection}
          onChange={item => {
            setCurrentSection(item.value)
          }}
          handleOrderSection={handleOrderSection}
          items={activeToggleGroupLabels}
          isDraggable={isDraggable}
          isDuplicating={isDuplicating}
          draggable={draggable}
          handleDragEnd={handleDragEnd}
          type={type}
          dropdownMenuModules={dropdownMenuModules}
        />
      ),
    },
  ]

  const archivedAccordionItems: AccordionItemProps[] = [
    {
      itemValue: 'archived-item-1',
      triggerTitle: t('component:select.expand'),
      triggerContent: (
        <ToggleGroup
          currentItem={currentSection}
          onChange={item => {
            setCurrentSection(item.value)
          }}
          handleOrderSection={handleOrderSection}
          items={archivedToggleGroupLabels}
          isDraggable
          isDuplicating={isDuplicating}
          draggable={false}
          handleDragEnd={undefined}
          type={type}
        />
      ),
    },
  ]

  const archivedCount = orderedClasses?.filter(c => c.isArchived).length

  return (
    <div
      className={cn(
        'h-full border border-border rounded-md flex flex-col w-full xl:flex-row items-start',
        className
      )}
    >
      <Box
        className="flex-none w-[100%] xl:!min-w-0 xl:!w-52"
        direction="col"
        id="leftColumn"
      >
        <Box
          justify="between"
          padding="base"
          align="center"
          className="border-b border-b-border"
        >
          <h2>{title}</h2>
          {actionButton &&
            (handleActionButtonClick ? (
              <IconButton
                size="large"
                color="primary"
                plain
                icon={actionButton}
                onClick={handleActionButtonClick}
                data-testid="toggle-group-add-btn"
              />
            ) : (
              actionButton
            ))}
        </Box>

        {/* Active Classes Section */}
        <Box padding="base" className="border-b border-b-border">
          {activeToggleGroupLabels && (
            <>
              <NotMobile>
                <Box direction="col">
                  <ToggleGroup
                    dataTestId="toggle-group-item"
                    currentItem={currentSection}
                    onChange={item => {
                      setCurrentSection(item.value)
                    }}
                    handleOrderSection={handleOrderSection}
                    items={activeToggleGroupLabels}
                    isDraggable={isDraggable}
                    isDuplicating={isDuplicating}
                    draggable={draggable}
                    handleDragEnd={handleDragEnd}
                    type={type}
                    dropdownMenuModules={dropdownMenuModules}
                  />
                </Box>
              </NotMobile>
              <Mobile>
                {mobileMode === 'accordion' && (
                  <CustomAccordion items={accordionItems} />
                )}
                {mobileMode === 'select' && (
                  <SelectDefault
                    fullWidth
                    placeholder={tabSelectProps.placeholder}
                    selectItems={tabSelectProps.selectItems}
                    currentSelect={tabSelectProps.currentSelect}
                    onValueChange={tabSelectProps.onValueChange}
                    draggable={draggable}
                    handleDragEnd={handleDragEnd}
                  />
                )}
              </Mobile>
            </>
          )}
        </Box>

        {/* Archived Classes Section */}
        <ArchivedClassesSection
          archivedCount={archivedCount ?? 0}
          archivedToggleGroupLabels={archivedToggleGroupLabels}
          archivedAccordionItems={archivedAccordionItems}
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          isDuplicating={isDuplicating ?? false}
          type={type}
          mobileMode={mobileMode}
        />
      </Box>

      <Box
        align="start"
        padding="base"
        className="h-full xl:border-l xl:border-l-border min-h-dvh"
      >
        {children}
      </Box>
    </div>
  )
}

export default BoxWithToggleGroup
