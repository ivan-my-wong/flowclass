import { createElement } from 'react'

type HeadingFontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
type HeadingAs = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'

type HeadingProps = {
  id?: string
  children?: React.ReactNode
  as?: HeadingAs
  lineHeight?: `${number}`
  fontSize?: HeadingFontSize
  align?: 'left' | 'center' | 'right'
  className?: string
  onClick?: () => void
} & Partial<typeof HTMLHeadingElement>

const Heading = ({
  id,
  children,
  as = 'p',
  lineHeight = '6',
  align,
  className,
  fontSize = 'base',
  ...props
}: HeadingProps) => {
  const HeadingTag = createElement(
    as,
    {
      className: `mx-auto my-2 w-full p-0 leading-${lineHeight} text-${align} font-bold ${className} text-${fontSize}`,
      id: id ?? 'heading',
      ...props,
    },
    children
  )
  return HeadingTag
}
export default Heading
