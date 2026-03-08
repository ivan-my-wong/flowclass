import { ComponentPropsWithoutRef } from 'react'

const Main = ({ children }: ComponentPropsWithoutRef<'main'>): JSX.Element => {
  return <main className="mx-auto my-0 flex w-full max-w-6xl">{children}</main>
}

export default Main
