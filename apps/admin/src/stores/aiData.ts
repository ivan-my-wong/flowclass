import { atom } from 'recoil'

import { scenarioOptions, ScenarioProps } from '@/constants/aiPrompts'
import { ATOM_KEY } from '@/constants/atomKey'

import { persistLocalStorage } from './utils/recoilPersist'

export enum FormState {
  initial,
  pending,
  result,
  error,
}

type AiContextType = {
  status: FormState
  result: string
  prompt: string
  scenario: ScenarioProps
  guidanceForm: Record<string, string>
  imageUrls?: string
  original: string
  newAttempts: number
  textLoading: boolean
}
const defaultAiState: AiContextType = {
  status: FormState.initial,
  result: '',
  scenario: scenarioOptions[0],
  original: '',
  guidanceForm: {},

  prompt: '',
  newAttempts: 0,
  textLoading: false,
}

export const aiState = atom<AiContextType>({
  key: ATOM_KEY.AiState,
  default: defaultAiState,
  effects: [persistLocalStorage],
})
