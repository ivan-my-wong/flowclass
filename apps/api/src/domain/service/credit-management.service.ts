import { BadRequestException, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'

import { AddOrDeductCreditDTO } from '@/application/admin/credit/dto/add-or-deduct-credit.dto'
import { UpdateCreditSettingsDTO } from '@/application/admin/credit/dto/update-credit-settings.dto'
import { CreditSettings } from '@/models/credit-settings.entity'
import { CreditSettingsRepository } from '@/models/credit-settings.repository'
import {
  CreditSourceType,
  CreditTransactions,
  CreditTransactionType,
} from '@/models/credit-transactions.entity'
import { CreditTransactionsRepository } from '@/models/credit-transactions.repository'
import { UserAliasesRepository } from '@/models/user-aliases.repository'

@Injectable()
export class CreditManagementService {
  constructor(
    private readonly creditTransactionsRepository: CreditTransactionsRepository,
    private readonly creditSettingsRepository: CreditSettingsRepository,
    private readonly userAliasesRepository: UserAliasesRepository
  ) {}

  // getBalance
  async getBalance(
    institutionId: number,
    userAliasId: number,
    entityManager?: EntityManager
  ): Promise<{ balance: number }> {
    const repository = entityManager
      ? entityManager.getRepository(CreditTransactions)
      : this.creditTransactionsRepository

    const parentUserAliasId = await this.getParentUserAliasId(userAliasId, institutionId)

    const resultRaw = await repository
      .createQueryBuilder('creditTransaction')
      .select('SUM(creditTransaction.amount)', 'balance')
      .where('creditTransaction.institutionId = :institutionId', { institutionId })
      .andWhere('creditTransaction.userAliasId = :userAliasId', { userAliasId: parentUserAliasId })
      .getRawOne()

    return { balance: resultRaw.balance ? Number(resultRaw.balance) : 0 }
  }

  // getHistory
  async getHistory(
    institutionId: number,
    userAliasId: number,
    transactionType: CreditTransactionType,
    page: number,
    limit: number
  ): Promise<{ items: CreditTransactions[]; total: number }> {
    const parentUserAliasId = await this.getParentUserAliasId(userAliasId, institutionId)

    const query = this.creditTransactionsRepository
      .createQueryBuilder('creditTransaction')
      .where('creditTransaction.institutionId = :institutionId', { institutionId })
      .andWhere('creditTransaction.userAliasId = :userAliasId', { userAliasId: parentUserAliasId })

    if (transactionType) {
      query.andWhere('creditTransaction.transactionType = :transactionType', { transactionType })
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('creditTransaction.createdAt', 'DESC')
      .getManyAndCount()

    return { items, total }
  }

  async getParentUserAliasId(userAliasId: number, institutionId: number) {
    const userAlias = await this.userAliasesRepository.findOne({
      where: { id: userAliasId, institutionId },
    })

    let parentUserAliasId = userAlias?.id
    if (userAlias?.childOfUserAliasId) {
      parentUserAliasId = userAlias.childOfUserAliasId
    }

    return parentUserAliasId ?? userAliasId
  }

  // addCredit
  async addCredit(
    institutionId: number,
    payload: AddOrDeductCreditDTO
  ): Promise<CreditTransactions> {
    if (payload.amount <= 0) {
      throw new BadRequestException('Amount must be positive')
    }

    // Always book against the parent alias so the write side matches what
    // getBalance/getHistory read. Without this, a transaction submitted under
    // a child alias is invisible to every subsequent balance query.
    const parentUserAliasId = await this.getParentUserAliasId(payload.userAliasId, institutionId)

    return await this.creditTransactionsRepository.manager.transaction(async (entityManager) => {
      const beforeBalance = await this.getBalance(institutionId, parentUserAliasId, entityManager)
      const balanceAfter = beforeBalance.balance + payload.amount
      const creditTransaction = entityManager.create(CreditTransactions, {
        institutionId,
        userAliasId: parentUserAliasId,
        amount: payload.amount,
        sourceType: payload.sourceType,
        description: payload.description,
        transactionType: CreditTransactionType.ADDED,
        balanceAfter,
      })
      return await entityManager.save(creditTransaction)
    })
  }

  // deductCredit
  async deductCredit(
    institutionId: number,
    payload: AddOrDeductCreditDTO
  ): Promise<CreditTransactions> {
    const parentUserAliasId = await this.getParentUserAliasId(payload.userAliasId, institutionId)

    return await this.creditTransactionsRepository.manager.transaction(async (entityManager) => {
      const beforeBalance = await this.getBalance(institutionId, parentUserAliasId, entityManager)
      if (beforeBalance.balance < payload.amount) {
        throw new BadRequestException('Insufficient balance to deduct credit.')
      }
      const balanceAfter = beforeBalance.balance - payload.amount
      const creditTransaction = entityManager.create(CreditTransactions, {
        institutionId,
        userAliasId: parentUserAliasId,
        amount: -payload.amount,
        sourceType: payload.sourceType,
        description: payload.description,
        transactionType: CreditTransactionType.DEDUCTED,
        balanceAfter,
      })
      return await entityManager.save(creditTransaction)
    })
  }

  // getSettings
  async getSettings(institutionId: number): Promise<CreditSettings> {
    const settings = await this.creditSettingsRepository.findOne({
      where: { institutionId },
    })

    if (!settings) {
      return this.creditSettingsRepository.create({
        institutionId,
        isEnabled: true,
        conversionRate: 1,
        currencyCode: 'USD',
        creditExpiryDays: null,
        minCreditUsage: 0,
        maxCreditPerTransaction: null,
      })
    }

    return settings
  }

  // updateSettings
  async updateSettings(
    institutionId: number,
    settings: UpdateCreditSettingsDTO
  ): Promise<CreditSettings> {
    let existingSettings = await this.creditSettingsRepository.findOne({
      where: { institutionId },
    })

    if (!existingSettings) {
      existingSettings = this.creditSettingsRepository.create({ institutionId })
    }

    Object.assign(existingSettings, settings)

    return await this.creditSettingsRepository.save(existingSettings)
  }

  // moveCredit
  async moveCredit(
    institutionId: number,
    fromUserAliasId: number,
    toUserAliasId: number,
    balance: number
  ) {
    if (balance <= 0) {
      throw new BadRequestException('Balance must be positive')
    }

    return await this.creditTransactionsRepository.manager.transaction(async (entityManager) => {
      const fromBalance = await this.getBalance(institutionId, fromUserAliasId, entityManager)
      if (fromBalance.balance < balance) {
        throw new BadRequestException('Insufficient balance to move credit.')
      }

      const toBalance = await this.getBalance(institutionId, toUserAliasId, entityManager)
      const description = `Moved credit from ID #${fromUserAliasId} to ID #${toUserAliasId}`

      // Deduct from the sender
      const deductTransaction = entityManager.create(CreditTransactions, {
        institutionId,
        userAliasId: fromUserAliasId,
        amount: -balance,
        transactionType: CreditTransactionType.DEDUCTED,
        balanceAfter: fromBalance.balance - balance,
        sourceType: CreditSourceType.MOVE_CREDIT,
        description,
      })
      await entityManager.save(deductTransaction)

      // Add to the receiver
      const addTransaction = entityManager.create(CreditTransactions, {
        institutionId,
        userAliasId: toUserAliasId,
        amount: balance,
        transactionType: CreditTransactionType.ADDED,
        balanceAfter: toBalance.balance + balance,
        sourceType: CreditSourceType.MOVE_CREDIT,
        description,
      })
      return await entityManager.save(addTransaction)
    })
  }

  // hasCreditRecords
  async hasCreditRecords(institutionId: number): Promise<{ hasRecords: boolean }> {
    const count = await this.creditTransactionsRepository.count({
      where: { institutionId },
    })

    return { hasRecords: count > 0 }
  }
}
