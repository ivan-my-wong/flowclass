import Image from 'next/image'
import { ComponentProps, SyntheticEvent } from 'react'

import imageUrls from '@/constants/imageUrls'
import { validateAbsolutePath, validateHttpsPath } from '@/utils/validate'

import 'react-loading-skeleton/dist/skeleton.css'

type ImageWithFallbackProps = {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  isImageLoading?: boolean
  imgClassName?: string
  onError?: (event: SyntheticEvent<HTMLImageElement, Event>) => void
} & ComponentProps<typeof Image>
const ImageWithFallback = ({
  src = imageUrls.defaultFallback,
  fallbackSrc,
  alt,
  isImageLoading = false,
  className = '',
  imgClassName = 'object-contain',
  onError,
  ...props
}: ImageWithFallbackProps): JSX.Element => {
  // Support changing back to src when src is not provided in the beginning

  const changeToFallback = (args: any): void => {
    if (onError) {
      onError(args as SyntheticEvent<HTMLImageElement, Event>)
    }
  }

  return (
    <div className={`relative shrink-0 ${className}`}>
      {!isImageLoading && !validateHttpsPath(src) && !validateAbsolutePath(src) ? (
        <Image
          src={fallbackSrc ?? imageUrls.defaultFallback}
          alt="fallback"
          fill
          onError={changeToFallback}
          className={imgClassName}
          {...(props as any)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          onError={changeToFallback}
          className={imgClassName}
          {...(props as any)}
        />
      )}
    </div>
  )
}

export default ImageWithFallback
