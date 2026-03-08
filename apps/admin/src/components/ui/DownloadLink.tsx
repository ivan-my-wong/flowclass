import React from 'react'

import { Button } from '@/components/ui/Button'

export interface DownloadLinkProps {
  href: string
  download: string
  children: React.ReactNode
  className?: string
}

export const DownloadLink: React.FC<DownloadLinkProps> = ({
  href,
  download,
  children,
  className,
}) => {
  return (
    <Button variant="link" className={className}>
      <a href={href} download={download}>
        {children}
      </a>
    </Button>
  )
}

export default DownloadLink
