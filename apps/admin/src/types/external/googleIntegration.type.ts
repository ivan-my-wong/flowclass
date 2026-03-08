// Corresponds to IntegrationGoogleEntity and GoogleSheetConfiguration in the backend

// ADDED Enum definition
export enum GoogleServiceType {
  SHEETS = 'SHEETS',
  CALENDAR = 'CALENDAR',
  MEET = 'MEET',
  DRIVE = 'DRIVE',
}

export enum GoogleSyncStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  UNKNOWN = 'UNKNOWN',
}

export enum GoogleSyncFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export type GoogleSyncConfiguration = {
  autoSync: boolean
  frequency: GoogleSyncFrequency
}

export type GoogleSheetTabConfiguration = {
  tabName: string
  dataType: 'STUDENT_CRM' | 'PAYMENT_PROOF' // Example data types
}

export interface GoogleSheetConfiguration {
  googleDriveFolderId?: string
  googleDriveFolderName?: string
  spreadsheetId?: string
  spreadsheetName?: string
  spreadsheetUrl?: string
  lastSyncStatus?: GoogleSyncStatus
  lastSyncTime?: string // ISO Date string
  tabsConfiguration?: Array<GoogleSheetTabConfiguration>
}

export interface GoogleIntegrationStatus {
  userId: string
  googleUserId?: string
  googleUserEmail?: string
  googleUserName?: string
  // Omitting tokens for security, they are backend only
  scopes?: string[]
  isActive: boolean
  sheetConfiguration?: GoogleSheetConfiguration
  createdAt: string // ISO Date string
  updatedAt: string // ISO Date string
}

export interface GoogleAuthUrlResponse {
  authUrl: string
  state: string
}

// Payload for creating/updating a sheet (sent to backend)
export interface CreateSheetPayload {
  googleDriveFolderId: string
  spreadsheetName: string
  // Potentially add initial tabs configuration here if backend supports it at creation
  // e.g., tabs: Array<{ tabName: string; dataType: 'STUDENT_CRM' | 'PAYMENT_PROOF' }>
}

// This might be the same as GoogleSheetConfiguration if the backend returns the full config
export type CreateSheetResponse = GoogleSheetConfiguration

// Payload for updating sheet configuration (e.g. sync options, tabs)
export interface UpdateSheetConfigurationPayload {
  spreadsheetId: string // Must identify which sheet to update
  googleDriveFolderId?: string // If moving the sheet
  spreadsheetName?: string // If renaming
  tabsConfiguration?: Array<GoogleSheetTabConfiguration>
  syncOptions?: GoogleSyncConfiguration
}

export type UpdateSheetConfigurationResponse = GoogleSheetConfiguration

// Payload for the frontend to send to the backend after Google OAuth callback
export interface HandleGoogleOAuthCallbackPayload {
  authCode: string
  serviceType: GoogleServiceType
  redirectUri: string // The exact redirect_uri used in the initial auth request
}

// Represents the generic Google integration entity structure returned by the backend
// This is a frontend type, so it might omit sensitive fields like tokens.
export interface IntegrationGoogleEntity {
  id: number
  userId: number // Or institutionId, depending on your backend model
  googleUserId: string
  googleUserEmail?: string
  serviceType: GoogleServiceType
  scopes?: string[]
  status: string // e.g., 'ENABLED', 'DISABLED', 'RESTRICTED' (maps to IntegrationConnectStatus)
  sheetSettings?: GoogleSheetConfiguration // Specific to Sheets integration
  calendarSettings?: {
    // Define more specifically if needed
    calendarId?: string
    calendarName?: string
  }
  meetSettings?: any // Define more specifically if needed
  redirectUri?: string // The redirect_uri associated with this integration
  createdAt: string // ISO Date string
  updatedAt: string // ISO Date string
  // Add other relevant fields that your backend returns for an integration
}

// DTOs for Google Integration (moved from src/api/external/googleIntegration.ts)
export interface HandleGoogleOAuthCallbackDto {
  authCode: string
  serviceType: GoogleServiceType
}

