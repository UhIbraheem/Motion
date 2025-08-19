// Shared adventure types that match the Supabase database schema exactly
// This ensures consistency between frontend, backend, and database

export interface DatabaseAdventure {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  duration_hours?: number;
  estimated_cost?: number;
  steps?: AdventureStep[];
  filters_used?: Record<string, any>;
  ai_confidence_score?: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  is_completed: boolean;
  is_favorite: boolean;
  is_scheduled: boolean;
  scheduled_date?: string;
  schedule_reminder_sent: boolean;
  scheduled_by_user_id?: string;
  generation_count: number;
  edit_count: number;
  adventure_type: 'single_day' | 'itinerary' | 'multi_day';
  likes_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
  step_completions?: Record<string, boolean>;
}

export interface AdventureStep {
  time: string;
  title: string;
  location: string;
  booking?: {
    method: string;
    link?: string;
    fallback?: string;
  };
  notes?: string;
  // Google Places business data
  business_name?: string;
  rating?: number;
  business_hours?: string;
  business_phone?: string;
  business_website?: string;
  validated?: boolean;
  photos?: any[];
  place_id?: string;
  price_level?: number;
}

export interface CommunityAdventure {
  id: string;
  user_id: string;
  original_adventure_id: string;
  custom_title: string;
  custom_description?: string;
  rating?: number;
  location?: string;
  duration_hours?: number;
  estimated_cost?: string;
  steps: AdventureStep[];
  completed_date: string;
  view_count: number;
  save_count: number;
  heart_count: number;
  is_public: boolean;
  featured: boolean;
  shared_date: string;
  created_at: string;
  updated_at: string;
}

export interface AdventurePhoto {
  id: string;
  community_adventure_id?: string;
  adventure_id?: string;
  user_id: string;
  photo_url: string;
  photo_caption?: string;
  step_index?: number;
  is_cover_photo: boolean;
  source: 'google_business' | 'google_review' | 'user';
  width?: number;
  height?: number;
  attribution?: string;
  place_id?: string;
  created_at: string;
}

export interface AdventureTag {
  id: string;
  community_adventure_id?: string;
  adventure_id?: string;
  tag_name: string;
  tag_type: 'vibe' | 'category' | 'season' | 'time';
  created_at: string;
}

// Filters for adventure generation (frontend input)
export interface AdventureFilters {
  location?: string;
  radius?: number;
  duration?: 'quick' | 'half-day' | 'full-day';
  budget?: 'budget' | 'moderate' | 'premium';
  dietaryRestrictions?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  groupSize?: number;
  transportMethod?: 'walking' | 'bike' | 'rideshare' | 'flexible';
  experienceTypes?: string[];
  startTime?: string;
  endTime?: string;
  flexibleTiming?: boolean;
  customEndTime?: boolean;
  foodPreferences?: string[];
  otherRestriction?: string;
}

// Legacy interface for backward compatibility (to be phased out)
export interface GeneratedAdventure {
  id?: string;
  title: string;
  steps: AdventureStep[];
  estimatedDuration: string;
  estimatedCost: string;
  createdAt: string;
  description?: string;
  location?: string;
  isCompleted?: boolean;
  isFavorite?: boolean;
  filtersUsed?: AdventureFilters;
  scheduledFor?: string;
  rating?: number;
  category?: string;
}

// Transformation functions to convert between formats
export const transformGeneratedToDatabase = (
  generated: GeneratedAdventure,
  userId: string
): Partial<DatabaseAdventure> => {
  return {
    user_id: userId,
    title: generated.title,
    description: generated.description,
    duration_hours: parseEstimatedDuration(generated.estimatedDuration),
    estimated_cost: parseEstimatedCost(generated.estimatedCost),
    steps: generated.steps,
    filters_used: generated.filtersUsed || {},
    ai_confidence_score: 0.8,
    difficulty_level: 'easy',
    is_completed: generated.isCompleted || false,
    is_favorite: generated.isFavorite || false,
    is_scheduled: !!generated.scheduledFor,
    scheduled_date: generated.scheduledFor,
    adventure_type: 'single_day',
    generation_count: 1,
    edit_count: 0,
    likes_count: 0,
    saves_count: 0,
    schedule_reminder_sent: false
  };
};

export const transformDatabaseToGenerated = (
  db: DatabaseAdventure
): GeneratedAdventure => {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    steps: db.steps || [],
    estimatedDuration: db.duration_hours ? `${db.duration_hours} hours` : '4 hours',
    estimatedCost: db.estimated_cost ? `$${db.estimated_cost}` : '$50',
    createdAt: db.created_at,
    isCompleted: db.is_completed,
    isFavorite: db.is_favorite,
    scheduledFor: db.scheduled_date,
    filtersUsed: db.filters_used as AdventureFilters
  };
};

// Helper functions
const parseEstimatedDuration = (duration: string): number => {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 4;
};

const parseEstimatedCost = (cost: string): number => {
  const match = cost.match(/\$?(\d+)/);
  return match ? parseInt(match[1]) : 50;
};
