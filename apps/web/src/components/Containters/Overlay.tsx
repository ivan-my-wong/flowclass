import { useRouter } from 'next/router'

import { useRecoilState } from 'recoil'

import { courseFilterOpenState } from '@/stores/courseData'

const Overlay = (): JSX.Element => {
  const router = useRouter()
  const [showFilterModal, setFilterModal] = useRecoilState(courseFilterOpenState)

  return (
    <div
      style={{ background: showFilterModal ? 'rgba(1,1,1,0.5)' : '' }}
      className={` ${showFilterModal ? 'fixed left-0 top-0 z-30 flex h-full w-full' : ''}  `}
      onClick={() => {
        setFilterModal(false)
      }}
    />
  )
}

export default Overlay
