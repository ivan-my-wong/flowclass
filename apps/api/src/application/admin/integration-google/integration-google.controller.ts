/* eslint-disable no-useless-catch */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  PayloadTooLargeException,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { FilesInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ConnectedSocket, MessageBody, SubscribeMessage } from '@nestjs/websockets'
import { Response } from 'express'
import { calendar_v3 } from 'googleapis/build/src/apis/calendar/v3'
import { Socket } from 'socket.io'

// DTOs - paths might need verification based on actual project structure
import {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
} from '@/application/admin/availability/dto/calendar-event.dto'
import { RefreshGoogleTokenDto as RefreshCalendarTokenDto } from '@/application/admin/availability/dto/refresh-google-token.dto'
import { ALLOWED_MIME_TYPES } from '@/common/constants/files.constants'
import { GOOGLE_DRIVE_UPLOAD_LIMITS } from '@/common/constants/google-drive.constant'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import {
  GoogleDriveFileUpload,
  IntegrationGoogleService,
} from '@/domain/external/integration-google.service'
// DTOs for Sheets (New - define if not existing, or adjust path)
import { GoogleDriveFile } from '@/domain/external/integration-google.service'
import { UploadProgress, UploadProgressService } from '@/domain/external/upload-progress'
import { RequireParam, Role } from '@/models/enums'
import {
  GoogleDriveServiceSettings,
  GoogleServiceType,
  GoogleSheetConfiguration,
  IntegrationGoogleEntity,
} from '@/models/integration-google.entity'
import { User } from '@/models/user.entity'

import { CreateIntegrationCalendarDto } from '../availability/dto/create-integration-calendar.dto'
import { UpdateIntegrationCalendarDto } from '../availability/dto/update-integration-calendar.dto'

import { CreateGoogleSheetDto } from './dto/create-google-sheet.dto'
import { CreateIntegrationOnlineMeetingDto } from './dto/create-online-meeting.dto'
import { DisconnectGoogleDto } from './dto/disconnect-google.dto'
import {
  CreateFolderDto,
  DownloadByUrlDto,
  GoogleDriveUploadDto,
  SetDriveRootFolderDto,
} from './dto/google-drive.dto'
import { HandleGoogleOAuthCallbackDto } from './dto/handle-google-oauth-callback.dto'
import { CreateMeetingEventDto, UpdateMeetingEventDto } from './dto/meeting-event.dto'
import { RefreshGoogleMeetTokenDto } from './dto/refresh-google-token.dto'
import { UpdateIntegrationOnlineMeetingDto } from './dto/update-online-meeting.dto'

@ApiUnauthorizedResponse({ description: 'User not authenticated.' })
@ApiResponse({ status: 500, description: 'System error.' })
@ApiTags('Google Integrations')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('integrations/google') // Main controller path
export class IntegrationGoogleController {
  private readonly uploadQueue = new Map<string, number>()
  private readonly MAX_CONCURRENT_UPLOADS_PER_USER = 2

  constructor(
    private readonly integrationGoogleService: IntegrationGoogleService,
    private readonly uploadProgressService: UploadProgressService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Get('auth-url')
  @ApiOperation({ summary: 'Get Google OAuth2 URL' })
  @ApiQuery({
    name: 'scopes',
    type: [String],
    description: 'Array of Google scopes',
    example: ['https://www.googleapis.com/auth/drive.file'],
  })
  @ApiQuery({
    name: 'serviceType',
    enum: GoogleServiceType,
    description: 'Google service type',
  })
  @ApiQuery({
    name: 'redirectUri',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'userId',
    type: Number,
    required: false,
    description: 'User ID (falls back to authenticated user)',
  })
  getGoogleAuthUrl(
    @Query('scopes') rawScopes: string | string[],
    @Query('serviceType') serviceType: GoogleServiceType,
    @Query('redirectUri') redirectUri?: string,
    @Query('userId') userIdStr?: string,
    @CurrentUser() user?: User
  ): { authUrl: string; state: string } {
    console.log('🎯 [CONTROLLER] GET /auth-url hit')
    console.log('📋 Query params:', {
      rawScopes,
      serviceType,
      redirectUri,
      userIdStr,
      authenticatedUserId: user?.id,
    })

    const scopes = this.parseScopes(rawScopes)
    if (!scopes || scopes.length === 0) {
      throw new BadRequestException('At least one scope is required')
    }

    if (!serviceType || !Object.values(GoogleServiceType).includes(serviceType)) {
      throw new BadRequestException('Valid serviceType is required')
    }

    if (redirectUri && !this.isValidUrl(redirectUri)) {
      throw new BadRequestException('Invalid redirectUri format')
    }

    const userId = userIdStr ? parseInt(userIdStr, 10) : user?.id

    if (!userId) {
      throw new BadRequestException(
        'User ID is required for OAuth flow. Please login or provide userId parameter.'
      )
    }

    console.log('✅ Using userId:', userId)

    const result = this.integrationGoogleService.getGoogleAuthUrl(
      scopes,
      serviceType,
      redirectUri,
      userId
    )

    console.log('✅ Generated authUrl with state:', result.state)

    return result
  }

  private parseScopes(rawScopes: string | string[]): string[] {
    if (Array.isArray(rawScopes)) {
      return rawScopes
    }
    if (typeof rawScopes === 'string') {
      return rawScopes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    return []
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  @Post('oauth-callback')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Handle Google OAuth2 callback' })
  async handleGoogleOAuthCallback(
    @Body() callbackDto: HandleGoogleOAuthCallbackDto,
    @CurrentUser() user: User
  ): Promise<IntegrationGoogleEntity> {
    // Assuming user.id is the institutionId or relevant userId for the integration
    return this.integrationGoogleService.handleGoogleOAuthCallback(
      callbackDto.authCode,
      user.id, // This needs to be the correct user/institution identifier
      callbackDto.serviceType,
      callbackDto.redirectUri // Pass redirectUri
    )
  }

  @Post('disconnect')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Disconnect a Google service integration',
    description:
      'Soft-deletes the integration and revokes tokens if no other services are connected',
  })
  async disconnectGoogleIntegration(
    @Body() disconnectDto: DisconnectGoogleDto,
    @CurrentUser() user: User
  ): Promise<{ message: string; tokensRevoked: boolean }> {
    console.log('🔌 Disconnecting Google integration:', {
      userId: user.id,
      serviceType: disconnectDto.serviceType,
    })

    const result = await this.integrationGoogleService.disconnectGoogleIntegration(
      user.id,
      disconnectDto.serviceType
    )

    console.log('✅ Disconnect successful:', result)

    return result
  }

  // --- Google Sheets Specific Routes ---
  @Get('sheets/status')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get Google Sheets integration status' })
  async getSheetIntegrationStatus(
    @CurrentUser() user: User
  ): Promise<Partial<IntegrationGoogleEntity>> {
    return this.integrationGoogleService.getSheetIntegrationStatus(user.id)
  }

  @Get('sheets/drive/folders')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List Google Drive folders (for Sheets integration)' })
  async listGoogleDriveFolders(@CurrentUser() user: User): Promise<GoogleDriveFile[]> {
    return this.integrationGoogleService.listGoogleDriveFolders(user.id)
  }

  @Post('sheets/sheet')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create or update a Google Sheet' })
  @ApiBody({ type: CreateGoogleSheetDto })
  async createOrUpdateGoogleSheet(
    @Body() createSheetDto: CreateGoogleSheetDto,
    @CurrentUser() user: User
  ): Promise<GoogleSheetConfiguration> {
    // The service method expects GoogleSheetUserConfig, ensure DTO matches or transform
    return this.integrationGoogleService.createOrUpdateSheet(user.id, createSheetDto)
  }

  // --- Google Calendar Specific Routes ---
  @Get('calendar/connections')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID) // This decorator might be from the old controller
  @UseGuards(RequireParamsGuard)
  @ApiOperation({ summary: 'Get all calendar connections for an institution' })
  @ApiQuery({ name: 'institutionId', type: Number, description: 'ID of the institution' })
  async getCalendarConnections(
    @Query('institutionId', ParseIntPipe) institutionId: number
  ): Promise<IntegrationGoogleEntity[]> {
    return this.integrationGoogleService.findCalendarIntegrationsByInstitution(institutionId)
  }

