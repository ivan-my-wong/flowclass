import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { Card, CardContent } from '@/components/ui/Card'
import { PreviewLessonsType } from '@/types/paymentProof'

import TablePreviewLessons from './TablePreviewLessons'

type Props = {
  lessons: PreviewLessonsType[]
}
const PreviewLessons = ({ lessons }: Props): JSX.Element => {
  const { t } = useTranslation(['student'])
  return (
    <div className="mt-4">
      <h3 className="text-base font-semibold">
        {t('student:automations.previewLessonsAndStudents')}
      </h3>
      <Card className="mt-2 p-4">
        <CardContent className="p-0">
          {lessons.length > 0 &&
            lessons.map(item => (
              <Fragment key={item.class?.id}>
                <h3>{item.class?.name}</h3>
                <Card className="mt-4">
                  <CardContent className="p-0">
                    <TablePreviewLessons lessons={item.lessons} />
                  </CardContent>
                </Card>
              </Fragment>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
export default PreviewLessons
