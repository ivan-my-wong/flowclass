import { cn } from '@/utils/cn'

type SpinnerProps = {
  size?: 'small'
  className?: string
}

const Spinner = ({ size, className }: SpinnerProps) => (
  <div
    className={cn(
      'rounded-full w-16 h-16 my-8 mx-auto text-[10px] relative',
      'border-[5px] border-[rgba(217,217,217,0.2)] border-l-[#d9d9d9]',
      'animate-spin',
      size === 'small' && 'w-8 h-8 text-base -my-1',
      className
    )}
  />
)

const Spinner2 = ({ className }: { className?: string }) => (
  <svg
    className={cn(
      'animate-spin z-[2] absolute top-1/2 left-1/2 -mt-4 -ml-4 w-6 h-6',
      '[&_.path]:stroke-[hsl(210,70%,75%)] [&_.path]:stroke-linecap-round [&_.path]:animate-dash',
      className
    )}
    viewBox="0 0 50 50"
  >
    <circle
      className="path"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      strokeWidth="5"
    />
  </svg>
)

export { Spinner, Spinner2 }
