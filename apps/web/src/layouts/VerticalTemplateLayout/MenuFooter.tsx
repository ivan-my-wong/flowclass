import moment from 'moment-timezone'
import { BsClockFill } from 'react-icons/bs'
import { RiMoneyDollarCircleFill } from 'react-icons/ri'

import Text from '@/components/Texts/Text'
import { useSsrComplected } from '@/stores/ssrCompleted'
import { Site } from '@/types'

const FooterBox = ({ data, icon }: { data: string; icon: React.ReactNode }) => {
  return (
    <div className="flex w-11/12 flex-row justify-start gap-2 p-1 text-center">
      <div className="text-textSubtle flex items-center justify-center text-center">{icon}</div>
      <div className="flex w-full items-center justify-center text-center">
        <Text>{data}</Text>
      </div>
    </div>
  )
}

const MenuFooter = ({ site }: { site: Site }): JSX.Element => {
  // set recoil state to indicate SSR is completed
  useSsrComplected()

  const { currency, timeZone } = site
  const utcOffset = moment.tz(timeZone.id).format('Z')

  return (
    <>
      <div className={`align-center flex h-full w-full flex-col items-center justify-center gap-3`}>
        <FooterBox data={currency} icon={<RiMoneyDollarCircleFill className="flex-shrink-0" />} />
        <FooterBox
          data={`${timeZone.id} (UTC${utcOffset})`}
          icon={<BsClockFill className="flex-shrink-0" />}
        />{' '}
      </div>
    </>
  )
}

export default MenuFooter
