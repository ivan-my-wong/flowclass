import { useTranslation } from 'react-i18next'

import ContentLayout from '@/layouts/ContentLayout'

const ReceiptTemplates = () => {
  const { t } = useTranslation()
  return (
    <ContentLayout
      leftHeader={
        <div>
          <h1 className="text-xl font-bold">
            {t('component:menubar.receiptTemplates')}
          </h1>
        </div>
      }
    />
  )
}

export default ReceiptTemplates
