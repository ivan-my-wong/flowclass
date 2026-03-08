import SkeletonLoader from '../Loaders/SkeletonLoader'

const FilterSelectorContainer = ({
  children,
  isLoading,
}: {
  children: JSX.Element | JSX.Element[]
  isLoading?: boolean
}): React.ReactElement => (
  <>
    {isLoading ? (
      <>
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonLoader
            key={index}
            width="100%"
            height="36px"
            boxCSS={{
              direction: 'column',
              align: 'flex-start',
              gap: 'medium',
            }}
          />
        ))}
      </>
    ) : (
      children
    )}
  </>
)
export default FilterSelectorContainer