  @Post('calendar/connections')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new calendar connection' })
  @ApiBody({ type: CreateIntegrationCalendarDto })
  async createCalendarConnection(
    @Body() createDto: CreateIntegrationCalendarDto
  ): Promise<IntegrationGoogleEntity> {
    return this.integrationGoogleService.createCalendarIntegration(createDto)
  }

  @Get('calendar/connections/:id')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get a calendar connection by ID' })
  @ApiParam({ name: 'id', description: 'Calendar connection ID' })
  async getCalendarConnection(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IntegrationGoogleEntity> {
    const connection = await this.integrationGoogleService.findOneCalendarIntegration(id)
    if (!connection) {
      throw new BadRequestException('Calendar connection not found')
    }
    return connection
  }

  @Patch('calendar/connections/:id')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a calendar connection' })
  @ApiParam({ name: 'id', description: 'Calendar connection ID' })
  @ApiBody({ type: UpdateIntegrationCalendarDto })
  async updateCalendarConnection(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateIntegrationCalendarDto
  ): Promise<IntegrationGoogleEntity> {
    return this.integrationGoogleService.updateCalendarIntegration(id, updateDto)
  }

  @Delete('calendar/connections/:id')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a calendar connection' })
  @ApiParam({ name: 'id', description: 'Calendar connection ID' })
  async deleteCalendarConnection(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.integrationGoogleService.removeCalendarIntegration(id)
  }

  @Patch('calendar/connections/:id/toggle')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Toggle a calendar connection enabled/disabled status' })
  @ApiParam({ name: 'id', description: 'Calendar connection ID' })
  async toggleCalendarConnectionStatus(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IntegrationGoogleEntity> {
    return this.integrationGoogleService.toggleCalendarIntegration(id)
  }

  @Get('calendar/connections/:id/calendars')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List Google Calendars for a connection' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  async getGoogleCalendarList(
    @Param('id', ParseIntPipe) integrationId: number
  ): Promise<calendar_v3.Schema$CalendarList> {
    return this.integrationGoogleService.getGoogleCalendarList(integrationId)
  }

  @Get('calendar/connections/:integrationId/events')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get events from a Google Calendar' })
  @ApiParam({ name: 'integrationId', description: 'Calendar integration ID' })
  @ApiQuery({ name: 'calendarApiId', description: 'Google Calendar API ID (e.g., primary)' })
  @ApiQuery({ name: 'startDate', description: 'Start date ISO string', required: false })
  @ApiQuery({ name: 'endDate', description: 'End date ISO string', required: false })
  async listCalendarEvents(
    @Param('integrationId', ParseIntPipe) integrationId: number,
    @Query('calendarApiId') calendarApiId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accessToken') accessToken?: string // Optional access token override for specific scenarios
  ) {
    const start = startDate ? new Date(startDate) : new Date()
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)
    return this.integrationGoogleService.listCalendarEvents(
      integrationId,
      calendarApiId,
      start,
      end,
      accessToken
    )
  }

  @Post('calendar/connections/:integrationId/events')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create an event in a Google Calendar' })
  @ApiParam({ name: 'integrationId', description: 'Calendar integration ID' })
  @ApiQuery({ name: 'calendarApiId', description: 'Google Calendar API ID' })
  @ApiBody({ type: CreateCalendarEventDto })
  async createCalendarEvent(
    @Param('integrationId', ParseIntPipe) integrationId: number,
    @Query('calendarApiId') calendarApiId: string,
    @Body() eventData: CreateCalendarEventDto
  ) {
    return this.integrationGoogleService.createCalendarEvent(
      integrationId,
      calendarApiId,
      eventData
    )
  }

