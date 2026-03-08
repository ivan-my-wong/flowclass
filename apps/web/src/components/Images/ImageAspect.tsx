import { HTMLAttributes, useEffect, useState } from 'react'

import { Root } from '@radix-ui/react-aspect-ratio'
import clsx from 'clsx'

import { getPrivateFileAccessUrl } from '@/api/uploadFile'
import { getMediaFileUrl } from '@/utils/convert'

import ImageWithFallback from './ImageWithFallback'

type ImageAspectProps = {
  ratio?: number
  s3?: 'public' | 'private'
  fallbackSrc?: string
  src: string
  alt: string
  borderRadius?: string
  className?: string
  imgClassName?: string
} & Omit<HTMLAttributes<HTMLImageElement>, 'placeholder'>

const ImageAspect = ({
  ratio = 16 / 9,
  s3,
  src,
  alt,
  fallbackSrc,
  className,
  imgClassName,
  ...props
}: ImageAspectProps) => {
  const [loading, setLoading] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>('')

  const getImageSrc = async () => {
    if (!src) {
      setImageSrc('')
      setLoading(false)
      return
    }

    setLoading(true)
    if (!s3) {
      setImageSrc(src)
    } else if (s3 === 'public') {
      setImageSrc(getMediaFileUrl(src))
    } else {
      const privateFileUrl = await getPrivateFileAccessUrl(src)
      setImageSrc(privateFileUrl)
    }
  }

  useEffect(() => {
    const fetchImageSrc = async () => {
      try {
        await getImageSrc()
      } catch {
        setLoading(false)
      }
    }
    fetchImageSrc()
  }, [src, s3])

  return (
    <Root ratio={ratio} className={clsx('relative overflow-hidden', className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-t-primary h-6 w-6 animate-spin rounded-full border-4 border-gray-300" />
        </div>
      )}
      <ImageWithFallback
        src={imageSrc}
        fallbackSrc={fallbackSrc}
        alt={alt}
        className="h-full w-full"
        imgClassName={imgClassName}
        isImageLoading={loading}
        {...props}
        onError={() => {
          setImageSrc(fallbackSrc ?? '')
          setLoading(false)
        }}
        onLoad={() => {
          setLoading(false)
        }}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </Root>
  )
}

ImageAspect.displayName = 'ImageAspect'

export default ImageAspect