export interface DisconnectGoogleDto {
  serviceType: GoogleServiceType
}

// For Calendar Events (matching backend DTOs)
export interface CreateCalendarEventDto {
  summary: string
  description?: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  attendees?: Array<{ email: string }>
  conferenceData?: any
}
export type UpdateCalendarEventDto = Partial<CreateCalendarEventDto>

// For Calendar Token Refresh (matching backend DTOs)
export interface RefreshCalendarTokenDto {
  integrationId: number
  institutionId: number // As per controller, though backend might derive from user
}

// For Meet Events (matching backend DTOs)
export interface CreateMeetingEventDto {
  summary: string
  description?: string
  startDateTime: string // ISO string
  endDateTime: string // ISO string
  timeZone?: string
  createCalendarEvent?: boolean
}
export type UpdateMeetingEventDto = Partial<CreateMeetingEventDto>

// For Meet Token Refresh (matching backend DTOs)
export interface RefreshGoogleMeetTokenDto {
  integrationId: number
  institutionId: number // As per controller
}

// Drive-specific enums
export enum GoogleDrivePermissionRole {
  OWNER = 'owner',
  ORGANIZER = 'organizer',
  FILE_ORGANIZER = 'fileOrganizer',
  WRITER = 'writer',
  COMMENTER = 'commenter',
  READER = 'reader',
}

export enum GoogleDriveMimeType {
  FOLDER = 'application/vnd.google-apps.folder',
  DOCUMENT = 'application/vnd.google-apps.document',
  SPREADSHEET = 'application/vnd.google-apps.spreadsheet',
  PRESENTATION = 'application/vnd.google-apps.presentation',
  PDF = 'application/pdf',
  IMAGE = 'image/',
  VIDEO = 'video/',
  AUDIO = 'audio/',
}

export enum GoogleDriveFileStatus {
  ACTIVE = 'ACTIVE',
  TRASHED = 'TRASHED',
  DELETED = 'DELETED',
}

// Core Drive entities
export interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  webViewLink?: string
  webContentLink?: string
  thumbnailLink?: string
  iconLink?: string
  createdTime: string // ISO Date string
  modifiedTime: string // ISO Date string
  parents?: string[]
  owners?: Array<{
    displayName: string
    emailAddress: string
    photoLink?: string
  }>
  permissions?: Array<{
    id: string
    type: 'user' | 'group' | 'domain' | 'anyone'
    role: GoogleDrivePermissionRole
    emailAddress?: string
  }>
  shared?: boolean
  trashed?: boolean
  starred?: boolean
  description?: string
}

export interface GoogleDriveFolder extends Omit<GoogleDriveFile, 'size'> {
  mimeType: GoogleDriveMimeType.FOLDER
  childCount?: number
  hasSubfolders?: boolean
}

export interface GoogleDriveSearchResult {
  files: GoogleDriveFile[]
  nextPageToken?: string
  incompleteSearch?: boolean
}

// Drive integration configuration
export interface GoogleDriveConfiguration {
  rootFolderId?: string
  rootFolderName?: string
  rootFolderPath?: string
  folderStructure?: DriveEducationFolderStructure
  autoOrganization?: boolean
  syncSettings?: DriveSyncSettings
  quotaUsed?: string
  quotaLimit?: string
  lastSyncTime?: string
}

export interface DriveEducationFolderStructure {
  classFiles: {
    folderId: string
    folderName: string
    subfolders?: {
      assignments: string
      materials: string
      grades: string
    }
  }
  studentFiles: {
    folderId: string
    folderName: string
    subfolders?: {
      submissions: string
      feedback: string
      portfolios: string
    }
  }
  adminFiles?: {
    folderId: string
    folderName: string
    subfolders?: {
      reports: string
      templates: string
      backups: string
    }
  }
}

