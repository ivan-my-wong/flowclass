import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common'
import { plainToClass, plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm'

import { DeletePayoutPreferenceDto } from '@/application/admin/request-payout/dto/delete-payout-preference.dto'
import {
  BankTransferDetailsDto,
  ExternalPayoutMethodDetailsDto,
  GetPayoutPreferenceDto,
  IBasePayoutDetails,
  OtherMethodDetailsDto,
  PayoutPreferenceDto,
} from '@/application/admin/request-payout/dto/receive-Payout-Preference.dto'
import {
  GetPayoutPreferenceWithPageDto,
  GetPayoutPreferenceWithPageOptionDto,
} from '@/application/admin/request-payout/dto/receive-payout-preference-paginate.dto'
import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'
import { PayoutMethodName } from '@/models/enums/'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { PayoutMethod, PayoutMethodRepository } from '@/models/payout-method.entity'
@Injectable()
export class RequestPayoutService {
  constructor(
    private readonly requestPayoutRepository: PayoutMethodRepository,
    private readonly institutionsRepository: InstitutionsRepository
  ) {}
  async setPayoutMethodPreference(
    receivePayoutPreferenceDto: PayoutPreferenceDto
  ): Promise<{ item: PayoutPreferenceDto; status: HttpStatus }> {
    //Check existence of institution
    const institution = await this.institutionsRepository.findOneBy({
      id: receivePayoutPreferenceDto.institutionId,
    })
    if (!institution) throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)

    // Validate the details of payout method
    await this.validatePayoutMethodDetails(receivePayoutPreferenceDto)
    const isUpdate = receivePayoutPreferenceDto.id != null
    const setPayoutPreference = await this.requestPayoutRepository.save(receivePayoutPreferenceDto)
    // 201 only on insert; 200 on update. The previous check used `createdAt`,
    // which TypeORM sets on both insert and update — so it always returned 201
    // and the frontend toast/UX treated edits as new records.
    const httpStatus = isUpdate ? HttpStatus.OK : HttpStatus.CREATED
    return {
      item: plainToInstance(PayoutPreferenceDto, setPayoutPreference),
      status: httpStatus,
    }
  }

  public async parsePayoutMethodDetails(
    methodType: string,
    details: PayoutPreferenceDto['payoutMethodDetails']
  ): Promise<IBasePayoutDetails | null> {
    let payoutDetails = null
    switch (methodType) {
      case PayoutMethodName.BANK_TRANSFER:
        payoutDetails = plainToClass(BankTransferDetailsDto, details)
        break
      case PayoutMethodName.EXTERNAL:
        payoutDetails = plainToClass(ExternalPayoutMethodDetailsDto, details)
        break
      default:
        payoutDetails = plainToClass(OtherMethodDetailsDto, details)
        break
    }
    return payoutDetails
  }

  private async validatePayoutMethodDetails(dto: PayoutPreferenceDto) {
    const parsedDetails = await this.parsePayoutMethodDetails(
      dto.methodType,
      dto.payoutMethodDetails
    )
    if (parsedDetails == null) {
      throw new BadRequestException('Details validation failed: unknown payout method name.')
    }

    const errors = await validate(parsedDetails)
    if (errors.length > 0) {
      throw new BadRequestException('Details validation failed: ' + errors)
    }
    return
  }

  async getPayoutMethodPreference(
    receivePayoutPreferenceDto: GetPayoutPreferenceWithPageOptionDto
  ): Promise<GetPayoutPreferenceWithPageDto> {
    const whereCondition: FindOptionsWhere<PayoutMethod> = {
      institutionId: receivePayoutPreferenceDto.institutionId,
    }
    const orderOption: FindOptionsOrder<PayoutMethod> = {}
    if (receivePayoutPreferenceDto.orderBy) {
      orderOption[receivePayoutPreferenceDto.orderBy] = receivePayoutPreferenceDto.order
    }
    if (receivePayoutPreferenceDto.getEnabledOnly) {
      whereCondition.enabled = true
    }
    const payoutReference = await this.requestPayoutRepository.paginationWithTransform(
      receivePayoutPreferenceDto,
      GetPayoutPreferenceDto,
      whereCondition,
      orderOption
    )

    if (!payoutReference) {
      throw new BadRequestException(InstitutionErrorMessage.PAYOUT_PREFERENCE_NOT_FOUND)
    }

    // const payoutMethodList: PayoutPreferenceDto[] = payoutReference.content.map((payout) => {
    //   return plainToInstance(PayoutPreferenceDto, payout);
    // });

    return payoutReference
  }

  async delPayoutMethodPreference(
    deletePayoutPreferenceDto: DeletePayoutPreferenceDto
  ): Promise<PayoutPreferenceDto> {
    const payoutReference = await this.requestPayoutRepository.findOneById(
      deletePayoutPreferenceDto.id
    )

    if (!payoutReference) {
      throw new BadRequestException(InstitutionErrorMessage.PAYOUT_PREFERENCE_NOT_FOUND)
    }
    try {
      await this.requestPayoutRepository.delete({
        id: deletePayoutPreferenceDto.id,
      })
    } catch (error) {
      throw new BadRequestException(InstitutionErrorMessage.PAYOUT_PREFERENCE_DEL_FAIL)
    }
    const payoutMethod: PayoutPreferenceDto = plainToInstance(PayoutPreferenceDto, payoutReference)
    return payoutMethod
  }
}
