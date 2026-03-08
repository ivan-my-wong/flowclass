import { cn } from '@/utils/cn'

type Props = {
  icon?: React.ReactNode
  label: string
  className?: string
}
const ClassInfoItem = ({ icon, label, className }: Props): JSX.Element => {
  return (
    <div
      className={cn('flex items-center text-sm gap-1 text-gray-600', className)}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

export default ClassInfoItem
