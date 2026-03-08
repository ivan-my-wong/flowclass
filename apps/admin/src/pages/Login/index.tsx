import React from 'react'

import LoginLayout from '@/layouts/LoginLayout'

import LoginForm from './LoginForm'

const LoginPage: React.FC = () => {
  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  )
}

export default LoginPage
