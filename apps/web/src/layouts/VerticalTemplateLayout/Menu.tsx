import { useRouter } from 'next/router'

import useTranslation from 'next-translate/useTranslation'

import { useSsrComplected } from '@/stores/ssrCompleted'
import { useTabContext } from '@/stores/tabContext'

const Menu = ({
  tabs,
  setShowMegaMenu,
  baseUrl,
}: {
  tabs: string[]
  setShowMegaMenu?: (b: any) => void
  baseUrl?: string
}): JSX.Element => {
  // set recoil state to indicate SSR is completed
  useSsrComplected()
  const { currentTab, setCurrentTab } = useTabContext()
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <>
      <div className="flex h-full flex-col justify-center gap-4">
        {tabs.map((tab, index) => {
          return (
            <button
              key={index}
              className={`${
                currentTab === tab ? 'text-primary' : ''
              } align-center hover:text-primary cursor-pointer text-center`}
              onClick={() => {
                router.push(
                  {
                    pathname: baseUrl, // Keep the current path
                    query: {}, // Empty query object to remove all parameters
                    hash: tab,
                  },
                  undefined,
                  { shallow: true }
                )
                // .then(() => {
                //   setCurrentTab(tab)
                //   if (setShowMegaMenu) {
                //     setShowMegaMenu(false)
                //   }
                // })

                setCurrentTab(tab)
                if (setShowMegaMenu) {
                  setShowMegaMenu(false)
                }
              }}
            >
              {t(`school:heading.${tab}`)}
            </button>
          )
        })}
      </div>
    </>
  )
}

export default Menu
