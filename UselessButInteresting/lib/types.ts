export interface Fact {
  id: string
  text: string
  category: string
  isTrue?: boolean
  approved?: boolean
  submittedBy?: string
  createdAt?: string
}

export interface SubmittedFact {
  id: string
  text: string
  category: string
  submittedBy: string
  approved: boolean
  createdAt: string
}

