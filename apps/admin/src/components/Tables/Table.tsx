import { cn } from '@/utils/cn'

type TableProps = React.ComponentProps<'table'>
type TheadProps = React.ComponentProps<'thead'>
type TrProps = React.ComponentProps<'tr'>
type TdProps = React.ComponentProps<'td'>

export const Table = ({ className, ...props }: TableProps) => (
  <table className={cn('border-collapse w-full', className)} {...props} />
)

export const Thead = (props: TheadProps) => <thead {...props} />

export const TrHead = ({ className, ...props }: TrProps) => (
  <tr
    className={cn(
      'border border-[#ddd] bg-background-layer-3 p-2 h-[50px]',
      className
    )}
    {...props}
  />
)

export const TrBody = ({ className, ...props }: TrProps) => (
  <tr className={cn('border border-[#ddd] h-[50px]', className)} {...props} />
)

export const TdPrepareTable = ({ className, ...props }: TdProps) => (
  <td
    className={cn(
      'border border-[#ddd] p-2 min-w-[70px] leading-[22px]',
      className
    )}
    {...props}
  />
)

export const Td = ({ className, ...props }: TdProps) => (
  <TdPrepareTable
    className={cn('min-w-[170px] text-center', className)}
    {...props}
  />
)
