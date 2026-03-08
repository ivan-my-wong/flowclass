import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

export const CustomToastContainer = () => (
  <ToastContainer
    position="bottom-right"
    autoClose={4000}
    toastStyle={{ lineHeight: 1.3 }}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnFocusLoss
    // draggable
    // pauseOnHover
  />
)
