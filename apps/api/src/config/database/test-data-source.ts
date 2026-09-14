import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataType, newDb } from 'pg-mem'
import { DataSource } from 'typeorm'
import { v4 } from 'uuid'

export const setupTestDataSource = async () => {
  const db = newDb({
    autoCreateForeignKeyIndices: true,
  })

  db.public.registerFunction({
    implementation: () => 'test',
    name: 'current_database',
  })

  db.registerExtension('uuid-ossp', (schema) => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: v4,
      impure: true,
    })
  })

  db.public.registerFunction({
    name: 'version',
    implementation: () => 'PostgreSQL 14.2, compiled by Visual C++ build 1914, 64-bit',
  })

  const ds: DataSource = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    dropSchema: false,
    // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    entities: ['dist/**/*.entity.{js,ts}'],
    migrations: ['dist/migrations/*.{js,ts}'],
    migrationsRun: false,
    synchronize: false,
  } as TypeOrmModuleOptions)

  await ds.initialize()
  await ds.synchronize()

  return ds
}
