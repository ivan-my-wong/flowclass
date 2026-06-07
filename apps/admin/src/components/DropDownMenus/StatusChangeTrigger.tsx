import { IoMdArrowDropdown } from 'react-icons/io'

export type StatusMapping = {
  color: string
  text: string
}

/**
 * Renders as a styled `<span>` (not a `<button>`) because Radix's
 * `DropdownMenuTrigger` already wraps this in a `<button>`. Using a Button
 * here would nest `<button>` inside `<button>`, producing invalid HTML and a
 * React `validateDOMNesting` warning.
 */
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
    <span
      role="combobox"
      aria-haspopup="menu"
      className={`min-w-[120px] inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${currentStatus.color}`}
    >
      <span className="truncate">{currentStatus.text}</span>
      <IoMdArrowDropdown size={16} className={currentStatus.color} />
    </span>
  )
}

export default StatusChangeTrigger
