export interface CompressImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeBytes?: number
}

const DEFAULT_MAX_WIDTH = 1920
const DEFAULT_MAX_HEIGHT = 1920
const DEFAULT_QUALITY = 0.8
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

/**
 * Compresses and resizes an image file (including HEIC conversion) on the client side.
 * Non-image files (e.g. PDF) are passed through without modification.
 */
export const compressImageFile = async (
  file: File,
  options: CompressImageOptions = {}
): Promise<File> => {
  const {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
  } = options

  const fileName = file.name || 'receipt.jpg'
  const lowerName = fileName.toLowerCase()
  const fileType = (file.type || '').toLowerCase()

  // PDFs are passed through directly
  if (fileType === 'application/pdf' || lowerName.endsWith('.pdf')) {
    return file
  }

  let workingBlob: Blob = file
  let outputFileName = fileName

  const isHeic =
    lowerName.endsWith('.heic') ||
    lowerName.endsWith('.heif') ||
    fileType.includes('heic') ||
    fileType.includes('heif')

  // Convert HEIC to JPEG with compression if running in the browser
  if (isHeic && typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const heic2any = require('heic2any')
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality,
      })
      const blobResult = Array.isArray(converted) ? converted[0] : converted
      workingBlob = blobResult as Blob
      outputFileName = fileName.replace(/\.(heic|heif)$/i, '.jpg')
    } catch (error) {
      console.warn('HEIC conversion failed, proceeding with original file:', error)
    }
  }

  // Compress and resize using HTML5 Canvas
  if (typeof window === 'undefined') {
    return new File([workingBlob], outputFileName, {
      type: workingBlob.type || 'image/jpeg',
    })
  }

  return new Promise<File>(resolve => {
    const objectUrl = URL.createObjectURL(workingBlob)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img

      // Calculate new dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        const fallbackFile = new File([workingBlob], outputFileName, {
          type: workingBlob.type || 'image/jpeg',
        })
        resolve(fallbackFile)
        return
      }

      // Fill white background to prevent transparent PNGs from having black backgrounds in JPEG
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        blob => {
          if (!blob) {
            const fallbackFile = new File([workingBlob], outputFileName, {
              type: workingBlob.type || 'image/jpeg',
            })
            resolve(fallbackFile)
            return
          }

          const finalName = outputFileName.replace(/\.(png|heic|heif|bmp|tiff)$/i, '.jpg')
          const compressedFile = new File([blob], finalName, {
            type: 'image/jpeg',
          })
          resolve(compressedFile)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = error => {
      URL.revokeObjectURL(objectUrl)
      console.warn('Image loading for canvas failed, using uncompressed file:', error)
      const fallbackFile = new File([workingBlob], outputFileName, {
        type: workingBlob.type || 'image/jpeg',
      })
      resolve(fallbackFile)
    }

    img.src = objectUrl
  })
}
