// This is used to prevent the application from falling asleep
let lockResolver
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyNavigator = navigator as any

if (anyNavigator && anyNavigator.locks && anyNavigator.locks.request) {
  const promise = new Promise(res => {
    lockResolver = res
  })

  anyNavigator.locks.request('unique_lock_name', { mode: 'shared' }, () => {
    return promise
  })
}

export {}
