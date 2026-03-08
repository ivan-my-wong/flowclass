import React from 'react'

import IconButton from '@/components/Buttons/IconButton'
import Heading from '@/components/Texts/Heading'

import ToggleGroup from './ToggleGroup'

type BoxWithToggleGroupProps = {
  title: string
  actionButton?: React.ReactNode
  toggleGroupLabels: ToggleGroupLabelsProps[]
  currentSection: string
  setCurrentSection: (...args: any[]) => any
  children: React.ReactNode
}

export type ToggleGroupLabelsProps = {
  value: string
  label: string
}

const BoxWithToggleGroup = ({
  title,
  actionButton,
  toggleGroupLabels,
  currentSection,
  setCurrentSection,
  children,
}: BoxWithToggleGroupProps) => {
  return (
    <div className="box-responsive border-borderColor border-1 items-start border-solid">
      <div className="lg:border-r-1 flex w-full flex-1 flex-col border-r-0 lg:w-auto">
        <div className="box-row border-b-1 border-borderColor items-center justify-between border-solid p-2">
          <Heading>{title}</Heading>
          {actionButton && <IconButton icon={actionButton} />}
        </div>
        <div className="box-row p-2">
          {toggleGroupLabels && (
            <ToggleGroup
              defaultValue={currentSection}
              onChange={setCurrentSection}
              items={toggleGroupLabels}
            />
          )}
        </div>
      </div>

      <div className="box-row flex-3 lg:border-l-1 border-borderColor border-t-1 h-full min-h-[80vh] items-start border-solid p-4 lg:border-t-0">
        {children}
      </div>
    </div>
  )
}

export default BoxWithToggleGroup
