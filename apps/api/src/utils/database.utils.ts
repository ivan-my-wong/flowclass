import { EntityManager, EntityTarget, FindOptionsWhere, ObjectLiteral } from 'typeorm'

import { relations } from '@/models/relations'

export const softRemoveTransaction = async (
  transactionEntity: EntityManager,
  entityClass: EntityTarget<ObjectLiteral>,
  whereDeleteObject: FindOptionsWhere<ObjectLiteral>
) => {
  const objects = await transactionEntity.find(entityClass, {
    select: {
      id: true,
    },
    where: whereDeleteObject,
  })
  if (objects.length > 0) {
    await transactionEntity.softDelete(entityClass, objects)
  }
}

export const softRemoveWithRelation = async (
  entityManager: EntityManager,
  entityClass: EntityTarget<ObjectLiteral>,
  whereDeleteObject: FindOptionsWhere<ObjectLiteral>,
  whereDeleteRelationObject: FindOptionsWhere<ObjectLiteral>
) => {
  await entityManager.transaction(async (transactionEntity) => {
    await Promise.all(
      relations[entityClass.toString()].map(async (entityRelationClass) => {
        await softRemoveTransaction(
          transactionEntity,
          entityRelationClass,
          whereDeleteRelationObject
        )
      })
    )

    await transactionEntity.softDelete(entityClass, whereDeleteObject)
  })
}

export async function hardRemoveWithRelation(
  manager: EntityManager,
  entityClass: EntityTarget<ObjectLiteral>,
  deleteObject: FindOptionsWhere<ObjectLiteral>,
  deleteRelationObject: FindOptionsWhere<ObjectLiteral>
): Promise<any> {
  await manager.transaction(async (transactionEntity) => {
    await Promise.all(
      relations[entityClass.toString()].map(async (entityRelationClass) => {
        const objects = await transactionEntity.find(entityRelationClass, {
          select: {
            id: true,
          },
          where: deleteRelationObject,
        })
        if (objects.length > 0) {
          await transactionEntity.delete(entityRelationClass, objects)
        }
      })
    )

    await transactionEntity.delete(entityClass, deleteObject)
  })
}
