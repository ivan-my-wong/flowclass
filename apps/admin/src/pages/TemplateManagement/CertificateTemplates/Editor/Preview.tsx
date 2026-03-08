import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { MdOutlineRemoveRedEye } from 'react-icons/md'
import { Image as KonvaImage, Layer, Stage, Text } from 'react-konva'

import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import {
  TemplateBackgroundProps,
  TemplateFieldData,
} from '@/types/templateManagement'

type CertificateProps = {
  background: TemplateBackgroundProps
  fieldData: TemplateFieldData[]
  values: { [key: string]: string }
  image: HTMLImageElement | undefined
}

const PreviewCertificate = (props: CertificateProps) => {
  const { background, fieldData, values, image } = props
  const { t } = useTranslation()

  const [scale, setScale] = useState(1)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const container = document.getElementById('editor-canvas')
    if (container) {
      const style = getComputedStyle(container)
      const paddingLeft = parseFloat(style.paddingLeft) + 20
      const paddingRight = parseFloat(style.paddingRight) + 20
      const containerWidth = container.offsetWidth - paddingLeft - paddingRight

      const zoomScale = 1
      const scaledWidth = background.width * zoomScale
      let newScale = zoomScale
      if (containerWidth < scaledWidth) {
        newScale = containerWidth / background.width
      }
      setScale(newScale)
    }
  }, [isOpen, background])

  return (
    <>
      <Button
        iconBefore={<MdOutlineRemoveRedEye />}
        variant="primary-outline"
        onClick={() => setIsOpen(true)}
      >
        {t('templateManagement:buttons.preview')}
      </Button>
      <ModalDialog
        open={isOpen}
        title={t('templateManagement:buttons.preview') as string}
        onOpenChange={() => setIsOpen(false)}
      >
        <div className="flex justify-center items-center">
          <Stage
            width={background.width * scale}
            height={background.height * scale}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              {image && (
                <KonvaImage
                  image={image}
                  width={background.width}
                  height={background.height}
                />
              )}
              {fieldData.map(field => {
                let width = (values[field.name] || '').length * 11
                if (width < field.name.length * 11) {
                  width = field.name.length * 11
                }
                return (
                  <Text
                    key={field.id}
                    x={field.x}
                    y={field.y}
                    text={values[field.name] || ''}
                    fontSize={field.fontSize}
                    fill={field.color}
                    align="center"
                    width={width}
                  />
                )
              })}
            </Layer>
          </Stage>
        </div>
      </ModalDialog>
    </>
  )
}

export default PreviewCertificate
