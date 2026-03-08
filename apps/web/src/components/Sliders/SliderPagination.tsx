import React, { useRef } from 'react'

import Slider from 'react-slick'

import PaginationButton from '@/components/Buttons/PaginationButton'

type PaginationProps = {
  children: JSX.Element
  itemsPerPage: number
}

const Pagination = ({ children, itemsPerPage }: PaginationProps): JSX.Element => {
  const sliderRef = useRef<Slider>(null)

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: itemsPerPage,
    slidesToScroll: 1,
  }
  return (
    <div>
      <div className="box-row justify-between text-center">
        <PaginationButton
          type="back"
          onClick={() => {
            sliderRef.current?.slickPrev()
          }}
        />
        <PaginationButton
          type="next"
          onClick={() => {
            sliderRef.current?.slickNext()
          }}
        />
      </div>
      <Slider ref={sliderRef} {...settings}>
        {children}
      </Slider>
    </div>
  )
}

export default Pagination
