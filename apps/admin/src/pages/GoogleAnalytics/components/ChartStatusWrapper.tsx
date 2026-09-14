import SkeletonLoader from '../../../components/Loaders/SkeletonLoader'
import { styled } from '../../../styles'

type ChartStatusWrapperProps = {
  isLoading: boolean
  isError: boolean
  children: React.ReactNode
}

const ChartStatusWrapper = ({
  children,
  isLoading,
  isError,
}: ChartStatusWrapperProps): JSX.Element => {
  if (isLoading) {
    return (
      <ShortCardBox>
        <SkeletonLoader width="33%" height="3rem" />
      </ShortCardBox>
    )
  }

  if (isError) {
    return <></>
  }

  return (
    <CardBox>
      {/* {isError && <div>{t(`component:googleAnalytics.tryAgainLater`)}</div>} */}
      {isLoading && <SkeletonLoader height="22rem" />}
      {children}
    </CardBox>
  )
}

export default ChartStatusWrapper

const CardBox = styled('div', {
  borderRadius: '0.5rem',
  padding: '1rem 1rem 5rem 1rem',
  color: '$text',
  border: '0.2rem solid $backgroundLayer2',
  height: '25rem',
  width: `calc((100% - 2rem) / 3)`,
  '@lg': {
    width: `calc((100% - 1rem) / 2)`,
  },
  '@md': {
    width: '100%',
  },
})

const ShortCardBox = styled('div', {
  borderRadius: '0.5rem',
  padding: '1rem 1rem 5rem 1rem',
  color: '$text',
  border: '0.2rem solid $backgroundLayer2',
  height: '3rem',
  width: `calc((100% - 2rem) / 3)`,
  '@lg': {
    width: `calc((100% - 1rem) / 2)`,
  },
  '@md': {
    width: '100%',
  },
})
