import { IoMdArrowDropdown } from 'react-icons/io'

import { Button } from '@/components/ui/Button'

export type StatusMapping = {
  color: string
  text: string
}

const StatusChangeTrigger = ({
  status,
  statusMapping,
}: {
  status: string
  statusMapping: Record<string, StatusMapping>
}) => {
  const currentStatus =
    statusMapping[status] ?? statusMapping[Object.keys(statusMapping)[0]]

  return (
    <Button
      variant="outline"
      role="combobox"
      aria-haspopup="menu"
      className={`min-w-[120px] justify-between ${currentStatus.color}`}
      onClick={e => e.preventDefault()}
    >
      <span className="truncate">{currentStatus.text}</span>
      <IoMdArrowDropdown size={16} className={currentStatus.color} />
    </Button>
  )
}

export default StatusChangeTrigger
