import { useEffect, useRef, useState } from 'react'

import { FaSearchMinus, FaSearchPlus, FaUndo } from 'react-icons/fa'
import { FiUploadCloud } from 'react-icons/fi'
import { RxCursorArrow } from 'react-icons/rx'
import {
  Image as KonvaImage,
  Layer,
  Rect,
  Stage,
  Text as KonvaText,
} from 'react-konva'

import { Button } from '@/components/ui/Button'
import {
  TemplateBackgroundProps,
  TemplateFieldData,
} from '@/types/templateManagement'

type CenterCanvasProps = {
  image: HTMLImageElement | undefined
  setImage: (image?: HTMLImageElement) => void
  fields: TemplateFieldData[]
  setFields: (fields: TemplateFieldData[]) => void
  selectedFieldId: string | null
  setSelectedFieldId: (fields: string) => void
  background: TemplateBackgroundProps
}

const CenterCanvas = (props: CenterCanvasProps) => {
  const {
    image,
    setImage,
    fields,
    setFields,
    selectedFieldId,
    setSelectedFieldId,
    background,
  } = props

  const draggingId = useRef<string | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)

  const [scale, setScale] = useState(1)
  const [zoom, setZoom] = useState(100)

  const handleDragMove = (id: string, x: number, y: number) => {
    setFields(
      fields.map(field => (field.id === id ? { ...field, x, y } : field))
    )
  }

  useEffect(() => {
    if (editorRef.current) {
      const container = editorRef.current
      const style = getComputedStyle(container)
      const paddingLeft = parseFloat(style.paddingLeft)
      const paddingRight = parseFloat(style.paddingRight)
      const containerWidth = container.offsetWidth - paddingLeft - paddingRight

      const zoomScale = zoom / 100
      const scaledWidth = background.width * zoomScale
      let newScale = zoomScale
      if (containerWidth < scaledWidth) {
        newScale = containerWidth / background.width
      }
      setScale(newScale)
    }
  }, [zoom, background])

  const handleReset = () => {
    setImage(undefined)
    setFields([])
    setSelectedFieldId('')
  }

  return (
    <div className="flex flex-col w-full bg-white border border-background-layer-3 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 p-4">
        <Button
          variant="outline"
          onClick={() => setZoom(zoom - 10)}
          disabled={zoom <= 10}
        >
          <FaSearchMinus />
        </Button>
        <span className="text-sm w-[50px] text-center">{zoom}%</span>
        <Button
          variant="outline"
          onClick={() => setZoom(zoom + 10)}
          disabled={zoom >= 100}
        >
          <FaSearchPlus />
        </Button>
        <div className="w-[2px] bg-background-layer-3 h-[30px] mx-3" />
        <Button variant="outline" onClick={() => handleReset()}>
          <FaUndo /> <span className="ml-2">Reset</span>
        </Button>
        <span className="ml-auto text-sm text-gray-500">
          <RxCursorArrow size={16} className="inline-block mr-1" />
          Click and drag to position fields
        </span>
      </div>

      <div
        ref={editorRef}
        id="editor-canvas"
        className="p-4 bg-background-layer-2 border-t border-t-background-layer-3"
      >
        {!image && (
          <div className="border-2 border-dashed border-background-layer-3 p-4 rounded-lg flex flex-col items-center justify-center text-center text-gray-500 bg-white">
            <FiUploadCloud size={28} className="mb-2" />
            <p className="font-semibold">No Template Uploaded</p>
            <p className="text-sm">Upload a PDF template to start designing</p>
          </div>
        )}

        {!!image && (
          <Stage
            width={background.width * scale}
            height={background.height * scale}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              <KonvaImage
                image={image}
                width={background.width}
                height={background.height}
              />

              {fields.map(field => (
                <>
                  {selectedFieldId === field.id && (
                    <Rect
                      x={field.x - 10}
                      y={field.y - 6}
                      width={field.name.length * field.fontSize * 0.6 + 10}
                      height={field.fontSize + 10}
                      stroke="blue"
                      strokeWidth={1}
                      dash={[4, 2]}
                    />
                  )}

                  <KonvaText
                    key={field.id}
                    text={field.name}
                    x={field.x}
                    y={field.y}
                    fontSize={field.fontSize}
                    fill={field.color}
                    draggable
                    onClick={() => setSelectedFieldId(field.id)}
                    onDragStart={e => {
                      draggingId.current = field.id
                    }}
                    onDragMove={e => {
                      handleDragMove(field.id, e.target.x(), e.target.y())
                    }}
                  />
                </>
              ))}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  )
}

export default CenterCanvas
