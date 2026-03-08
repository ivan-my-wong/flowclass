import React, { useState } from 'react'

import SegmentedSwitch from './components/ui/SegmentedSwitch'

const TestSegmentedSwitch: React.FC = () => {
  const [value1, setValue1] = useState(true)
  const [value2, setValue2] = useState(false)
  const [value3, setValue3] = useState(true)

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        SegmentedSwitch Component Test
      </h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Basic Usage</h2>
          <SegmentedSwitch
            value={value1}
            onChange={setValue1}
            trueLabel="Yes"
            falseLabel="No"
            disabled={false}
          />
          <p className="mt-2 text-sm text-gray-600">
            Current value: {value1 ? 'Yes' : 'No'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Custom Labels</h2>
          <SegmentedSwitch
            value={value2}
            onChange={setValue2}
            trueLabel="Active"
            falseLabel="Inactive"
            disabled={false}
          />
          <p className="mt-2 text-sm text-gray-600">
            Current value: {value2 ? 'Active' : 'Inactive'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Disabled State</h2>
          <SegmentedSwitch
            value={value3}
            onChange={setValue3}
            trueLabel="Enabled"
            falseLabel="Disabled"
            disabled
          />
          <p className="mt-2 text-sm text-gray-600">This switch is disabled</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">With Custom Styling</h2>
          <SegmentedSwitch
            value={value1}
            onChange={setValue1}
            trueLabel="On"
            falseLabel="Off"
            disabled={false}
            className="border-blue-300 bg-blue-50"
          />
          <p className="mt-2 text-sm text-gray-600">Custom blue theme</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Accessibility Test</h2>
        <p className="text-sm text-gray-600 mb-4">
          Try using Tab to navigate and Space/Enter to toggle the switches.
          Screen readers should announce the current state and labels.
        </p>
        <div className="space-y-4">
          <SegmentedSwitch
            value={value1}
            onChange={setValue1}
            trueLabel="Dark Mode"
            falseLabel="Light Mode"
            disabled={false}
          />
          <SegmentedSwitch
            value={value2}
            onChange={setValue2}
            trueLabel="Notifications"
            falseLabel="Silent"
            disabled={false}
          />
        </div>
      </div>
    </div>
  )
}

export default TestSegmentedSwitch
