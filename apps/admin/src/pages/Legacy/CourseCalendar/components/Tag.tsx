import React from 'react'

import Text from '@/components/Texts/Text'

interface Props {
  title: string
  color: '#BFBFBF' | '$secondary' | '$primary' | '$success'
}
const Tag = ({ color, title }: Props) => {
  return (
    <div>
      <Text
        css={{
          background: color,
          fontSize: '12px',
          color: '#ffffff',
          borderRadius: '$1',
          padding: '$1 $2',
        }}
      >
        {title}
      </Text>
    </div>
  )
}

export default Tag
