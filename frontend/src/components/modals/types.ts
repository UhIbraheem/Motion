// src/components/modals/types.ts - Shared types for modals
export interface AdventureStep {
  time: string;
  title: string;
  location: string;
  address?: string; // Full address for detailed location
  hours?: string; // Operating hours for the venue
  booking?: {
    method: string;
    link?: string;
    fallback?: string;
  };
  notes?: string;
  completed?: boolean;
}

export interface Adventure {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  estimated_cost: number;
  steps: AdventureStep[];
  is_completed: boolean;
  is_favorite?: boolean;
  created_at: string;
  scheduled_for?: string; // Frontend field that maps to scheduled_date in database
  is_scheduled?: boolean;
  scheduled_by_user_id?: string;
  schedule_reminder_sent?: boolean;
  step_completions?: { [stepIndex: number]: boolean };
  // Additional properties for category screens and discovery
  location?: string;
  rating?: number;
  price_range?: string;
  category?: string;
  subcategory?: string;
  images?: string[];
  // Community/review properties
  review?: string; // Review text for community adventures
  creator_name?: string; // Original plan creator name
  is_community?: boolean; // Whether it's from community feed
}

export interface ScheduleOption {
  label: string;
  date: string;
  fullDate: string;
}
