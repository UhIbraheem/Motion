export interface Adventure {
  id?: string
  title: string
  description?: string
  location: string
  duration_hours: number
  budget_level: '$' | '$$' | '$$$'
  estimated_cost?: number
  experience_type?: string
  steps?: AdventureStep[]
  is_shared?: boolean
  is_scheduled?: boolean
  scheduled_date?: string
  is_completed?: boolean
  rating?: number
  completion_notes?: string
  created_by?: string
  created_date?: string
}

export interface AdventureStep {
  step_number: number
  time: string
  location: string
  activity: string
  description: string
  estimated_cost?: number
  duration_minutes?: number
  booking_info?: string
  address?: string
  // Legacy fields (mapping to new structure)
  title?: string
  notes?: string
  booking?: {
    method?: string
    link?: string
    fallback?: string
  }
  // Google Places enrichment fields
  business_name?: string
  place_id?: string
  rating?: number
  price_level?: number
  business_hours?: string
  business_phone?: string
  business_website?: string
  validated?: boolean
}

export interface User {
  id: string
  email: string
  fullName?: string
  name?: string // For compatibility with Navigation component
  subscriptionTier: 'free' | 'explorer' | 'pro'
  generationsUsed: number
  editsUsed: number
  generationsLimit: number
  editsLimit: number
  subscriptionStatus: 'active' | 'inactive' | 'canceled'
  subscriptionExpiresAt?: string
  lastResetDate?: string
}