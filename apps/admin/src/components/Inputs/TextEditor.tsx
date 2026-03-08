import { forwardRef, useEffect, useRef, useState } from 'react'

import imageCompression from 'browser-image-compression'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import ReactQuill, { ReactQuillProps } from 'react-quill'

import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import { formats, getQuillModules } from '@/constants/reactQuillModules'
import useFileUpload from '@/hooks/useFileUpload'
import { MediaUploadResponse } from '@/types/apiResponse'
import { SectionDescription } from '@/types/course'
import { SectionTag } from '@/types/school'
import { getMediaFileUrl } from '@/utils/generate-link.utils'

import Box from '../ui/Box'

type TextEditorProps = {
  labels?: SectionTag[] | string[]
  style?: React.CSSProperties
  content: SectionDescription[] | string | null
  currentSection?: string
  imageDirectory: MediaFileDirectory
  onValueChange: (value: string | SectionDescription[]) => void
  isSimpleEditor?: boolean
  className?: string
  onBlur?: () => void
} & ReactQuillProps
const defaultSectionValue = '<p><br></p>'
const MAX_IMAGE_SIZE_MB = 5

const TextEditor = forwardRef<ReactQuill, TextEditorProps>(
  (
    {
      content,
      style,
      currentSection,
      onValueChange,
      imageDirectory,
      isSimpleEditor,
      className,
      onBlur,
    },
    ref
  ) => {
    const { t } = useTranslation()
    const [editorSectionValue, setEditorSectionValue] = useState<
      SectionTag[] | any
    >(content ?? [])
    const quillRef = useRef<ReactQuill>(null)

    useEffect(() => {
      setEditorSectionValue(content ?? [])
    }, [content])

    // eslint-disable-next-line consistent-return
    useEffect(() => {
      const editor = quillRef.current?.getEditor()?.root
      if (editor && onBlur) {
        const handleBlur = () => {
          onBlur()
        }
        editor.addEventListener('blur', handleBlur)

        return () => editor.removeEventListener('blur', handleBlur)
      }
    }, [onBlur])

    const { useImageUpload } = useFileUpload()
    const onImageploadSuccess = (data: MediaUploadResponse) => {
      const range = quillRef.current?.getEditor().getSelection()
      if (range) {
        quillRef.current
          ?.getEditor()
          .insertEmbed(range.index, 'image', getMediaFileUrl(data.url))
      }
    }
    const uploadImageResult = useImageUpload(
      imageDirectory,
      onImageploadSuccess
    )
    const handleImageUpload = async (file: File) => {
      try {
        let processedFile = file
        if (file.name.match(/\.(jpg|jpeg|png)$/i)) {
          const options = {
            maxSizeMB: MAX_IMAGE_SIZE_MB,
            maxWidthOrHeight: 1920,
          }
          const blob = (await imageCompression(file, options)) as Blob
          processedFile = new File([blob], file.name, { type: blob.type })
        }

        if (processedFile.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          toast.error(
            t('common:errors.PAYLOAD_TOO_LARGE', {
              name: processedFile.name,
            })
          )
          return
        }

        await uploadImageResult.mutateAsync(processedFile)
      } catch (error) {
        console.error('Image upload error:', error)
        toast.error(t('common:errors.UPLOAD_FAILED'))
      }
    }

    // eslint-disable-next-line consistent-return
    useEffect(() => {
      // upload image to s3
      quillRef.current
        ?.getEditor()
        .getModule('toolbar')
        .addHandler('image', () => {
          const input = document.createElement('input')
          input.setAttribute('type', 'file')
          input.setAttribute('accept', 'image/*')
          input.click()

          input.onchange = async () => {
            const file = input.files?.[0]
            if (file) {
              await handleImageUpload(file)
            }
          }
        })
      const handlePaste = async (e: ClipboardEvent) => {
        const clipboardItems = e.clipboardData?.items
        if (!clipboardItems) return

        const imageItem = Array.from(clipboardItems).find(item =>
          item.type.startsWith('image/')
        )

        if (!imageItem) return

        e.preventDefault()
        const file = imageItem.getAsFile()
        if (!file) return

        try {
          await handleImageUpload(file)
        } catch (error) {
          console.error('Paste handling error:', error)
          toast.error(t('common:errors.UPLOAD_FAILED'))
        }
      }
      // Add paste event listener to the editor
      const editor = quillRef.current?.getEditor()?.root
      if (editor) {
        editor.addEventListener('paste', handlePaste)
        return () => editor.removeEventListener('paste', handlePaste)
      }
    }, [quillRef, uploadImageResult])

    const insertAiText = (aiText: string): void => {
      if (!quillRef.current) return
      const editor = quillRef.current.getEditor()
      let range = editor.getSelection()
      if (!range) {
        range = { index: editor.getLength(), length: 0 }
      }
      // editor.deleteText(0, editor.getLength())

      // Convert newline characters to HTML breaks
      const aiTextWithNewLine = aiText.replace(/\n/g, '<br>')
      const aiTextWithNewLineWrapped = `<p>${aiTextWithNewLine}</p>`

      editor.clipboard.dangerouslyPasteHTML(
        range.index,
        aiTextWithNewLineWrapped
      )
    }

    const handleEditorValueChange = (value: string) => {
      if (isSimpleEditor) {
        onValueChange(value)
      } else {
        const newArray = editorSectionValue?.map((desc: SectionDescription) =>
          desc.sectionTitle === currentSection
            ? { ...desc, content: value }
            : desc
        )
        setEditorSectionValue(newArray)
        onValueChange(newArray)
      }
    }

    const editorContent =
      !isSimpleEditor && editorSectionValue
        ? editorSectionValue.find(
            (desc: SectionDescription) => desc.sectionTitle === currentSection
          )?.content
        : ''

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()

      quillRef.current?.focus()

      const { files } = e.dataTransfer
      if (files && files.length > 0) {
        Array.from(files).forEach(file => {
          if (file.type.startsWith('image/')) {
            uploadImageResult.mutate(file)
          }
        })
      }
    }

    return (
      <Box
        direction="col"
        {...ref}
        data-text-editor="editor"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className={className}
      >
        {isSimpleEditor ? (
          <>
            {content !== undefined && (
              <ReactQuill
                className="flex flex-col h-full [&_.ql-snow.ql-toolbar]:bg-background [&_.ql-snow.ql-toolbar]:shrink-0 [&_.ql-container]:flex-1 [&_.ql-container]:h-auto [&_.ql-container]:flex [&_.ql-container]:flex-col [&_.ql-editor]:flex-1 [&_.ql-editor]:overflow-wrap-anywhere [&_.ql-editor]:resize-y [&_.ql-editor]:h-auto [&_.ql-editor]:bg-background"
                id="textEditor"
                ref={quillRef}
                modules={getQuillModules(quillRef)}
                formats={formats}
                style={style}
                value={(content as unknown as string) || defaultSectionValue}
                onChange={(content, delta, source, editor) => {
                  handleEditorValueChange(editor.getHTML())
                }}
                bounds='[data-text-editor="editor"]'
              />
            )}
          </>
        ) : (
          <>
            {content && (
              <ReactQuill
                className="flex flex-col h-full [&_.ql-snow.ql-toolbar]:bg-background [&_.ql-snow.ql-toolbar]:shrink-0 [&_.ql-container]:flex-1 [&_.ql-container]:h-auto [&_.ql-container]:flex [&_.ql-container]:flex-col [&_.ql-editor]:flex-1 [&_.ql-editor]:overflow-wrap-anywhere [&_.ql-editor]:resize-y [&_.ql-editor]:h-auto [&_.ql-editor]:bg-background"
                id="textEditor"
                ref={quillRef}
                modules={getQuillModules(quillRef)}
                formats={formats}
                style={style}
                value={
                  editorSectionValue?.find(
                    (desc: SectionDescription) =>
                      desc.sectionTitle === currentSection
                  )?.content || defaultSectionValue
                }
                onChange={(content, delta, source, editor) => {
                  handleEditorValueChange(editor.getHTML())
                }}
                bounds='[data-text-editor="editor"]'
              />
            )}
          </>
        )}
      </Box>
    )
  }
)

export default TextEditor
