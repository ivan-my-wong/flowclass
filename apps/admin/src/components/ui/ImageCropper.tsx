import {
  ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useState,
} from 'react'

import Cropper from 'react-easy-crop'
import { useTranslation } from 'react-i18next'

import { IMAGE_RATIO } from '@/constants/imageCrop'
import { CroppedAreaType, ImageCropType } from '@/types/imageCrop'
import getCroppedImg from '@/utils/imageCrop'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select'
import { Slider } from './Slider'

export type PropTypes = {
  fileSrc: string | undefined
  ratio?: number | undefined
  onActionSave: (result: string, blob: Blob) => void
} & ComponentPropsWithoutRef<'div'>
const ImageCropper = ({
  fileSrc,
  ratio: aspectRatio,
  onActionSave,
  ...props
}: PropTypes): React.ReactElement => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const { t } = useTranslation()
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [ratio, setRatio] = useState<ImageCropType>(IMAGE_RATIO[0])
  const [croppedArea, setCroppedArea] = useState<CroppedAreaType | null>(null)
  const onCropComplete = (_: unknown, croppedAreaPixels: CroppedAreaType) => {
    setCroppedArea(croppedAreaPixels)
  }

  const onChangeRatio = (name: string) => {
    const foundRatio: ImageCropType | undefined = IMAGE_RATIO.find(
      d => d.name === name
    )
    setRatio(foundRatio || IMAGE_RATIO[0])
  }

  const handleSave = useCallback(async () => {
    if (!fileSrc) return
    const [croppedImage, blob] = await getCroppedImg(
      fileSrc,
      croppedArea,
      rotation
    )
    if (blob) {
      onActionSave(croppedImage, blob)
    }
  }, [fileSrc, croppedArea, rotation])
  useEffect(() => {
    handleSave()
  }, [fileSrc, croppedArea, rotation])
  useEffect(() => {
    // If aspect ratio pass from props than we set default ratio from passed aspectRatio props
    if (aspectRatio) {
      setRatio({
        name: 'Fixed Aspect Ratio',
        ratio: aspectRatio,
      })
    }
  }, [aspectRatio])
  return (
    <div className="mt-4" {...props}>
      <div className="flex relative w-full h-80">
        {fileSrc && (
          <Cropper
            image={fileSrc}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={ratio.ratio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        )}
      </div>
      <div className="h-fit flex gap-2 w-full justify-center mt-4">
        <div className="w-1/2 space-y-2">
          <label htmlFor="zoom">{t('action.zoom')}</label>
          <Slider
            id="zoom"
            min={1}
            max={3}
            value={[zoom]}
            step={0.1}
            onValueChange={value => {
              setZoom(value[0])
            }}
          />
        </div>

        <div className="w-1/2 space-y-2">
          <label htmlFor="rotation">{t('action.rotation')}</label>
          <Slider
            id="rotation"
            value={[rotation]}
            min={0}
            max={360}
            step={1}
            onValueChange={value => {
              setRotation(value[0])
            }}
          />
        </div>
      </div>
      {/* If no aspect ratio from props we can custom the ratio by select from Select Fields */}
      {!aspectRatio && (
        <div className="w-1/2 mt-4 space-y-2">
          <label htmlFor="ratio">{t('action.ratio')}</label>
          <Select onValueChange={onChangeRatio} defaultValue={ratio.name}>
            <SelectTrigger id="ratio">
              <SelectValue placeholder="Please select a ratio" />
            </SelectTrigger>
            <SelectContent>
              {IMAGE_RATIO.map((rat, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <SelectItem value={rat.name} key={`${rat.name}-${index}`}>
                  {rat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

export default ImageCropper
