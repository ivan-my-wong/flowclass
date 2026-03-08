import { LucideMessageCircle } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import Box from '@/components/Containters/Box'
import Pagination from '@/components/Containters/Pagination'
import CommentItem from '@/components/PresetBlocks/CommentItem'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { useSchoolContext } from '@/stores/schoolContext'
import { CourseComment } from '@/types'

const CommentTab = (): JSX.Element => {
  const { t } = useTranslation()
  const { schoolContext } = useSchoolContext()
  const { schoolComments } = schoolContext

  return (
    <Box direction="col" className="min-h-80">
      <Heading align="center">{t('school:heading.comments')}</Heading>

      <Box>
        <LucideMessageCircle />
        <Text>{`${schoolComments?.length || 0} ${t('school:helperText.commentNumber')}`}</Text>
      </Box>
      <Box>
        {!schoolComments || schoolComments.length === 0 ? (
          <Text>{t('school:noComment')}</Text>
        ) : (
          <Pagination itemsPerPage={5}>
            {schoolComments.map((commentItem: CourseComment) => (
              <CommentItem key={commentItem.id} comment={commentItem} />
            ))}
          </Pagination>
        )}
      </Box>
    </Box>
  )
}

export default CommentTab
