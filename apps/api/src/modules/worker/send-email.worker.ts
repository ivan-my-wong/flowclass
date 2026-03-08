import { EmailService } from '@/domain/external/email.service'

class SendEmailWorker {
  constructor(private readonly emailService: EmailService) {}
}

export default SendEmailWorker