export interface DriveSyncSettings {
  autoSync: boolean
  syncFrequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY'
  conflictResolution: 'OVERWRITE' | 'RENAME' | 'SKIP'
  fileTypeFilters?: string[]
  maxFileSize?: number // in bytes
}

// API Payloads and DTOs
export interface DriveSetRootFolderPayloadDeprecated {
  folderId: string
  folderName: string
  createEducationStructure?: boolean
  folderStructure?: Partial<DriveEducationFolderStructure>
}

export interface DriveSetRootFolderPayload {
  rootFolderId: string
  rootFolderName: string
  createEducationStructure?: boolean
  folderStructure?: {
    classFiles?: string
    studentFiles?: string
  }
}

export interface DriveCreateFolderPayload {
  folderName: string
  parentFolderId?: string
  description?: string
}

export interface DriveFileUploadPayload {
  file: Blob | File
  parentFolderId?: string
  description?: string
  overwrite?: boolean
}

export interface DriveFileMovePayload {
  fileId: string
  newParentFolderId: string
  removeFromParents?: string[]
}

export interface DriveFileSharePayload {
  fileId: string
  emailAddress: string
  role: GoogleDrivePermissionRole
  message?: string
}

export interface DriveSearchPayload {
  query?: string
  parentFolderId?: string
  mimeType?: string
  pageSize?: number
  pageToken?: string
  orderBy?: 'name' | 'createdTime' | 'modifiedTime' | 'size'
  includeItemsFromAllDrives?: boolean
}

// Response types
export interface DriveCreateFolderResponse {
  folder: GoogleDriveFolder
  success: boolean
  message?: string
}

export interface DriveUploadResponse {
  file: GoogleDriveFile
  success: boolean
  uploadUrl?: string
  message?: string
}

export interface DriveDownloadResponse {
  downloadUrl: string
  fileName: string
  mimeType: string
  size?: string
}

// Integration status specific to Drive
export interface GoogleDriveIntegrationStatus {
  isConnected: boolean
  userEmail?: string
  userName?: string
  configuration?: GoogleDriveConfiguration
  permissions?: {
    canRead: boolean
    canWrite: boolean
    canShare: boolean
    canDelete: boolean
  }
  quotaInfo?: {
    used: string
    total: string
    usedPercentage: number
  }
  lastActivity?: string
  errors?: Array<{
    code: string
    message: string
    timestamp: string
  }>
}

// Breadcrumb for navigation
export interface DriveBreadcrumbItem {
  id: string
  name: string
  isRoot?: boolean
}

// File/Folder selection
export interface DriveItemSelection {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  mimeType: string
}

// Batch operations
export interface DriveBatchOperation {
  operation: 'copy' | 'move' | 'delete' | 'share'
  fileIds: string[]
  targetFolderId?: string
  shareSettings?: DriveFileSharePayload
}

export interface DriveBatchOperationResult {
  success: boolean
  results: Array<{
    fileId: string
    success: boolean
    error?: string
  }>
}

export interface GoogleDriveFoldersResponse {
  data: GoogleDriveFolder[]
  statusCode: number
  message: string
}

export interface GoogleDriveQuotaData {
  limit: number // Total storage quota (in bytes)
  usage: number // Total used storage (in bytes)
  usageInDrive: number // Used storage in Drive (excluding trash)
  usageInDriveTrash: number // Used storage in Drive trash
  percentageUsed: number // Percentage of quota used (0-100)
  remainingSpace: number // Remaining available space (in bytes)
}

export interface GoogleDriveQuotaResponse {
  data: GoogleDriveQuotaData
  statusCode: number
  message: string
}

export interface DriveValidatePermissionPayload {
  folderId: string
  checkWrite: string
}

export interface DriveValidatePermissionResponse {
  exists: boolean
  name: string
  hasWriteAccess: string
  isInRootHierarchy: string
  breadCrumb: DriveValidateFolderBreadcrumb
}

export interface DriveValidateFolderBreadcrumb {
  id: string
  name: string
}
