import { fetchEventSource } from '@microsoft/fetch-event-source'
import { v4 as uuidv4 } from 'uuid'

import { API_BASE_URL } from '@/lib/config'

import { LocalStorageKeys } from '../constants/localStorageKeys'

import ApiError from './errors/apiError'
import apiClient from './index'

export type AskChatProps = {
  prompt: string
  temperature: number
  maxtokens: number
  language: string
  content?: string
  previousMessages?: Record<string, string>[]
  userId?: number
  imageUrls?: string[]
  onMessage: (e: any) => any
  onFinish: () => any
  onError: (e?: any) => any
}

export type AskChatWithSchoolIdProps = {
  schoolId: number
} & AskChatProps

export type RequestChatProps = {
  schoolId: number
}

export type RequestChatResponse = {
  token: string
}

export type OcrTextRequestProps = {
  imageUrl: string
  languageCode: string
}

export type OcrWordItem = {
  boundingBox: string
  text: string
}

export type OcrDataOutput = {
  language: string
  textAngle: number
  orientation: string
  regions: OcrWordItem[]
}

export type AiCreditAvaliableResponse = {
  aiCreditLefts: number
}

export const askChat = async ({
  prompt,
  temperature,
  maxtokens,
  schoolId,
  onMessage,
  onFinish,
  onError,
}: // userId,
AskChatWithSchoolIdProps): Promise<void> => {
  try {
    const tokenGenerated = await requestChat({ schoolId })
    // Prepare URL parameters
    const data = new URLSearchParams({
      prompt,
      temperature: temperature.toString(),
      max_tokens: maxtokens.toString(),
      institutionId: schoolId.toString(),
      aiAccessToken: tokenGenerated.token,
    })

    // Initialize EventSource

    await fetchEventSource(`${API_BASE_URL}/admin/openai/chatgpt-stream`, {
      method: 'POST',

      headers: {
        'Content-Type': 'text/event-source',
      },
      body: JSON.stringify(data),
      onmessage(event: any) {
        onMessage(event)

        if (event.event === 'DONE') {
          onFinish()
        }
      },
      onerror() {
        onError()
      },
    })
  } catch (e) {
    throw new Error('Fail to obtain response from OpenAI.')
  }
}

export const requestChat = async ({
  schoolId,
}: RequestChatProps): Promise<RequestChatResponse> => {
  try {
    const res = await apiClient.post({
      url: '/admin/openai/requestChatGpt',
      data: {
        institutionId: schoolId,
      },
    })
    return res.data.data
  } catch (e) {
    throw new Error('Fail to obtain response from OpenAI.')
  }
}

export const ocrText = async ({
  imageUrl,
  languageCode,
}: OcrTextRequestProps): Promise<OcrDataOutput> => {
  const browserId =
    localStorage.getItem(LocalStorageKeys.FfBrowserId) ?? uuidv4()

  try {
    const res = await apiClient.get({
      url: '/admin/openai-public/ocr-text',
      params: {
        imageUrl,
        languageCode,
        browserId,
      },
    })
    return res.data.data
  } catch (e) {
    throw new ApiError('Fail to obtain response from OpenAI.', 429)
  }
}

export const getAiCreditAvaliable = async ({
  institutionId,
}: {
  institutionId: number
}): Promise<AiCreditAvaliableResponse> => {
  try {
    const res = await apiClient.get({
      url: '/admin/openai/getAiCreditLeft',
      params: {
        institutionId,
      },
    })
    return res.data.data
  } catch (e) {
    throw new Error('Faile to obtain AI credit.')
  }
}
