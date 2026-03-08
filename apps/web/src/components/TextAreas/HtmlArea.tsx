import { useEffect, useRef } from 'react'

import DOMPurify from 'isomorphic-dompurify'

const HtmlArea = ({ text }: { text: string }): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const resizeIframe = () => {
    const iframes = containerRef.current?.querySelectorAll('iframe')

    if (iframes) {
      iframes.forEach(iframe => {
        const newDiv = document.createElement('div')
        const isDivNodeExist = (iframe.parentNode as Element)?.getAttribute('wraped')
        if (!isDivNodeExist) {
          newDiv.className = 'relative pb-[56.25%] pt-30 h-0 overflow-hidden'
          iframe.className = 'absolute top-0 left-0 w-full h-full'
          iframe.parentNode?.insertBefore(newDiv, iframe)
          newDiv.appendChild(iframe)
          newDiv.setAttribute('wraped', 'true')
        }
      })
    }
  }

  useEffect(() => {
    resizeIframe()
    window.addEventListener('resize', resizeIframe)
    return () => {
      window.removeEventListener('resize', resizeIframe)
    }
  }, [containerRef])
  if (!text) {
    return <></>
  }
  return (
    <div
      ref={containerRef}
      className="prose-preset [&>*]:word-break-all [&>a]:word-break-all w-full max-w-full overflow-hidden [&>*]:max-w-full [&>*]:overflow-hidden [&>*]:break-all [&>a]:overflow-hidden [&>a]:break-all [&>p]:text-left"
      style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(text, {
          ADD_TAGS: ['iframe'],
          ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
        }),
      }}
    />
  )
}

export default HtmlArea
