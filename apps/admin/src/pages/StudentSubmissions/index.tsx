import { useState } from 'react'

import { TabsContent } from '@radix-ui/react-tabs'
import { useTranslation } from 'react-i18next'
import { FaBook } from 'react-icons/fa'
import { LuFileText } from 'react-icons/lu'

import Heading from '@/components/Texts/Heading'
import { Separator } from '@/components/ui/Separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import ContentLayout from '@/layouts/ContentLayout'
import { cn } from '@/utils/cn'

import SubmissionByFile from './components/File/SubmissionByFile'
import SubmissionByLesson from './components/Lesson/SubmissionByLesson'

const StudentSubmissions = (): JSX.Element => {
  const { t } = useTranslation(['studentSubmission'])
  const [activeTab, setActiveTab] = useState<string>('by_file')
  return (
    <ContentLayout
      leftHeader={<Heading>{t('title')}</Heading>}
      // rightHeader={
      //   <Button onClick={() => setOpenDialogBulkUpload(true)}>
      //     Bulk Upload
      //   </Button>
      // }
    >
      <div className="w-full px-4">
        <Tabs
          activationMode="manual"
          value={activeTab}
          onValueChange={active => setActiveTab(active)}
          className="w-full mx-auto pt-4"
        >
          <TabsList className="h-auto py-0">
            <TabsTrigger
              value="by_file"
              className={cn(
                'font-medium w-36 text-sm text-gray-500 !shadow-none !bg-transparent rounded-none border-b-2 border-b-transparent',
                activeTab === 'by_file' && 'border-blue-600  !text-blue-600'
              )}
            >
              <LuFileText size={16} className="mr-2" />
              {t('byFile')}
            </TabsTrigger>
            <TabsTrigger
              value="by_lessons"
              className={cn(
                'font-medium w-36 text-gray-500 !shadow-none !bg-transparent rounded-none border-b-2 border-b-transparent',
                activeTab === 'by_lessons' && 'border-blue-600  !text-blue-600'
              )}
            >
              <FaBook size={16} className="mr-2" />
              {t('byLesson')}
            </TabsTrigger>
          </TabsList>
          <Separator className="bg-gray-200" />
          <div className="pt-6">
            <TabsContent value="by_file">
              <SubmissionByFile />
            </TabsContent>
            <TabsContent value="by_lessons">
              <SubmissionByLesson />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ContentLayout>
  )
}

export default StudentSubmissions
