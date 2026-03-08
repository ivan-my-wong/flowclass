import { ImageCropType } from '@/types/imageCrop'

// eslint-disable-next-line import/prefer-default-export
export const IMAGE_RATIO: ImageCropType[] = [
  {
    name: '1:1',
    ratio: 1,
  },
  {
    name: '4:3',
    ratio: 4 / 3,
  },
  {
    name: '16:9',
    ratio: 16 / 9,
  },
  {
    name: '21:9',
    ratio: 21 / 9,
  },
]