  @Get('calendar/connections/:integrationId/events/:eventId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get a specific event from a Google Calendar' })
  @ApiParam({ name: 'integrationId', description: 'Calendar integration ID' })
  @ApiParam({ name: 'eventId', description: 'Google Calendar event ID' })
  @ApiQuery({ name: 'calendarApiId', description: 'Google Calendar API ID' })
  async getCalendarEvent(
    @Param('integrationId', ParseIntPipe) integrationId: number,
    @Param('eventId') eventId: string,
    @Query('calendarApiId') calendarApiId: string
  ) {
    return this.integrationGoogleService.getCalendarEvent(integrationId, calendarApiId, eventId)
  }

  @Patch('calendar/connections/:integrationId/events/:eventId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update an event in a Google Calendar' })
  @ApiParam({ name: 'integrationId', description: 'Calendar integration ID' })
  @ApiParam({ name: 'eventId', description: 'Google Calendar event ID' })
  @ApiQuery({ name: 'calendarApiId', description: 'Google Calendar API ID' })
  @ApiBody({ type: UpdateCalendarEventDto })
  async updateCalendarEvent(
    @Param('integrationId', ParseIntPipe) integrationId: number,
    @Param('eventId') eventId: string,
    @Query('calendarApiId') calendarApiId: string,
    @Body() eventData: UpdateCalendarEventDto
  ) {
    return this.integrationGoogleService.updateCalendarEvent(
      integrationId,
      calendarApiId,
      eventId,
      eventData
    )
  }

  @Delete('calendar/connections/:integrationId/events/:eventId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete an event from a Google Calendar' })
  @ApiParam({ name: 'integrationId', description: 'Calendar integration ID' })
  @ApiParam({ name: 'eventId', description: 'Google Calendar event ID' })
  @ApiQuery({ name: 'calendarApiId', description: 'Google Calendar API ID' })
  async deleteCalendarEvent(
    @Param('integrationId', ParseIntPipe) integrationId: number,
    @Param('eventId') eventId: string,
    @Query('calendarApiId') calendarApiId: string
  ): Promise<void> {
    return this.integrationGoogleService.deleteCalendarEvent(integrationId, calendarApiId, eventId)
  }

  @Post('calendar/refresh-token')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Refresh Google Calendar token' })
  @ApiBody({ type: RefreshCalendarTokenDto })
  async refreshCalendarToken(
    @Body() refreshTokenDto: RefreshCalendarTokenDto
  ): Promise<IntegrationGoogleEntity> {
    return this.integrationGoogleService.refreshCalendarToken(refreshTokenDto)
  }

  // --- Google Meet Specific Routes ---
  @Get('meet/connections')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({ summary: 'Get all online meeting connections for an institution' })
  @ApiQuery({ name: 'institutionId', type: Number, description: 'ID of the institution' })
  async getMeetConnections(
    @Query('institutionId', ParseIntPipe) institutionId: number
  ): Promise<IntegrationGoogleEntity[]> {
    return this.integrationGoogleService.findMeetIntegrationsByInstitution(institutionId)
  }

  @Post('meet/connections')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new online meeting connection' })
  @ApiBody({ type: CreateIntegrationOnlineMeetingDto })
  async createMeetConnection(
    @Body() createDto: CreateIntegrationOnlineMeetingDto
  ): Promise<IntegrationGoogleEntity> {
    return this.integrationGoogleService.createMeetIntegration(createDto)
  }

  @Get('meet/connections/:id')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get an online meeting connection by ID' })
  @ApiParam({ name: 'id', description: 'Online meeting connection ID' })
  async getMeetConnection(@Param('id', ParseIntPipe) id: number): Promise<IntegrationGoogleEntity> {
    const connection = await this.integrationGoogleService.findOneMeetIntegration(id)
    if (!connection) {
      throw new BadRequestException('Online meeting connection not found')
    }
    return connection
  }

  @Patch('meet/connections/:id')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update an online meeting connection' })
  @ApiParam({ name: 'id', description: 'Online meeting connection ID' })
  @ApiBody({ type: UpdateIntegrationOnlineMeetingDto })
  async updateMeetConnection(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateIntegrationOnlineMeetingDto
  ): Promise<IntegrationGoogleEntity> {
    return this.integrationGoogleService.updateMeetIntegration(id, updateDto)
  }

  @Delete('meet/connections/:id')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete an online meeting connection' })
  @ApiParam({ name: 'id', description: 'Online meeting connection ID' })
  async deleteMeetConnection(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.integrationGoogleService.removeMeetIntegration(id)
  }

  @Patch('meet/connections/:id/toggle')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Toggle an online meeting connection status' })
  @ApiParam({ name: 'id', description: 'Online meeting connection ID' })
  async toggleMeetConnectionStatus(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IntegrationGoogleEntity> {
    return this.integrationGoogleService.toggleMeetIntegration(id)
  }

  @Get('meet/connections/:integrationId/meetings')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get meetings from an online meeting connection (via Calendar)' })
  @ApiParam({ name: 'integrationId', description: 'Meet integration ID' })
  async getMeetMeetings(@Param('integrationId', ParseIntPipe) integrationId: number) {
    return this.integrationGoogleService.getMeetMeetings(integrationId)
  }

  @Post('meet/connections/:integrationId/meetings')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new meeting in Google Meet and optionally a Calendar event' })
  @ApiParam({ name: 'integrationId', description: 'Meet integration ID' })
  @ApiBody({ type: CreateMeetingEventDto })
  async createMeetMeetingAndEvent(
    @Param('integrationId', ParseIntPipe) integrationId: number,
    @Body() meetingData: CreateMeetingEventDto
  ) {
    return this.integrationGoogleService.createMeetMeetingAndEvent(integrationId, meetingData)
  }

  @Get('meet/connections/:integrationId/meetings/:meetingName')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get a specific Google Meet space by its name' })
  @ApiParam({ name: 'integrationId', description: 'Meet integration ID' })
  @ApiParam({ name: 'meetingName', description: 'Google Meet space name (e.g., spaces/xxxx)' })
  async getMeetSpace(
    @Param('integrationId', ParseIntPipe) integrationId: number,
    @Param('meetingName') meetingName: string
  ) {
    return this.integrationGoogleService.getMeetSpace(integrationId, meetingName)
  }

  @Patch('meet/connections/:integrationId/meetings/:meetingName')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a meeting (primarily its Calendar event)' })
  @ApiParam({ name: 'integrationId', description: 'Meet integration ID' })
  @ApiParam({ name: 'meetingName', description: 'Google Meet space name (e.g., spaces/xxxx)' })
  @ApiBody({ type: UpdateMeetingEventDto })
  async updateMeetMeeting(
    @Param('integrationId', ParseIntPipe) integrationId: number,
    @Param('meetingName') meetingName: string,
    @Body() meetingData: UpdateMeetingEventDto
  ) {
    // Note: The service method for updating meet meetings has limitations.
    return this.integrationGoogleService.updateMeetMeeting(integrationId, meetingName, meetingData)
  }

  @Delete('meet/connections/:integrationId/meetings/:meetingName')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Delete a Google Meet meeting (ends conference, attempts calendar event deletion)',
  })
  @ApiParam({ name: 'integrationId', description: 'Meet integration ID' })
  @ApiParam({ name: 'meetingName', description: 'Google Meet space name (e.g., spaces/xxxx)' })
  async deleteMeetMeeting(
    @Param('integrationId', ParseIntPipe) integrationId: number,
    @Param('meetingName') meetingName: string
  ): Promise<{ success: boolean }> {
    return this.integrationGoogleService.deleteMeetMeeting(integrationId, meetingName)
  }

  @Post('meet/refresh-token')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Refresh Google Meet token' })
  @ApiBody({ type: RefreshGoogleMeetTokenDto })
  async refreshMeetToken(
    @Body() refreshTokenDto: RefreshGoogleMeetTokenDto
  ): Promise<IntegrationGoogleEntity> {
    return this.integrationGoogleService.refreshMeetToken(refreshTokenDto)
  }

  // --- Google Drive Specific Routes ---

  @Get('google-drive-callback')
  @Public()
  async handleGoogleDriveCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
    @Query('error') error?: string
  ) {
    console.log('🔑 Received OAuth callback')
    console.log('📋 State:', state)
    console.log('📋 Code:', code ? `${code.substring(0, 10)}...` : 'missing')

    try {
      if (error) {
        console.error('❌ OAuth Error:', error)
        return res.redirect(
          `${
            process.env.NEXT_PUBLIC_WEB_BASE_URL
          }/integrations/google-drive?error=${encodeURIComponent(error)}`
        )
      }

      if (!code) {
        console.error('❌ No authorization code')
        return res.redirect(
          `${process.env.NEXT_PUBLIC_WEB_BASE_URL}/integrations/google-drive?error=no_code`
        )
      }

      // ✅ Extract userId from state
      const userId = this.extractUserIdFromState(state)
      if (!userId) {
        console.error('❌ Invalid state - cannot extract userId:', state)
        console.error('❌ State format should be: user_{userId}|{random}')
        return res.redirect(
          `${process.env.NEXT_PUBLIC_WEB_BASE_URL}/integrations/google-drive?error=invalid_state`
        )
      }

      console.log('✅ Extracted userId:', userId)

      await this.integrationGoogleService.handleGoogleOAuthCallback(
        code,
        userId,
        GoogleServiceType.DRIVE,
        process.env.GOOGLE_OAUTH_REDIRECT_URI
      )

      console.log('✅ OAuth success, redirecting to frontend')

      return res.redirect(
        `${process.env.NEXT_PUBLIC_WEB_BASE_URL}/integrations/google-drive?status=connected`
      )
    } catch (err) {
      console.error('❌ OAuth callback failed:', err)
      const errorMessage = encodeURIComponent(err.message || 'unknown_error')
      return res.redirect(
        `${process.env.NEXT_PUBLIC_WEB_BASE_URL}/integrations/google-drive?error=${errorMessage}`
      )
    }
  }

  /**
   * Extract userId from state parameter
   * Expected format: "user_{userId}|{randomString}"
   * Example: "user_123|1214744202174155217124"
   */
  private extractUserIdFromState(state: string): number | null {
    if (!state) {
      console.error('❌ State is missing')
      return null
    }

    try {
      // Try to match pattern: user_123
      const match = state.match(/user_(\d+)/)

      if (match && match[1]) {
        const userId = parseInt(match[1], 10)
        console.log('✅ Successfully extracted userId:', userId)
        return userId
      }

      console.error('❌ State does not match expected pattern "user_{userId}|{random}"')
      console.error('❌ Received state:', state)
      return null
    } catch (error) {
      console.error('❌ Error parsing state:', error)
      return null
    }
  }

  @Get('drive/status')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get Google Drive integration status' })
  async getDriveIntegrationStatus(
    @Query('institutionId', ParseIntPipe) institutionId: number
  ): Promise<any> {
    return this.integrationGoogleService.getDriveIntegrationStatus(institutionId)
  }

  @Get('drive/folders')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List Google Drive folders' })
  @ApiQuery({
    name: 'parentFolderId',
    required: false,
    description: 'Parent folder ID to list subfolders',
  })
  async listGoogleDriveFoldersForDrive(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Query('parentFolderId') parentFolderId?: string
  ): Promise<GoogleDriveFile[]> {
    return this.integrationGoogleService.listGoogleDriveFoldersForDrive(
      institutionId,
      parentFolderId
    )
  }

  @Post('drive/folders')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new folder in Google Drive' })
  @ApiBody({ type: CreateFolderDto })
  async createGoogleDriveFolder(
    @CurrentUser() user: User,
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Body() body: CreateFolderDto
  ): Promise<GoogleDriveFile> {
    if (body.parentFolderId) {
      const hasAccess = await this.integrationGoogleService.validateFolderWriteAccess(
        institutionId,
        body.parentFolderId
      )
      if (!hasAccess) {
        throw new ForbiddenException('No write access to the specified parent folder')
      }
    }

    return this.integrationGoogleService.createGoogleDriveFolder({
      userId: user.id,
      institutionId,
      folderName: body.folderName,
      parentFolderId: body.parentFolderId,
    })
  }

  @Post('drive/root-folder')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Set Google Drive root folder (irreversible action)' })
  @ApiBody({ type: SetDriveRootFolderDto })
  async setDriveRootFolder(
    @CurrentUser() user: User,
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Body()
    config: {
      rootFolderId: string
      rootFolderName: string
      folderStructure?: {
        classFiles?: string
        studentFiles?: string
      }
    }
  ): Promise<GoogleDriveServiceSettings> {
    // const hasAccess = await this.integrationGoogleService.testAndValidateWriteAccess(
    //   user.id,
    //   config.rootFolderId
    // );
    // if (!hasAccess) {
    //   throw new ForbiddenException('Cannot write to selected root folder. Please choose another.');
    // }

    return this.integrationGoogleService.setDriveRootFolder(institutionId, config)
  }

  @Get('drive/files')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List files in Google Drive folder' })
  @ApiQuery({
    name: 'folderId',
    required: false,
    description: 'Folder ID (defaults to root folder)',
  })
  @ApiQuery({ name: 'mimeTypeFilter', required: false, description: 'Filter by MIME type' })
  async listFilesInDriveFolder(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Query('folderId') folderId?: string,
    @Query('mimeTypeFilter') mimeTypeFilter?: string
  ): Promise<GoogleDriveFile[]> {
    return this.integrationGoogleService.listFilesInDriveFolder(
      institutionId,
      folderId,
      mimeTypeFilter
    )
  }

  @Post('drive/upload')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FilesInterceptor('files', GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_FILE_COUNT, {
      limits: {
        fileSize: GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_FILE_SIZE,
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload single or multiple files to Google Drive' })
  @ApiBody({
    description: 'File upload payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of files to upload (max 10)',
        },
        fileNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional custom names for each file (must match file count)',
          example: ['report.pdf', 'image.png'],
        },
        targetFolder: {
          type: 'string',
          enum: ['classFiles', 'studentFiles'],
          description: 'Target folder category',
          example: 'classFiles',
        },
        parentFolderId: {
          type: 'string',
          description: 'Google Drive parent folder ID (optional)',
          example: '1A2B3C4D5E6F7G8H9I0J',
        },
      },
      required: ['files'], // Only files is required
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns array of uploaded file info with success/error status',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1AbCdEfGhIjKlMnOpQrSt' },
          name: { type: 'string', example: 'report.pdf' },
          mimeType: { type: 'string', example: 'application/pdf' },
          webViewLink: { type: 'string', example: 'https://drive.google.com/file/d/...' },
          success: { type: 'boolean', example: true },
          error: { type: 'string', example: null },
        },
      },
    },
  })
  async uploadFilesToDrive(
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Body() body: GoogleDriveUploadDto,
    @Query('checkQuota') checkQuota?: boolean
  ): Promise<Array<GoogleDriveFile & { success: boolean; error?: string }>> {
    if (checkQuota) {
      const quota = await this.integrationGoogleService.getDriveQuotaInfo(user.id)
      const totalSize = files.reduce((sum, f) => sum + f.size, 0)

      if (quota.usageInDrive + totalSize > quota.limit) {
        throw new BadRequestException(
          `Insufficient Google Drive storage. You need ${Math.ceil(
            totalSize / 1024 ** 2
          )} MB more space.`
        )
      }
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required')
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files allowed per upload')
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0)

    if (totalSize > GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_TOTAL_SIZE) {
      throw new PayloadTooLargeException(
        `Total upload size (${(totalSize / 1024 ** 2).toFixed(2)} MB) exceeds limit of ${
          GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_TOTAL_SIZE / 1024 ** 2
        } MB`
      )
    }

    if (body.fileNames && body.fileNames.length !== files.length) {
      throw new BadRequestException('Number of fileNames must match number of files')
    }

    const filesData: GoogleDriveFileUpload[] = files.map((file, index) => ({
      name: body.fileNames?.[index] || file.originalname,
      content: file.buffer,
      mimeType: file.mimetype,
      parentId: body.parentFolderId,
    }))

    return this.integrationGoogleService.uploadFilesToDriveBatch(
      institutionId,
      filesData,
      body.targetFolder,
      {
        maxConcurrent: this.MAX_CONCURRENT_UPLOADS_PER_USER,
      }
    )
  }

  @Post('drive/upload-single')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FilesInterceptor('files', GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_FILE_COUNT, {
      limits: {
        fileSize: GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_FILE_SIZE,
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload single file to Google Drive' })
  @ApiBody({
    description: 'Single file upload payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload',
        },
        fileName: {
          type: 'string',
          description: 'Optional custom file name',
          example: 'my-report.pdf',
        },
        targetFolder: {
          type: 'string',
          enum: ['classFiles', 'studentFiles'],
          description: 'Target folder category',
          example: 'studentFiles',
        },
        parentFolderId: {
          type: 'string',
          description: 'Google Drive parent folder ID (optional)',
          example: '1X2Y3Z4W5V6U7T8S9R0Q',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File successfully uploaded',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '1AbCdEfGhIjKlMnOpQrSt' },
        name: { type: 'string', example: 'report.pdf' },
        mimeType: { type: 'string', example: 'application/pdf' },
        webViewLink: { type: 'string', example: 'https://drive.google.com/file/d/...' },
      },
    },
  })
  async uploadSingleFileToDrive(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      fileName?: string
      targetFolder?: 'classFiles' | 'studentFiles'
      parentFolderId?: string
    }
  ): Promise<GoogleDriveFile> {
    if (!file) {
      throw new BadRequestException('File is required')
    }

    const fileData = {
      name: body.fileName || file.originalname,
      content: file.buffer,
      mimeType: file.mimetype,
      parentId: body.parentFolderId,
    }

    return this.integrationGoogleService.uploadFileToDrive(user.id, fileData, body.targetFolder)
  }

  @Post('drive/upload-async')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FilesInterceptor('files', GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_FILE_COUNT, {
      limits: {
        fileSize: GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_FILE_SIZE,
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload files asynchronously with tracking ID' })
  @ApiBody({
    description: 'Async file upload payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of files to upload (max 10)',
        },
        fileNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional custom names for each file',
          example: ['doc1.pdf', 'photo.jpg'],
        },
        targetFolder: {
          type: 'string',
          enum: ['classFiles', 'studentFiles'],
          description: 'Target folder category',
          example: 'classFiles',
        },
        parentFolderId: {
          type: 'string',
          description: 'Google Drive parent folder ID (optional)',
          example: '1K2L3M4N5O6P7Q8R9S0T',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 202,
    description: 'Upload started asynchronously',
    schema: {
      type: 'object',
      properties: {
        uploadId: {
          type: 'string',
          example: 'upload_1712345678901_user123',
        },
        message: {
          type: 'string',
          example: 'Upload started for 3 files. Track progress with uploadId.',
        },
      },
    },
  })
  async uploadFilesAsync(
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    body: {
      fileNames?: string[]
      targetFolder?: 'classFiles' | 'studentFiles'
      parentFolderId?: string
    }
  ): Promise<{ uploadId: string; message: string }> {
    // Check concurrent upload limit
    await this.checkUploadLimit(user.id.toString())

    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('At least one file is required')
      }

      // Validate file types
      this.validateFileTypes(files)

      // Validate folder write access if parent folder is specified
      if (body.parentFolderId) {
        const hasAccess = await this.integrationGoogleService.validateFolderWriteAccess(
          user.id,
          body.parentFolderId
        )
        if (!hasAccess) {
          throw new ForbiddenException('No write access to the specified folder')
        }
      }

      const uploadId = `upload_${Date.now()}_${user.id}`
      const filesData: GoogleDriveFileUpload[] = files.map((file, index) => ({
        name: body.fileNames?.[index] || file.originalname,
        content: file.buffer,
        mimeType: file.mimetype,
        parentId: body.parentFolderId,
      }))

      this.uploadProgressService.createUpload(uploadId, user.id, files.length)

      // Start async upload
      this.integrationGoogleService
        .uploadFilesToDriveBatch(user.id, filesData, body.targetFolder, {
          uploadId,
          maxConcurrent: 3,
        })
        .catch((error) => {
          console.log(`Async upload failed for ${uploadId}:`, error)
          this.uploadProgressService.updateProgress(uploadId, {
            status: 'failed',
            results: [{ error: error.message }],
          })
        })
        .finally(() => {
          // Release upload slot after completion
          this.releaseUploadSlot(user.id.toString())
        })

      return {
        uploadId,
        message: `Upload started for ${files.length} files. Track progress with uploadId.`,
      }
    } catch (error) {
      // Release upload slot on error
      this.releaseUploadSlot(user.id.toString())
      throw error
    }
  }

  @Post('drive/resume-upload/:uploadId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FilesInterceptor('files', GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_FILE_COUNT, {
      limits: {
        fileSize: GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_FILE_SIZE,
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Resume an interrupted upload' })
  @ApiParam({ name: 'uploadId', description: 'Original upload ID' })
  @ApiBody({
    description: 'Resume upload payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        completedFileIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'IDs of successfully uploaded files',
          example: ['1A2B3C', '4D5E6F'],
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Remaining files to upload',
        },
        fileNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names for remaining files',
        },
        targetFolder: {
          type: 'string',
          enum: ['classFiles', 'studentFiles'],
          description: 'Target folder category',
        },
        parentFolderId: {
          type: 'string',
          description: 'Google Drive parent folder ID',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Resume upload completed',
    schema: {
      type: 'object',
      properties: {
        uploadId: { type: 'string' },
        totalFiles: { type: 'number' },
        previouslyCompleted: { type: 'number' },
        newlyUploaded: { type: 'number' },
        results: { type: 'array' },
      },
    },
  })
  async resumeUpload(
    @Param('uploadId') uploadId: string,
    @CurrentUser() user: User,
    @Body()
    body: {
      completedFileIds?: string[]
      fileNames?: string[]
      targetFolder?: 'classFiles' | 'studentFiles'
      parentFolderId?: string
    },
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<any> {
    // Validate upload belongs to user
    const originalProgress = this.uploadProgressService.getProgress(uploadId)
    if (!originalProgress || originalProgress.userId !== user.id) {
      throw new ForbiddenException('Invalid upload ID or access denied')
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required for resume')
    }

    // Validate file types
    this.validateFileTypes(files)

    const newUploadId = `resume_${uploadId}_${Date.now()}`
    const filesData: GoogleDriveFileUpload[] = files.map((file, index) => ({
      name: body.fileNames?.[index] || file.originalname,
      content: file.buffer,
      mimeType: file.mimetype,
      parentId: body.parentFolderId,
    }))

    this.uploadProgressService.createUpload(
      newUploadId,
      user.id,
      files.length + (body.completedFileIds?.length || 0)
    )

    const results = await this.integrationGoogleService.uploadFilesToDriveBatch(
      user.id,
      filesData,
      body.targetFolder,
      { uploadId: newUploadId, maxConcurrent: 3 }
    )

    return {
      uploadId: newUploadId,
      totalFiles: files.length + (body.completedFileIds?.length || 0),
      previouslyCompleted: body.completedFileIds?.length || 0,
      newlyUploaded: results.filter((r) => r.success).length,
      results,
    }
  }

  @Get('drive/upload-progress/:uploadId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get upload progress by ID' })
  @ApiParam({ name: 'uploadId', description: 'Upload tracking ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns current upload progress',
    schema: {
      type: 'object',
      properties: {
        uploadId: { type: 'string', example: 'upload_12345_user678' },
        userId: { type: 'string', example: 'user678' },
        totalFiles: { type: 'number', example: 3 },
        completedFiles: { type: 'number', example: 2 },
        status: {
          type: 'string',
          enum: ['uploading', 'completed', 'failed'],
          example: 'uploading',
        },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getUploadProgress(
    @Param('uploadId') uploadId: string,
    @CurrentUser() user: User
  ): Promise<UploadProgress> {
    const progress = this.uploadProgressService.getProgress(uploadId)

    if (!progress) {
      throw new NotFoundException('Upload not found')
    }

    if (progress.userId !== user.id) {
      throw new ForbiddenException('Access denied')
    }

    return progress
  }

  // @Post('drive/upload-with-progress')
  // @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  // @UseGuards(RolesGuard)
  // @UseInterceptors(
  //   FilesInterceptor('files', GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_FILE_COUNT, {
  //     limits: {
  //       fileSize: GOOGLE_DRIVE_UPLOAD_LIMITS.MAX_FILE_SIZE,
  //     },
  //   })
  // )
  // @ApiConsumes('multipart/form-data')
  // @ApiOperation({ summary: 'Upload files with real-time progress tracking via SSE' })
  // @ApiBody({
  //   description: 'SSE file upload payload',
  //   required: true,
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       files: {
  //         type: 'array',
  //         items: {
  //           type: 'string',
  //           format: 'binary',
  //         },
  //         description: 'Array of files to upload (max 10)',
  //       },
  //       fileNames: {
  //         type: 'array',
  //         items: { type: 'string' },
  //         description: 'Optional custom names for each file',
  //         example: ['doc1.pdf', 'photo.jpg'],
  //       },
  //       targetFolder: {
  //         type: 'string',
  //         enum: ['classFiles', 'studentFiles'],
  //         description: 'Target folder category',
  //         example: 'classFiles',
  //       },
  //       parentFolderId: {
  //         type: 'string',
  //         description: 'Google Drive parent folder ID (optional)',
  //         example: '1K2L3M4N5O6P7Q8R9S0T',
  //       },
  //     },
  //     required: ['files'],
  //   },
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Server-Sent Events stream for progress updates (not testable via Swagger UI)',
  // })
  // async uploadFilesWithProgress(
  //   @CurrentUser() user: User,
  //   @UploadedFiles() files: Express.Multer.File[],
  //   @Body()
  //   body: {
  //     fileNames?: string[]
  //     targetFolder?: 'classFiles' | 'studentFiles'
  //     parentFolderId?: string
  //   },
  //   @Res() res: Response
  // ) {
  //   if (!files || files.length === 0) {
  //     throw new BadRequestException('At least one file is required')
  //   }

  //   res.setHeader('Content-Type', 'text/event-stream')
  //   res.setHeader('Cache-Control', 'no-cache')
  //   res.setHeader('Connection', 'keep-alive')
  //   res.setHeader('X-Accel-Buffering', 'no')

  //   const uploadId = `upload_${Date.now()}_${user.id}`
  //   const filesData: GoogleDriveFileUpload[] = files.map((file, index) => ({
  //     name: body.fileNames?.[index] || file.originalname,
  //     content: file.buffer,
  //     mimeType: file.mimetype,
  //     parentId: body.parentFolderId,
  //   }))

  //   this.uploadProgressService.createUpload(uploadId, user.id, files.length)

  //   const progressHandler = (progress: UploadProgress) => {
  //     if (progress.uploadId === uploadId) {
  //       res.write(`data: ${JSON.stringify(progress)}\n\n`)
  //     }
  //   }

  //   this.eventEmitter.on(uploadId, progressHandler)

  //   try {
  //     const results = await this.integrationGoogleService.uploadFilesToDriveBatch(
  //       institutionId,
  //       filesData,
  //       body.targetFolder,
  //       { uploadId, maxConcurrent: this.MAX_CONCURRENT_UPLOADS_PER_USER }
  //     )

  //     res.write(
  //       `data: ${JSON.stringify({
  //         type: 'complete',
  //         uploadId,
  //         results,
  //       })}\n\n`
  //     )
  //   } catch (error) {
  //     res.write(
  //       `data: ${JSON.stringify({
  //         type: 'error',
  //         uploadId,
  //         error: error.message,
  //       })}\n\n`
  //     )
  //   } finally {
  //     this.eventEmitter.off('upload.progress', progressHandler)
  //     res.end()
  //   }
  // }

  @SubscribeMessage('subscribeToUpload')
  handleSubscribeToUpload(
    @MessageBody() data: { uploadId: string },
    @ConnectedSocket() client: Socket
  ): void {
    const progressHandler = (progress: UploadProgress) => {
      if (progress.uploadId === data.uploadId) {
        client.emit('uploadProgress', progress)
      }
    }

    this.eventEmitter.on('upload.progress', progressHandler)

    // Clean up listener when client disconnects
    client.on('disconnect', () => {
      this.eventEmitter.off('upload.progress', progressHandler)
    })
  }

  @Get('drive/files/:fileId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get file information from Google Drive' })
  @ApiParam({ name: 'fileId', description: 'Google Drive file ID' })
  async getDriveFileInfo(
    @CurrentUser() user: User,
    @Param('fileId') fileId: string
  ): Promise<GoogleDriveFile> {
    return this.integrationGoogleService.getDriveFileInfo(user.id, fileId)
  }

  @Get('drive/files/:fileId/download')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiResponse({
    status: 200,
    description: 'Binary file',
    content: { 'application/octet-stream': {} },
  })
  @ApiParam({ name: 'fileId', description: 'Google Drive file ID' })
  async downloadFileFromDrive(
    @CurrentUser() user: User,
    @Param('fileId') fileId: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const fileData = await this.integrationGoogleService.downloadFileFromDrive(user.id, fileId)

      res.set({
        'Content-Type': fileData.mimeType,
        'Content-Disposition': `attachment; filename="${fileData.name}"`,
        'Content-Length': fileData.content.length.toString(),
      })

      res.send(fileData.content)
    } catch (error) {
      throw error
    }
  }

  @Post('drive/download-by-url')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiResponse({
    status: 200,
    description: 'Binary file',
    content: { 'application/octet-stream': {} },
  })
  @ApiBody({ type: DownloadByUrlDto })
  async downloadFileFromDriveUrl(
    @CurrentUser() user: User,
    @Body() body: DownloadByUrlDto,
    @Res() res: Response
  ): Promise<void> {
    try {
      const fileData = await this.integrationGoogleService.downloadFileFromDriveUrl(
        user.id,
        body.driveUrl
      )

      res.set({
        'Content-Type': fileData.mimeType,
        'Content-Disposition': `attachment; filename="${fileData.name}"`,
        'Content-Length': fileData.content.length.toString(),
      })

      res.send(fileData.content)
    } catch (error) {
      throw error
    }
  }

  // Add debug endpoint in controller
  @Get('debug/status/:serviceType')
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Debug integration status' })
  async debugIntegrationStatus(
    @CurrentUser() user: User,
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('serviceType') serviceType: GoogleServiceType
  ): Promise<any> {
    const integration = await this.integrationGoogleService.getActiveIntegration({
      institutionId,
    })

    return {
      hasIntegration: !!integration,
      integration: integration
        ? {
            id: integration.id,
            userId: integration.userId,
            googleUserId: integration.googleUserId,
            googleUserEmail: integration.googleUserEmail,
            status: integration.status,
            serviceType: integration.serviceType,
            hasAccessToken: !!integration.accessToken,
            hasRefreshToken: !!integration.refreshToken,
            expiryDate: integration.expiryDate,
            scopes: integration.scopes,
            createdAt: integration.createdAt,
            updatedAt: integration.updatedAt,
          }
        : null,
    }
  }

  @Get('drive/quota')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get Google Drive storage quota information' })
  @ApiOkResponse({
    description: 'Returns current Google Drive storage usage and limits',
    schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          example: 16106127360,
          description: 'Total storage limit in bytes (e.g., 15 GB)',
        },
        usage: { type: 'number', example: 8589934592, description: 'Total used storage in bytes' },
        usageInDrive: {
          type: 'number',
          example: 8053063680,
          description: 'Used storage in Drive (excluding trash)',
        },
        usageInDriveTrash: {
          type: 'number',
          example: 536870912,
          description: 'Used storage in Drive Trash',
        },
        percentageUsed: {
          type: 'number',
          example: 53.3,
          description: 'Percentage of storage used',
        },
        remainingSpace: {
          type: 'number',
          example: 7516192768,
          description: 'Remaining storage in bytes',
        },
      },
    },
  })
  async getDriveQuota(@CurrentUser() user: User): Promise<{
    limit: number
    usage: number
    usageInDrive: number
    usageInDriveTrash: number
    percentageUsed: number
    remainingSpace: number
  }> {
    const quota = await this.integrationGoogleService.getDriveQuotaInfo(user.id)

    return {
      ...quota,
      percentageUsed: quota.limit > 0 ? (quota.usage / quota.limit) * 100 : 0,
      remainingSpace: quota.limit - quota.usage,
    }
  }

  @Get('drive/allowed-file-types')
  @ApiOperation({ summary: 'Get list of allowed file types for upload' })
  @ApiResponse({
    status: 200,
    description: 'List of allowed MIME types',
    schema: {
      type: 'object',
      properties: {
        allowedTypes: {
          type: 'array',
          items: { type: 'string' },
        },
        categories: {
          type: 'object',
          properties: {
            documents: { type: 'array', items: { type: 'string' } },
            images: { type: 'array', items: { type: 'string' } },
            archives: { type: 'array', items: { type: 'string' } },
            media: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  })
  getAllowedFileTypes(): any {
    return {
      allowedTypes: ALLOWED_MIME_TYPES,
      categories: {
        documents: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'text/csv',
        ],
        images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        archives: [
          'application/zip',
          'application/x-rar-compressed',
          'application/x-7z-compressed',
        ],
        media: ['audio/mpeg', 'audio/wav', 'video/mp4', 'video/mpeg'],
      },
    }
  }

  @Post('drive/validate-folder-access')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Validate folder access before operations' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        folderId: { type: 'string', description: 'Google Drive folder ID' },
        checkWrite: { type: 'boolean', description: 'Check write permissions', default: true },
      },
      required: ['folderId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Folder access validation result',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean' },
        name: { type: 'string' },
        hasWriteAccess: { type: 'boolean' },
        isInRootHierarchy: { type: 'boolean' },
        breadcrumb: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async validateFolderAccess(
    @CurrentUser() user: User,
    @Body() body: { folderId: string; checkWrite?: boolean }
  ): Promise<any> {
    const folderInfo = await this.integrationGoogleService.validateFolderExists(
      user.id,
      body.folderId
    )

    if (!folderInfo.exists) {
      return { exists: false }
    }

    let hasWriteAccess = folderInfo.hasWriteAccess

    // If requested, do REAL write test
    if (body.checkWrite !== false) {
      hasWriteAccess = await this.integrationGoogleService.testAndValidateWriteAccess(
        user.id,
        body.folderId
      )
    }

    const result: any = {
      exists: true,
      name: folderInfo.name,
      hasWriteAccess,
    }

    // Check if folder is in root hierarchy
    const isInHierarchy = await this.integrationGoogleService.isFolderInRootHierarchy(
      user.id,
      body.folderId
    )
    result.isInRootHierarchy = isInHierarchy

    // Get breadcrumb
    try {
      const breadcrumb = await this.integrationGoogleService.getFolderBreadcrumb(
        user.id,
        body.folderId
      )
      result.breadcrumb = breadcrumb
    } catch (error) {
      console.warn(`Failed to get breadcrumb for folder ${body.folderId}:`, error.message)
    }

    return result
  }

  private async checkUploadLimit(userId: string): Promise<void> {
    const currentUploads = this.uploadQueue.get(userId) || 0
    if (currentUploads >= this.MAX_CONCURRENT_UPLOADS_PER_USER) {
      throw new BadRequestException(
        'Too many concurrent uploads. Please wait for current uploads to complete.'
      )
    }
    this.uploadQueue.set(userId, currentUploads + 1)
  }

  private validateFileTypes(files: Express.Multer.File[]): void {
    const invalidFiles: string[] = []

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        invalidFiles.push(`${file.originalname} (${file.mimetype})`)
      }
    }

    if (invalidFiles.length > 0) {
      throw new BadRequestException({
        message: 'Some files have unsupported types',
        invalidFiles,
        allowedTypes: this.getAllowedFileTypes().categories,
        suggestion: 'Please convert files to supported formats before uploading',
      })
    }
  }

  private releaseUploadSlot(userId: string): void {
    const currentUploads = this.uploadQueue.get(userId) || 0
    if (currentUploads > 0) {
      this.uploadQueue.set(userId, currentUploads - 1)
    }

    // Clean up if no active uploads
    if (this.uploadQueue.get(userId) === 0) {
      this.uploadQueue.delete(userId)
    }
  }

  private cleanupUploadQueue(): void {
    const now = Date.now()
    const TIMEOUT = 5 * 60 * 1000 // 5 minutes

    for (const [userId, uploads] of this.uploadQueue.entries()) {
      if (uploads === 0) {
        this.uploadQueue.delete(userId)
      }
    }
  }

  @Get('drive/root-folder/health')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Check health of configured root folder' })
  @ApiOkResponse({
    description: 'Returns health status of root folder',
    schema: {
      type: 'object',
      properties: {
        healthy: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Root folder was deleted from Google Drive.' },
        actionRequired: { type: 'boolean', example: true },
        suggestedAction: { type: 'string', example: 'Please re-select root folder.' },
      },
    },
  })
  async checkRootFolderHealth(@CurrentUser() user: User): Promise<{
    healthy: boolean
    message: string
    actionRequired: boolean
    suggestedAction?: string
  }> {
    const status = await this.integrationGoogleService.checkRootFolderHealth(user.id)
    return status
  }
}
