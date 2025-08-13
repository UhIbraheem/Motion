export interface AdventureStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  location?: string;
  estimated_duration_minutes?: number;
  estimated_cost?: string;
  business_info?: {
    name: string;
    photos: string[];
    description: string;
    hours: string;
    avg_price: string;
    ai_description: string;
  };
}

export interface SavedAdventure {
  id: string;
  custom_title?: string;
  custom_description?: string;
  location: string;
  duration_hours: number;
  estimated_cost: string;
  rating: number;
  adventure_photos: Array<{
    photo_url: string;
    is_cover_photo: boolean;
  }>;
  user_saved: boolean;
  saved_at: string;
  scheduled_for?: string;
  adventure_steps: AdventureStep[];
  profiles?: any;
  is_completed?: boolean;
}

export interface Adventure {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  duration_hours: number;
  estimated_cost: string;
  rating?: number;
  created_at: string;
  scheduled_date?: string;
  adventure_steps: AdventureStep[];
  adventure_photos: Array<{
    photo_url: string;
    is_cover_photo: boolean;
  }>;
  filters_used?: {
    location?: string;
    duration?: string;
    budget?: string;
    interests?: string[];
  };
  is_completed?: boolean;
  status?: string;
}
