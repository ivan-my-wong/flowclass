import { IoMdAlert } from 'react-icons/io'

const AlertBlock = ({
  icon,
  message,
  className,
  'data-testid': dataTestId,
}: {
  icon?: JSX.Element
  message: string
  className?: string
  ['data-testid']?: string
}): JSX.Element => {
  return (
    <div className={`box-row rounded border ${className}`}>
      {icon ? icon : <IoMdAlert className="text-warn" />}

      <p data-testid={dataTestId}>{message}</p>
    </div>
  )
}

export default AlertBlock
