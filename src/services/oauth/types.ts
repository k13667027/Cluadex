// OAuth-related type definitions

export type BillingType = 'credit_card' | 'invoice' | null

export interface ReferralEligibilityResponse {
  eligible: boolean
  remainingPasses?: number
  totalPasses?: number
}
