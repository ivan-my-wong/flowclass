import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

export const CustomToastContainer = () => (
  <ToastContainer
    position="top-right"
    autoClose={3000}
    toastStyle={{ top: '48px' }}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnFocusLoss
    // draggable
    // pauseOnHover
  />
)
