import { useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { BsFillEyeFill } from 'react-icons/bs'

import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'

const Preview = (): JSX.Element => {
  const [query] = useSearchParams()
  const url = query.get('previewUrl') || ''
  const height = query.get('previewHeight') || 0

  const { t } = useTranslation()

  return (
    <Box className="w-full overflow-hidden" direction="col">
      <Box className="w-full h-[20vh] bg-background-layer-3 fixed top-0 left-0 right-0">
        <Box justify="start" className="pl-[10%]">
          <BsFillEyeFill />
          <Text>{t('embed:code.previewHeader')}</Text>
        </Box>
      </Box>
      <Box className="w-full top-[20vh]">
        <div style={{ width: '100%' }}>
          <iframe
            title="preview"
            src={url}
            width="100%"
            style={{
              position: 'relative',
              height: `${height}vh`,
            }}
            frameBorder="0"
          />
        </div>
      </Box>
    </Box>
  )
}

export default Preview
