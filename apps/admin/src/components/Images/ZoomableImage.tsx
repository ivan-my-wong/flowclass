import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaSearchMinus, FaSearchPlus } from 'react-icons/fa'

import ImageAspect from '@/components/Images/ImageAspect'
import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import { cn } from '@/utils/cn'

const ZOOM_MIN = 0.5
const ZOOM_MAX = 3
const ZOOM_STEP = 0.25

export type ZoomableImageProps = {
  src: string
  alt: string
  s3?: 'public' | 'private'
  /** Width for the thumbnail. Default `'100%'` */
  width?: string
  /** Object fit for both thumbnail and modal. Default `'contain'` */
  objectFit?: 'cover' | 'fill' | 'contain'
  /** aria-label for zoom in button. Default `'Zoom in'` */
  zoomInAriaLabel?: string
  /** aria-label for zoom out button. Default `'Zoom out'` */
  zoomOutAriaLabel?: string
  className?: string
}

/**
 * An image that shows a hover overlay with a zoom icon. On click, opens a
 * near full-screen modal with zoom in/out controls. Works on mobile (tap to
 * open/close, tap zoom buttons). When `src` is empty, renders a non-interactive
 * image only.
 */
const ZoomableImage = ({
  src,
  alt,
  s3,
  width = '100%',
  objectFit = 'contain',
  zoomInAriaLabel = 'Zoom in',
  zoomOutAriaLabel = 'Zoom out',
  className,
}: ZoomableImageProps): JSX.Element => {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const [imageZoom, setImageZoom] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo(0, 0)
      })
    }
  }, [isOpen])

  const resolvedS3 = src?.startsWith('data:image') ? undefined : s3

  if (!src) {
    return (
      <ImageAspect
        s3={resolvedS3}
        src={src}
        width={width}
        alt={alt}
        objectFit={objectFit}
      />
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setImageZoom(1)
          setIsOpen(true)
        }}
        className={cn(
          'relative cursor-pointer group block w-full overflow-hidden rounded-lg transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          className
        )}
      >
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden
        >
          <FaSearchPlus
            className="h-12 w-12 text-white drop-shadow-lg"
            aria-hidden
          />
        </div>
        <ImageAspect
          s3={resolvedS3}
          src={src}
          width={width}
          alt={alt}
          objectFit={objectFit}
        />
      </button>

      <ModalDialog
        open={isOpen}
        onOpenChange={open => {
          setIsOpen(open)
          if (!open) setImageZoom(1)
        }}
        title={t('action.viewImageInDetail')}
        className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        classBody="!space-y-0 !p-0 flex-1 min-h-0 overflow-hidden flex flex-col"
      >
        <div className="flex items-center gap-2 pb-4 px-4 border-b border-border shrink-0 justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setImageZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
            disabled={imageZoom <= ZOOM_MIN}
            className="min-h-[44px] min-w-[44px] shrink-0"
            aria-label={zoomOutAriaLabel}
          >
            <FaSearchMinus className="h-5 w-5" />
          </Button>
          <span className="text-sm w-14 text-center tabular-nums shrink-0">
            {Math.round(imageZoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setImageZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
            disabled={imageZoom >= ZOOM_MAX}
            className="min-h-[44px] min-w-[44px] shrink-0"
            aria-label={zoomInAriaLabel}
          >
            <FaSearchPlus className="h-5 w-5" />
          </Button>
        </div>
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-auto flex items-start justify-start p-4"
        >
          <div
            className="flex-shrink-0"
            style={{
              width: `${100 * imageZoom}%`,
            }}
          >
            <ImageAspect
              s3={resolvedS3}
              src={src}
              width="100%"
              alt={alt}
              objectFit={objectFit}
            />
          </div>
        </div>
      </ModalDialog>
    </>
  )
}

export default ZoomableImage
