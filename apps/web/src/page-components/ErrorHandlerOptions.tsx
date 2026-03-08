import Spinner from '@/components/Loaders/Spinner'

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-dvh w-full items-center justify-center">{children}</div>
)

export const errorHandlerOptions = {
  loading: () => (
    <Wrapper>
      <Spinner />
    </Wrapper>
  ),
  fallback: (error: Error) => (
    <Wrapper>
      <div className="text-red-500">{error.message}</div>
    </Wrapper>
  ),
}
