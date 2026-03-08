interface HookResult {
  isLoadingPermissionAndQuota: boolean
  checkQuota: (planType: string) => boolean
  checkPermission: (fieldName: string, planName: string) => boolean
}

const useCheckPermissionAndQuota = (): HookResult => ({
  checkQuota: () => true,
  checkPermission: () => true,
  isLoadingPermissionAndQuota: false,
})

export default useCheckPermissionAndQuota
