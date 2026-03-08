export const envLocalTagIds: Record<string, string> = {
  local: 'Uu02zs3cZkrtHA3F',
  dev: 'Uu02zs3cZkrtHA3F',
  development: 'Uu02zs3cZkrtHA3F',
  staging: 'gICefv2BfEiQ33Dd',
  production: 'E522k709Oi2n1zlO',
}

export const reminderTagId = 'vtVIlC67V99HmPHj'
export const schedulerTagId = 'puV1sMwwxU1nAfYw'

export const buildTagIds = (env: string) => {
  const envTagId = envLocalTagIds[env]
  if (!envTagId) {
    throw new Error(`Unsupported NODE_ENV "${env}"`)
  }
  return [reminderTagId, schedulerTagId, envTagId].map((d) => ({
    id: d,
  }))
}
