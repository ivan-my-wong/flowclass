import { ComponentProps } from 'react'

import { Button } from '@/components/ui/Button'

import { Spinner } from '../Loaders/Spinner'

type LoadingButtonProps = {
  isLoading: boolean
} & ComponentProps<typeof Button>

const LoadingButton = ({
  isLoading,
  children,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button {...props}>
      {isLoading ? <Spinner size="small" /> : children}
    </Button>
  )
}

export default LoadingButton
