export enum BuildMode {
  OPEN_SOURCE = 'open-source',
}

export const OPEN_SOURCE_BUILD_MODE = BuildMode.OPEN_SOURCE

export const isOpenSourceBuild = (): boolean => true
