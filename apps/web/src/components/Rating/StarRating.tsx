import React from 'react'

import { FaStar } from 'react-icons/fa'

interface StarRatingProps {
  rating: number
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const MAX_RATING = 5
  const fullStars = Math.floor(rating)
  const halfStars = Math.ceil(rating - fullStars)
  const emptyStars = MAX_RATING - fullStars - halfStars

  const starElements = []

  // Create an array of <FaStar /> elements based on the rating
  for (let i = 0; i < fullStars; i++) {
    starElements.push(<FaStar key={`full-${i}`} />)
  }

  for (let i = 0; i < halfStars; i++) {
    starElements.push(<FaStar key={`half-${i}`} style={{ opacity: 0.5 }} />)
  }

  for (let i = 0; i < emptyStars; i++) {
    starElements.push(<FaStar key={`empty-${i}`} style={{ opacity: 0.2 }} />)
  }

  return <>{starElements}</>
}

export default StarRating
