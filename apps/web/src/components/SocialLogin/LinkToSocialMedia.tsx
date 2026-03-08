import React from 'react'

import Box from '../Containters/Box'
import TextInput from '../Inputs/TextInput'

type SocialMediaProps = {
  logo: JSX.Element
  name: string
}

const SocialMedia: React.FC<SocialMediaProps> = ({ logo, name }) => {
  // const { t } = useTranslation()

  return (
    <Box direction="row" align="center" justify="between" className="px-5 py-3">
      <div className="h-auto w-6">{logo}</div>
      <TextInput label={name} />
    </Box>
  )
}
export default SocialMedia
