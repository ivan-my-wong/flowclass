import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AzureOpenAI } from 'openai'

const azureOpenaiProviders = {
  provide: 'AZURE_OPENAI_SERVICE',
  useFactory: (configService: ConfigService) => {
    const apiKey = configService.get('AZURE_OPENAI_KEY')
    const apiVersion = configService.get('AZURE_API_VERSION')
    const deployment = configService.get('OPENAI_MODEL_ID')
    const endpoint = configService.get('AZURE_OPENAI_URL')

    if (!apiKey || !apiVersion || !deployment || !endpoint) {
      return null
    }

    return new AzureOpenAI({
      apiKey,
      apiVersion,
      deployment,
      endpoint,
    })
  },
  inject: [ConfigService],
}

@Module({
  imports: [],
  providers: [azureOpenaiProviders],
  exports: [azureOpenaiProviders],
})
export class AzureOpenaiModule {}
