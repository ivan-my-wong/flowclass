import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { IntegrationConnectStatus } from './enums/status'

export enum GoogleSyncStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

// Interface for the sheet configuration stored in the JSON column
export interface GoogleSheetConfiguration {
  selectedFolderId?: string
  selectedFolderName?: string // Optional: store name for easier display
  spreadsheetId?: string
  spreadsheetName?: string
  spreadsheetUrl?: string // Store the full URL for convenience
  lastSyncStatus?: GoogleSyncStatus
  lastSyncAt?: Date
  // Potentially add sync frequency, auto-sync toggle, specific tab IDs or titles if needed later
}

// Enum for different Google Service Types
export enum GoogleServiceType {
  SHEETS = 'SHEETS',
  CALENDAR = 'CALENDAR',
  MEET = 'MEET',
  DRIVE = 'DRIVE',
}

// Interface for Google Calendar specific settings
export interface GoogleCalendarServiceSettings {
  calendarId?: string // ID of the specific Google Calendar
  calendarName?: string // Name of the Google Calendar
  // Add other calendar-specific persistent settings if any
}

// Interface for Google Meet specific settings
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GoogleMeetServiceSettings {
  // Add any meet-specific persistent settings if they exist beyond common auth
  // For now, it seems empty as most are auth-related (top level) or transient
}

export interface GoogleDriveConfiguration {
  rootFolderId: string
  rootFolderName: string
}
export interface GoogleDriveServiceSettingsDeprecated {
  // Add any drive-specific persistent settings if they exist beyond common auth
  // For now, it seems empty as most are auth-related (top level) or transient
  rootFolderId?: string
  rootFolderName?: string
  folderStructure?: {
    targetFolderId: {
      folderId: string
    }
  }
}

export interface GoogleDriveServiceSettings {
  rootFolderId?: string
  rootFolderName?: string
  folderStructure?: {
    classFiles?: {
      folderId: string
      folderName: string
    }
    studentFiles?: {
      folderId: string
      folderName: string
    }
  }
  configuredAt?: Date
}

@Entity('integration_google')
export class IntegrationGoogleEntity extends BaseEntity {
  @Index(['userId', 'serviceType'])
  @Column({ name: 'user_id' })
  userId: number

  @Column({ name: 'institution_id', type: 'int', nullable: false })
  institutionId: number

  @Column({ name: 'google_user_id', type: 'varchar', length: 255, nullable: true })
  googleUserId?: string

  @Column({ name: 'google_user_email', type: 'varchar', length: 255, nullable: true })
  googleUserEmail?: string

  // In a real application, these tokens MUST be encrypted.
  @Column({ name: 'access_token', type: 'text' })
  accessToken: string

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken?: string

  @Column({ name: 'expiry_date', type: 'timestamp with time zone', nullable: true })
  expiryDate?: Date

  @Column({ name: 'scopes', type: 'text', array: true, nullable: true })
  scopes?: string[]

  @Column({ name: 'status', enum: IntegrationConnectStatus, type: 'varchar', nullable: true })
  status?: IntegrationConnectStatus

  // New column to identify the type of Google service integrated
  @Column({ name: 'service_type', enum: GoogleServiceType, type: 'varchar' })
  serviceType: GoogleServiceType

  // Split settings into three distinct JSONB columns
  @Column({ name: 'sheet_settings', type: 'jsonb', nullable: true })
  sheetSettings?: GoogleSheetConfiguration

  @Column({ name: 'calendar_settings', type: 'jsonb', nullable: true })
  calendarSettings?: GoogleCalendarServiceSettings

  @Column({ name: 'meet_settings', type: 'jsonb', nullable: true })
  meetSettings?: GoogleMeetServiceSettings

  @Column({ name: 'drive_settings', type: 'jsonb', nullable: true })
  driveSettings?: GoogleDriveServiceSettings
}

@Injectable()
export class IntegrationGoogleRepository extends BaseAbstractRepository<IntegrationGoogleEntity> {
  constructor(
    @InjectRepository(IntegrationGoogleEntity)
    repository: Repository<IntegrationGoogleEntity>
  ) {
    super(repository)
  }
}
