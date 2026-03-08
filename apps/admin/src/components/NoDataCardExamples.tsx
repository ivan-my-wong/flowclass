import { FC } from 'react'

import NoDataCard from '@/components/NoDataCard'

// Contoh penggunaan NoDataCard dalam berbagai konteks
const NoDataCardExamples: FC = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold">NoDataCard Examples</h2>

      {/* Default */}
      <div>
        <h3 className="text-lg font-medium mb-2">Default</h3>
        <NoDataCard />
      </div>

      {/* Custom Message */}
      <div>
        <h3 className="text-lg font-medium mb-2">Custom Message</h3>
        <NoDataCard message="No submissions found for this lesson" />
      </div>

      {/* Students Variant */}
      <div>
        <h3 className="text-lg font-medium mb-2">Students Variant</h3>
        <NoDataCard variant="students" />
      </div>

      {/* Materials Variant */}
      <div>
        <h3 className="text-lg font-medium mb-2">Materials Variant</h3>
        <NoDataCard variant="materials" />
      </div>

      {/* Downloads Variant */}
      <div>
        <h3 className="text-lg font-medium mb-2">Downloads Variant</h3>
        <NoDataCard variant="downloads" />
      </div>

      {/* Uploads Variant */}
      <div>
        <h3 className="text-lg font-medium mb-2">Uploads Variant</h3>
        <NoDataCard variant="uploads" />
      </div>

      {/* Without Icon */}
      <div>
        <h3 className="text-lg font-medium mb-2">Without Icon</h3>
        <NoDataCard showIcon={false} message="Simple no data message" />
      </div>

      {/* Custom Styling */}
      <div>
        <h3 className="text-lg font-medium mb-2">Custom Styling</h3>
        <NoDataCard
          message="Custom styled card"
          className="bg-gray-50 border-gray-300"
        />
      </div>
    </div>
  )
}

export default NoDataCardExamples
