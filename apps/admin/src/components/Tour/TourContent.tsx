import { DefaultTFuncReturn } from 'i18next'

import flowclassLogo from '@/assets/logos/flowclass.png'

import Separator from '../Separators/Separator'
import Text from '../Texts/Text'
import Box from '../ui/Box'

type TourContentProps = {
  text?: DefaultTFuncReturn | DefaultTFuncReturn[]
  imageSrc?: string
  imageAlt?: string
  customContent?: JSX.Element
  textOnly?: boolean
}

const TourContent = ({
  text,
  imageSrc = flowclassLogo,
  imageAlt = 'tourImage',
  customContent,
  textOnly = false,
}: TourContentProps): JSX.Element => {
  return (
    <Box direction="col" className="pt-6">
      {!textOnly && (
        <>
          <img width="100%" alt={imageAlt} src={imageSrc} />
          <Separator />
        </>
      )}
      {typeof text === 'string' ? (
        <Text>{text}</Text>
      ) : (
        text?.map((t: DefaultTFuncReturn) => <Text key={t}>{t}</Text>)
      )}

      {customContent}
    </Box>
  )
}

export default TourContent
