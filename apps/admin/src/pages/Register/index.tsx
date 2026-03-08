import React from 'react'

import RegisterLayout from '@/layouts/RegisterLayout'
import RegisterForm from '@/pages/Register/RegisterForm'

const RegisterPage: React.FC = () => {
  return (
    <RegisterLayout>
      <RegisterForm />
    </RegisterLayout>
  )
}

export default RegisterPage
