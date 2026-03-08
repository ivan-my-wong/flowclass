import { useSsrComplected } from '@/stores/ssrCompleted'
import { School } from '@/types/school'
import { Site } from '@/types/site'

import Header from '../DefaultLayout/HeaderLogoName'
import LayoutHead from '../DefaultLayout/LayoutHead'
import Main from '../DefaultLayout/Main'

import BareboneFooter from './BareboneFooter'

const BareboneTemplateLayout = ({
  children,
  school,
  site,
}: {
  children: React.ReactNode
  school: School
  site: Site
}): JSX.Element => {
  // set recoil state to indicate SSR is completed
  useSsrComplected()

  if (!school || !site) {
    return <>{children}</>
  }

  return (
    <>
      <LayoutHead school={school} site={site} />

      <div className="my-2">
        <Header school={school} showMenu={false} />
      </div>

      <Main>{children}</Main>
      <div className="box-row w-full p-4">
        <BareboneFooter school={school} site={site} />
      </div>
    </>
  )
}

export default BareboneTemplateLayout
