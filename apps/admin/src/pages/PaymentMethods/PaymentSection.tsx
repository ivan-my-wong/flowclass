import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'
import { generateDataTestId } from '@/utils/data-testid.utils'

type PropTypes = {
  title: string
  isCenter?: boolean
  footer?: string | React.ReactNode
  footerAction?: React.ReactNode
  rightAction?: React.ReactNode | null
  additionalAction?: React.ReactNode
} & React.ComponentPropsWithoutRef<'div'>
const PaymentSection = ({
  isCenter,
  title,
  footer,
  footerAction,
  additionalAction,
  rightAction,
  children,
}: PropTypes): React.ReactElement => {
  return (
    <Card
      className={cn({
        'box-col-full bg-background-layer-2 dark:bg-gray-800 rounded-md items-center':
          true,
        'items-start': !isCenter,
      })}
    >
      <div
        className={cn({
          'grid grid-cols-1 md:grid-cols-12 justify-between w-full px-6 pt-4 items-center lg:flex-row gap-y-4 lg:gap-y-0':
            true,
          'items-start': !isCenter,
          'pb-4': !footer || !footerAction,
          'pb-0': footer && footerAction,
        })}
      >
        <div
          className={cn({
            'flex flex-col w-full gap-4': true,
            'col-span-12 lg:col-span-10 justify-center': isCenter,
            'col-span-10 lg:col-span-10': !isCenter || rightAction,
          })}
        >
          <div className="flex items-center gap-4">
            {additionalAction}
            <h2
              className="font-bold md:text-2xl"
              data-testid={generateDataTestId('title', title)}
            >
              {title}
            </h2>
          </div>
          {children}
        </div>
        {rightAction && (
          <div className="col-span-2 md:flex justify-end">{rightAction}</div>
        )}
      </div>
      {footer && footerAction && (
        <div className="flex flex-col lg:flex-row w-full justify-between items-center border-t border-gray-300 mt-4 px-6 py-1">
          <span className="text-sm font-normal text-text-subtle text-center lg:text-left mb-2 lg:mt-0">
            {footer}
          </span>
          {footerAction}
        </div>
      )}
    </Card>
  )
}

export default PaymentSection
