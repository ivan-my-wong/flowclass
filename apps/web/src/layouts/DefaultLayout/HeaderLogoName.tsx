import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { useRecoilState } from 'recoil'

import ImageWithFallback from '@/components/Images/ImageWithFallback'
import Heading from '@/components/Texts/Heading'
import imageUrls from '@/constants/imageUrls'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { useTabContext } from '@/stores/tabContext'
import { School } from '@/types'
import { MenuTabsProps, WebsiteTemplate } from '@/types/websiteTemplate'
import { cn } from '@/utils/cn'
import { getMediaFileUrl } from '@/utils/convert'

const Header = ({
  school,
}: {
  school: School
  menu?: MenuTabsProps
  showMenu?: boolean
}): JSX.Element => {
  const router = useRouter()
  const [, setShowSubMenu] = useState(true)
  const [currentTheme] = useRecoilState(currentWebsiteTheme)
  const { setCurrentTab } = useTabContext()

  useEffect(() => {
    const handleScrollChange = (): void => {
      if (window.pageYOffset > 400) {
        setShowSubMenu(false)
      } else {
        setShowSubMenu(true)
      }
    }
    window.addEventListener('scroll', handleScrollChange)
    return () => window.removeEventListener('scroll', handleScrollChange)
  }, [])

  const navToHome = (): void => {
    router
      .push({
        pathname: `/@${school.url ?? ''}`,
      })
      .then(() => {
        if (currentTheme === WebsiteTemplate.Hero) setCurrentTab('')
        else setCurrentTab('basicInfo')
      })
  }

  return (
    <header
      className={cn(
        'lg:box-col',
        'flex',
        'w-full',
        'shrink-0',
        'flex-col',
        'items-center',
        'justify-between'
      )}
    >
      <div className="box-row-full w-fit gap-2 md:gap-4">
        <ImageWithFallback
          src={getMediaFileUrl(school.logo) ?? imageUrls.defaultFallback}
          fallbackSrc={imageUrls.defaultFallback}
          alt={school.name}
          className="h-12 w-12 shrink-0 cursor-pointer"
          onClick={() => {
            navToHome()
          }}
        />

        <Heading
          className="w-fit cursor-pointer"
          onClick={() => {
            navToHome()
          }}
        >
          {school.name}
        </Heading>
      </div>
    </header>
  )
}

export default Header
