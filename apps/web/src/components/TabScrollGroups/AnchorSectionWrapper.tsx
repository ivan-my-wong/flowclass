import { useInView } from 'react-intersection-observer'

interface ScrollSectionProps {
  anchorName: string
  children: React.ReactNode
  rootMargin?: string
  onChange: (...props: any) => any
  initialInView?: boolean
  scrollRefs: React.MutableRefObject<Record<string, HTMLDivElement>>
  // handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const AnchorSectionWrapper = ({
  anchorName,
  children,
  rootMargin,
  initialInView = false,
  scrollRefs,
  onChange,
}: ScrollSectionProps): JSX.Element => {
  const onViewChange = (): void => {
    if (inViewRef) {
      onChange(anchorName)
    }
  }

  const [ref, inViewRef] = useInView({
    threshold: 0,
    onChange: onViewChange,
    rootMargin,
    initialInView,
  })
  return (
    <div
      id={anchorName}
      className="box-col"
      ref={el => {
        scrollRefs.current[anchorName] = el ?? HTMLDivElement.prototype
        ref(el)
      }}
    >
      {children}
    </div>
  )
}

export default AnchorSectionWrapper
