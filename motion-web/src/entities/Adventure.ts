// src/entities/Adventure.ts
// Converted from Base44 JSON schema to TypeScript

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
}

export interface Adventure {
  id?: string  // Added for database
  title: string  // Required
  description?: string
  location: string  // Required
  duration_hours: number  // Required
  budget_level: '$' | '$$' | '$$$'  // Required, enum
  estimated_cost?: number
  experience_type?: string
  steps?: AdventureStep[]
  is_shared?: boolean  // Default: false
  is_scheduled?: boolean  // Default: false
  scheduled_date?: string  // Date format
  is_completed?: boolean  // Default: false
  rating?: number  // 1-5 range
  completion_notes?: string
  
  // Additional fields for your app
  created_by?: string
  created_date?: string
  updated_at?: string
}

// Helper type for creating new adventures
export interface CreateAdventureInput {
  title: string
  location: string
  duration_hours: number
  budget_level: '$' | '$$' | '$$$'
  description?: string
  experience_type?: string
  steps?: AdventureStep[]
}

// Database operations class (if Base44 had methods)
export class AdventureEntity {
  static async create(data: CreateAdventureInput): Promise<Adventure> {
    // This will connect to your Supabase
    throw new Error('Not implemented yet')
  }
  
  static async filter(filters: any, sort?: string, limit?: number): Promise<Adventure[]> {
    // This will connect to your Supabase
    throw new Error('Not implemented yet')
  }
  
  static async findById(id: string): Promise<Adventure | null> {
    // This will connect to your Supabase
    throw new Error('Not implemented yet')
  }
}

export { AdventureEntity as Adventure }