import { useState } from 'react'

import * as Collapsible from '@radix-ui/react-collapsible'
import { LucideChevronDown, LucideChevronUp } from 'lucide-react'

import IconButton from '../Buttons/IconButton'

export type CollapsibleProps = {
  title: JSX.Element | string
  visibleChildren?: JSX.Element[]
  hiddenChildren: JSX.Element[]
  setCollapsibleOpen?: (open: boolean) => void
  collapsibleOpen?: boolean
  rightHeader?: JSX.Element
}
const CollapsibleDemo = ({
  title,
  visibleChildren,
  hiddenChildren,
  rightHeader,
  setCollapsibleOpen,
  collapsibleOpen,
}: CollapsibleProps): React.ReactElement => {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible.Root
      open={collapsibleOpen || open}
      onOpenChange={setCollapsibleOpen || setOpen}
      className="box-col-full"
    >
      <div className="flex w-full cursor-pointer flex-col justify-between md:flex-row">
        <Collapsible.Trigger asChild>
          <div className="box-row-full cursor-pointer justify-start gap-2">
            <IconButton
              icon={collapsibleOpen || open ? <LucideChevronUp /> : <LucideChevronDown />}
            />
            <p className="text-xl font-semibold">{title}</p>
          </div>
        </Collapsible.Trigger>
        {rightHeader}
      </div>

      {visibleChildren}

      <Collapsible.Content className="box-col-full">{hiddenChildren}</Collapsible.Content>
    </Collapsible.Root>
  )
}

export default CollapsibleDemo
