export type OpenAiResponse = {
  id: string
  object: string
  created: number
  model: string
  choices: OpenAiChoice[]
}

export type OpenAiChoice = {
  text: string
  index: 0
  logprobs: null
  // eslint-disable-next-line camelcase
  finish_reason: string
}

export type ChatGPTResponse = {
  text: string
  attemptLeft: number
}

export enum AiRole {
  assistant = 'assistant',
  system = 'system',
  user = 'user',
  function = 'function',
  tool = 'tool',
}

export type AiMessageItem = {
  text?: { type: 'text'; text: string }
  images?: {
    type: 'image_url'
    // eslint-disable-next-line camelcase
    image_url: { url: string; detail?: 'high' | 'low' | 'auto' }
  }
}

export type AiConversationItem = {
  role: AiRole
  content: AiMessageItem[]
}
