import {
  ComponentProps,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useState,
} from 'react'

import { Root } from '@radix-ui/react-aspect-ratio'

import { getS3PrivateFileUrl } from '@/api/uploadFile'
import imageFailed from '@/assets/fallback/imageFailed.png'
import { styled } from '@/styles'
import { cn } from '@/utils/cn'
import { getS3FileUrl } from '@/utils/generate-link.utils'

import Box from '../ui/Box'

const Img = styled('img', {
  objectFit: 'cover',
  width: '100%',
  height: '100%',
})

type ImageAspectProps = {
  s3?: 'public' | 'private'
  ratio?: number
  width: string
  src: string
  alt: string
  height?: string
  borderRadius?: string
  objectFit?: 'cover' | 'fill' | 'contain'
  boxProps?: Omit<ComponentProps<typeof Box>, 'children'>
} & HTMLAttributes<HTMLImageElement>

const ImageAspect = forwardRef<HTMLImageElement, ImageAspectProps>(
  (
    {
      s3,
      ratio,
      width,
      src,
      alt,
      height,
      borderRadius,
      objectFit = 'cover',
      boxProps,
      ...props
    },
    ref
  ): React.ReactElement => {
    const [loading, setLoading] = useState(false)
    const handleImageError = (
      event: React.SyntheticEvent<HTMLImageElement, Event>
    ) => {
      const img = event.currentTarget
      img.src = imageFailed
      setLoading(false)
    }

    const [imageSrc, setImageSrc] = useState<string>('')

    const getImageSrc = async () => {
      if (!src) return
      if (!s3) {
        setImageSrc(src)
        setLoading(false)
        return
      }
      if (s3 === 'public') {
        setImageSrc(getS3FileUrl(src))
      } else {
        setImageSrc(await getS3PrivateFileUrl(src))
      }

      setLoading(true)
    }

    useEffect(() => {
      const fetchImageSrc = async () => {
        await getImageSrc()
      }
      fetchImageSrc()
    }, [src, s3, imageSrc])

    return (
      <Box
        {...boxProps}
        className={cn('overflow-hidden', boxProps?.className)}
        style={{
          borderRadius,
          width,
          height,
        }}
      >
        <Root ratio={ratio ?? 16 / 9}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          <Img
            src={imageSrc}
            onError={handleImageError}
            onLoad={() => setLoading(false)}
            style={{ display: loading ? 'none' : 'block' }}
            alt={alt}
            {...ref}
            {...props}
            css={{ objectFit: `${objectFit}` }}
          />
        </Root>
      </Box>
    )
  }
)

export default ImageAspect
