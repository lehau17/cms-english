import { DifficultyLevel, LanguageCode } from './enums'

export interface VocabularyList {
  id: string
  title: string
  description?: string
  difficulty: DifficultyLevel
  category?: string
  level?: string
  thumbnailUrl?: string
  bannerUrl?: string
  isPublic: boolean
  isOfficial: boolean
  totalTerms: number
  totalUnits: number
  userCount: number
  language: LanguageCode
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface VocabularyUnit {
  id: string
  listId: string
  title: string
  description?: string
  orderIndex: number
  termCount: number
  createdAt: string
  updatedAt: string
}

export interface VocabularyUnitWithTerms extends VocabularyUnit {
  terms: VocabularyTerm[]
}

export interface ExampleSentence {
  sentence: string
  translation?: string
}

export interface VocabularyTerm {
  id: string
  unitId: string
  word: string
  definition: string
  pronunciation?: string
  partOfSpeech?: string
  audioUrl?: string
  imageUrl?: string
  examples?: ExampleSentence[]
  synonyms?: string[]
  antonyms?: string[]
  ipaUs?: string
  ipaUk?: string
  translationVi?: string
  orderIndex: number
  difficulty: DifficultyLevel
  createdAt: string
  updatedAt: string
}

export type CreateVocabularyListInput = {
  title: string
  description?: string
  difficulty: DifficultyLevel
  category?: string
  level?: string
  thumbnailUrl?: string
  bannerUrl?: string
  isPublic?: boolean
  language?: LanguageCode
}

export type UpdateVocabularyListInput = Partial<CreateVocabularyListInput>

export type CreateVocabularyUnitInput = {
  title: string
  description?: string
  orderIndex?: number
}

export type UpdateVocabularyUnitInput = Partial<CreateVocabularyUnitInput>

export type CreateVocabularyTermInput = {
  word: string
  definition: string
  pronunciation?: string
  partOfSpeech?: string
  audioUrl?: string
  imageUrl?: string
  examples?: ExampleSentence[]
  synonyms?: string[]
  antonyms?: string[]
  ipaUs?: string
  ipaUk?: string
  translationVi?: string
  orderIndex?: number
  difficulty?: DifficultyLevel
}

export type UpdateVocabularyTermInput = Partial<CreateVocabularyTermInput>
