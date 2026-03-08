import { Outlet } from 'react-router-dom'

const BlankLayout = () => {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4 md:p-6">
      <Outlet />
    </div>
  )
}

export default BlankLayout
