export interface MetaEmbeddedSignupInitiatePayload {
  institutionId: number
  isCoexistence?: boolean
}

export interface MetaEmbeddedSignupCompletePayload {
  institutionId: number
  authorizationCode: string
  state: string
  wabaId: string
  phoneNumberId?: string
  businessId?: string
}

export interface MetaEmbeddedSignupUpdatePayload {
  institutionId: number
  businessId?: string
  wabaId?: string
  wabaStatus?: string
  phoneNumberId?: string
  phoneNumberStatus?: string
  displayPhoneNumber?: string
  displayName?: string
  businessName?: string
  qualityRating?: string
  configurationId?: string
  embeddedSignupState?: string
  authorizationCode?: string
  accessToken?: string
  accessTokenExpiresAt?: string
  grantedScopes?: string[]
  isCoexistence?: boolean
  status?: string
  embeddedSignupPayload?: Record<string, any>
  provisioningStep?: string
  provisioningAttempts?: number
  lastErrorCode?: string
  lastErrorMessage?: string
  stateExpiresAt?: string
}

export interface MetaEmbeddedSignupRecord
  extends MetaEmbeddedSignupUpdatePayload {
  id?: number
  createdAt?: string
  updatedAt?: string
  embeddedSignupUrl?: string
  loginUrl?: string
  url?: string
  redirectUrl?: string
  authorizationUrl?: string
}

export interface MetaEmbeddedSignupConfiguration {
  appId?: string
  configurationId?: string
  redirectUri?: string
  graphApiVersion?: string
  scopes?: string[]
  state?: string
}

export interface MetaEmbeddedSignupInitiateResponse {
  configuration?: MetaEmbeddedSignupConfiguration
  embeddedSignup?: MetaEmbeddedSignupRecord
  configurationId?: string
  embeddedSignupState?: string
}

export interface MetaWhatsAppProfile {
  name?: string
  about?: string
  address?: string
  description?: string
  email?: string
  websites?: string[]
  vertical?: string
  logoUrl?: string
  profilePictureUrl?: string
}

export interface UpdateMetaWhatsAppProfileDto {
  about?: string
  address?: string
  description?: string
  email?: string
  websites?: string[]
  vertical?: string
}

export type MetaCoexistenceSyncCheckpoint = {
  id: number
  syncType: 'contacts' | 'history' | 'message_echoes'
  status: 'in_progress' | 'completed' | 'failed'
  phase?: number
  chunkOrder?: number
  progress?: number
  processedItems: number
  lastEventAt?: string
  lastError?: string
}

export type MetaCoexistenceSyncStatus = {
  isCoexistence: boolean
  checkpoints: MetaCoexistenceSyncCheckpoint[]
}
