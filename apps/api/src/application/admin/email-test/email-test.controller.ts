import { Controller, ForbiddenException, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { Public } from '@/common/decorators/public.decorator'
import { EmailService } from '@/domain/external/email.service'

@ApiTags('Email Testing Suite')
@Controller('email-test')
@Public()
export class EmailTestController {
  constructor(private readonly emailService: EmailService) {}

  private checkLocalEnv() {
    if (process.env.APP_ENV !== 'local') {
      throw new ForbiddenException(
        'This endpoint is only available in local development environment'
      )
    }
  }

  @Post('trigger-all')
  @ApiOperation({ summary: 'Trigger all test email flows at once to the specified email' })
  @ApiQuery({ name: 'email', required: false })
  async triggerAll(@Query('email') email = 'test@flowclass.io') {
    this.checkLocalEnv()

    await this.forgotPassword(email)
    await this.verification(email)
    await this.assignCoupon(email)
    await this.question(email)
    await this.classMaterials(email)

    return {
      message: 'All test emails triggered successfully. Check Maildev at http://localhost:1080',
      triggeredFlows: [
        'forgot-password',
        'verification',
        'assign-coupon',
        'question',
        'class-materials',
      ],
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Trigger a test Forgot Password email' })
  @ApiQuery({ name: 'email', required: false })
  async forgotPassword(@Query('email') email = 'test@flowclass.io') {
    this.checkLocalEnv()
    await this.emailService.sendForgetPasswordEmail({
      userId: 1,
      emailAddress: email,
      resetLink: 'http://localhost:5173/reset-password',
    })
    return { message: 'Forgot password email triggered' }
  }

  @Post('verification')
  @ApiOperation({ summary: 'Trigger a test Verification Email' })
  @ApiQuery({ name: 'email', required: false })
  async verification(@Query('email') email = 'test@flowclass.io') {
    this.checkLocalEnv()
    await this.emailService.sendVerificationEmail({
      userId: 1,
      emailAddress: email,
      verificationLink: 'http://localhost:5173/verify-email?code=888888',
      firstName: 'Jane',
      phoneNumber: '12345678',
    })
    return { message: 'Verification email triggered' }
  }

  @Post('assign-coupon')
  @ApiOperation({ summary: 'Trigger a test Assign Coupon Email' })
  @ApiQuery({ name: 'email', required: false })
  async assignCoupon(@Query('email') email = 'test@flowclass.io') {
    this.checkLocalEnv()
    await this.emailService.sendAssignCouponEmail({
      userId: 1,
      studentName: 'John Doe',
      studentEmail: email,
      institutionName: 'Flowclass Academy',
      couponCode: 'WELCOME10',
      discountAmountUnit: '$10',
      expiredDate: new Date('2026-12-31'),
      institutionId: undefined,
    })
    return { message: 'Assign coupon email triggered' }
  }

  @Post('question')
  @ApiOperation({ summary: 'Trigger a test Question Email' })
  @ApiQuery({ name: 'email', required: false })
  async question(@Query('email') email = 'test@flowclass.io') {
    this.checkLocalEnv()
    await this.emailService.sendQuestionEmail({
      emailSubject: 'New Question regarding Chemistry course',
      studentEmail: email,
      studentName: 'Dexter Lab',
      question:
        'Could you please clarify if the mid-term syllabus includes the organic chemistry chapter?',
      courseName: 'Chemistry 101',
      institutionId: 1,
      className: 'Grade 10 Class A',
      studentPhone: '12345678',
    })
    return { message: 'Question email triggered' }
  }

  @Post('class-materials')
  @ApiOperation({ summary: 'Trigger a test Class Materials Uploaded Email' })
  @ApiQuery({ name: 'email', required: false })
  async classMaterials(@Query('email') email = 'test@flowclass.io') {
    this.checkLocalEnv()
    await this.emailService.sendClassMaterialsEmail({
      emailAddress: email,
      courseName: 'English Literature',
      className: 'Reading & Analysis Group B',
      institutionName: 'Flowclass Academy',
      studentName: 'Peter Parker',
      siteLink: 'http://localhost:5173/materials',
      contactEmail: email,
    })
    return { message: 'Class materials email triggered' }
  }
}
