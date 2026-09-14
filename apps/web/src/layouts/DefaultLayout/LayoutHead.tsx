import Head from 'next/head'

import { Course, School, Site } from '@/types'
import { getS3FileUrl } from '@/utils/convert'

const flowclassLogo = '/flowclass_icon.ico'
const LayoutHead = ({
  school,
  site,
}: {
  school?: School
  site?: Site
  course?: Course
}): JSX.Element => {
  let logo = flowclassLogo
  if (school?.logo && school?.logo !== '') {
    logo = getS3FileUrl(school.logo)
  } else if (site?.logo && site?.logo !== '') {
    logo = getS3FileUrl(site.logo)
  }

  return (
    <Head>
      <link rel="icon" href={logo} /> {/* Set favicon */}
    </Head>
  )
}

export default LayoutHead
