import React from 'react'

import { DropDownMenuItemType } from '@/components/DropDownMenus/DropDownMenu'

type ItemProps = {
  text: string
  icon: string | React.ReactNode
  onClick?: () => void
  disabled?: boolean
  tooltip?: string
}
const MenuItem = ({
  icon,
  onClick,
  text,
  disabled,
  tooltip,
}: ItemProps): DropDownMenuItemType => {
  return {
    type: 'item',
    disabled,
    content: (
      <div className="flex flex-row items-center gap-2">
        <div>{icon}</div>
        <span>{text}</span>
      </div>
    ),
    onClick,
    tooltip,
  }
}
export default MenuItem
