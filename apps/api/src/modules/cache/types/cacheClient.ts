export type ICacheRepository = {
  get(key: string): Promise<string | null>
  getJSON(key: string): Promise<Record<string, any> | null>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
  setWithExpiry(key: string, value: string, expiry: number): Promise<void>
}
