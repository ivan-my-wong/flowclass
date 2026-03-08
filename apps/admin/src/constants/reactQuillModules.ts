import { RefObject } from 'react'

import { ImageResize } from 'quill-image-resize-module-ts'

import ReactQuill, { Quill } from 'react-quill'

const Size = Quill.import('attributors/style/size')
const AlignClass = Quill.import('attributors/style/align')

const sizeArray: string[] = []
for (let i = 8; i <= 32; i += 2) {
  sizeArray.push(`${i}px`)
}
Size.whitelist = sizeArray

Quill.register('modules/imageResize', ImageResize)
Quill.register(Size, true)
Quill.register(AlignClass, true)
const Parchment = Quill.import('parchment')
class IndentAttributor extends Parchment.Attributor.Style {
  constructor() {
    super('indent', 'text-indent', {
      scope: Parchment.Scope.BLOCK,
      whitelist: [
        '1em',
        '2em',
        '3em',
        '4em',
        '5em',
        '6em',
        '7em',
        '8em',
        '9em',
      ],
    })
  }

  add(node: HTMLElement, value: number) {
    if (value === 0) {
      this.remove(node)
      return true
    }
    return super.add(node, `${value}em`)
  }
}

const IndentStyle = new IndentAttributor()
Quill.register(IndentStyle, true)

export const formats = [
  'header',
  'align',
  'background',
  'blockquote',
  'bold',
  'code-block',
  'color',
  'float',
  'font',
  'height',
  'image',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'indent',
  'link',
  'script',
  'size',
  'width',
  'video',
]

// some modules require the quill ref to be passed

export const getQuillModules = (quillRef: RefObject<ReactQuill>) => {
  return {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [
        {
          size: sizeArray,
        },
      ],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        {
          color: [
            '#000000',
            '#e60000',
            '#ff9900',
            '#ffff00',
            '#008a00',
            '#0066cc',
            '#9933ff',
            '#ffffff',
            '#facccc',
            '#ffebcc',
            '#ffffcc',
            '#cce8cc',
            '#cce0f5',
            '#ebd6ff',
            '#bbbbbb',
            '#f06666',
            '#ffc266',
            '#ffff66',
            '#66b966',
            '#66a3e0',
            '#c285ff',
            '#888888',
            '#a10000',
            '#b26b00',
            '#b2b200',
            '#006100',
            '#0047b2',
            '#6b24b2',
            '#444444',
            '#5c0000',
            '#663d00',
            '#666600',
            '#003700',
            '#002966',
            '#3d1466',
          ],
        },
      ],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      ['link', 'image', 'video'],
      ['clean'],
    ],
    clipboard: {
      matchVisual: false,
    },
    imageResize: {
      modules: ['Resize', 'DisplaySize'],
    },
  }
}
