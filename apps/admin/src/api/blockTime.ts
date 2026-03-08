import { BlockTime, CreateBlockTimeProps } from '../types/settingBlockTime'

import apiClient from './index'

export const getAllExistBlockTimes = async (
  institutionId: string,
  siteId: string,
  num = 9999
): Promise<BlockTime[]> => {
  const res = await apiClient.get({
    url: '/admin/setting-block-time',
    needAuth: true,
    params: {
      num,
      institutionId,
      siteId,
    },
  })

  return res.data.data
}

export const getCurrentBlockTime = async (
  id: number,
  institutionId: string,
  siteId: string
): Promise<BlockTime> => {
  const res = await apiClient.get({
    url: '/admin/setting-block-time/detail',
    needAuth: true,
    params: {
      id,
      institutionId,
      siteId,
    },
  })

  return res.data.data
}

export const createBlockTime = async (
  blockTime: Partial<CreateBlockTimeProps>,
  institutionId: string,
  siteId: string
): Promise<any> => {
  const res = await apiClient.post({
    url: '/admin/setting-block-time',
    needAuth: true,
    params: {
      institutionId,
      siteId,
    },
    data: { ...blockTime },
  })

  return res.data.data
}
export const updateBlockTime = async (
  blockTime: Partial<CreateBlockTimeProps>,
  id: number,
  institutionId: string,
  siteId: string
): Promise<any> => {
  const res = await apiClient.put({
    url: `/admin/setting-block-time/${id}`,
    needAuth: true,
    params: {
      institutionId,
      siteId,
    },
    data: { ...blockTime },
  })

  return res.data.data
}

export const deleteBlockTime = async (
  id: number,
  institutionId: string,
  siteId: string
): Promise<BlockTime> => {
  const res = await apiClient.delete({
    needAuth: true,
    url: `/admin/setting-block-time/${id}`,
    params: {
      institutionId,
      siteId,
    },
  })

  return res.data.data
}
