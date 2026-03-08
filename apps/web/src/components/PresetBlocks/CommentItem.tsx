import moment from 'moment'

import Text from '@/components/Texts/Text'
import { CourseComment } from '@/types'

import Box from '../Containters/Box'
import StarRating from '../Rating/StarRating'

const CommentItem = ({ comment }: { comment: CourseComment }): JSX.Element => {
  return (
    <Box>
      <Text>{comment.content}</Text>

      <StarRating rating={comment.rating ?? 0} />

      <Text>{moment(comment.createdAt).format('DD-MM-YYYY')}</Text>
    </Box>
  )
}

export default CommentItem
