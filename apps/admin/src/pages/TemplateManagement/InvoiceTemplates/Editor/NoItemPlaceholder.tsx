import type { FC, ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: ReactNode
  description: ReactNode
}
const NoItemPlaceholder: FC<Props> = ({
  icon,
  title = 'No item selected',
  description = 'Select item to view details',
}): JSX.Element => {
  return (
    <div className="flex flex-col items-center py-8 text-gray-500">
      {icon}
      <div>{title}</div>
      <div className="text-sm mt-1">{description}</div>
    </div>
  )
}

export default NoItemPlaceholder
