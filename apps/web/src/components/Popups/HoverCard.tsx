import { Dispatch, SetStateAction } from 'react'

import * as HoverCard from '@radix-ui/react-hover-card'
import { FiMoreHorizontal } from 'react-icons/fi'

type HoverDataCardProps = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  content: JSX.Element | string
  trigger?: JSX.Element
}

const HoverDataCard = ({ open, setOpen, content, trigger }: HoverDataCardProps): JSX.Element => (
  <HoverCard.Root open={open}>
    <HoverCard.Trigger
      asChild
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={e => {
        e.stopPropagation()
        setOpen(val => !val)
      }}
    >
      {trigger ?? (
        <div>
          <FiMoreHorizontal />
        </div>
      )}
    </HoverCard.Trigger>
    <HoverCard.Portal>
      <HoverCard.Content
        className="data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade bg-background z-[9999] w-[300px] rounded-md p-5 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:transition-all"
        sideOffset={5}
      >
        <div className="flex flex-col gap-[7px]">{content}</div>

        <HoverCard.Arrow className="fill-white" />
      </HoverCard.Content>
    </HoverCard.Portal>
  </HoverCard.Root>
)

export default HoverDataCard
