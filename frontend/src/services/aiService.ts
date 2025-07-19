// frontend/src/services/aiService.ts - COMPLETE UPDATED VERSION
import { supabase } from './supabase';
import { getAIDefinitionsForSelectedTypes } from '../data/experienceTypes';

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
  foodPreferences?: string[]; // NEW: Soft food preferences
  otherRestriction?: string;   // NEW: Custom restriction text
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
}

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
}

interface ShareAdventureData {
  userId: string;
  originalAdventureId: string;
  customTitle: string;
  customDescription: string;
  rating: number;
  photos: string[];
  location: string;
  durationHours: number;
  estimatedCost: string;
  steps: any[];
  completedDate: string;
}

export class AIAdventureService {
  private baseURL: string;

  constructor() {
    // Detect if we're on mobile or web and use appropriate URL
    const Platform = require('react-native').Platform;
    
    if (Platform.OS === 'web') {
      // Web can use localhost
      this.baseURL = 'http://localhost:5000/api/ai';
    } else {
      // Mobile needs your Mac's IP address
      this.baseURL = 'http://192.168.4.30:5000/api/ai';
    }
    
    console.log('🤖 AI Service using:', this.baseURL);
  }

  /**
   * Generate adventure plan
   */
  async generateAdventure(filters: AdventureFilters): Promise<{
    data: GeneratedAdventure | null;
    error: string | null;
  }> {
    try {
      console.log('🎯 Generating adventure with filters:', filters);

      const requestBody = {
        app_filter: this.formatFiltersForBackend(filters),
        radius: filters.radius || 10,
      };

      console.log('📤 Sending to backend:', requestBody);

      const response = await fetch(`${this.baseURL}/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error:', response.status, errorText);
        return {
          data: null,
          error: `Backend error: ${response.status}`,
        };
      }

      const backendData = await response.json();
      console.log('✅ Got response:', backendData);

      // Transform to our format
      const adventure: GeneratedAdventure = {
        title: backendData.plan_title || 'Your Adventure',
        steps: backendData.steps || [],
        estimatedDuration: this.calculateDuration(backendData.steps || []),
        estimatedCost: this.estimateCost(backendData.steps || [], filters.budget),
        createdAt: new Date().toISOString(),
        description: `A ${filters.duration} adventure in ${filters.location}`,
        location: filters.location,
        filtersUsed: filters,
      };

      return { data: adventure, error: null };

    } catch (error) {
      console.error('❌ Network error:', error);
      return {
        data: null,
        error: 'Cannot connect to backend. Make sure it\'s running on localhost:3001',
      };
    }
  }

  /**
   * Save adventure to database
   */
  async saveAdventure(adventure: GeneratedAdventure, userId: string): Promise<{
    data: any | null;
    error: string | null;
  }> {
    try {
      console.log('💾 Saving adventure:', adventure.title);

      const adventureData = {
        user_id: userId,
        title: adventure.title,
        description: adventure.description || 'A Motion adventure',
        duration_hours: this.parseHoursFromDuration(adventure.estimatedDuration),
        estimated_cost: this.parseCostFromString(adventure.estimatedCost),
        difficulty_level: 'easy',
        steps: adventure.steps,
        filters_used: adventure.filtersUsed,
        is_completed: false,
        is_favorite: false,
        ai_confidence_score: 0.8,
        step_completions: {}, // Initialize empty step completions
      };

      const { data, error } = await supabase
        .from('adventures')
        .insert([adventureData])
        .select()
        .single();

      if (error) {
        console.error('❌ Save error:', error);
        return { data: null, error: error.message };
      }

      console.log('✅ Saved successfully!');
      return { data, error: null };

    } catch (error) {
      console.error('❌ Save failed:', error);
      return { data: null, error: 'Failed to save adventure' };
    }
  }

  /**
   * Get user adventures
   */
  async getUserAdventures(userId: string): Promise<{
    data: any[] | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('adventures')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to load adventures' };
    }
  }

  

  /**
   * Delete adventure from database
   */
  async deleteAdventure(adventureId: string): Promise<{
    error: string | null;
  }> {
    try {
      console.log('🗑️ Deleting adventure:', adventureId);

      const { error } = await supabase
        .from('adventures')
        .delete()
        .eq('id', adventureId);

      if (error) {
        console.error('❌ Delete error:', error);
        return { error: error.message };
      }

      console.log('✅ Adventure deleted successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected delete error:', error);
      return { error: 'Failed to delete adventure' };
    }
  }

  /**
   * Update step completion for an adventure
   */
  async updateStepCompletion(
    adventureId: string, 
    stepIndex: number, 
    completed: boolean
  ): Promise<{
    error: string | null;
  }> {
    try {
      console.log(`📝 Updating step ${stepIndex} completion:`, completed);

      // First, get the current adventure to read existing step_completions
      const { data: adventure, error: fetchError } = await supabase
        .from('adventures')
        .select('step_completions')
        .eq('id', adventureId)
        .single();

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        return { error: fetchError.message };
      }

      // Update the step_completions object
      const currentCompletions = adventure?.step_completions || {};
      const updatedCompletions = {
        ...currentCompletions,
        [stepIndex]: completed
      };

      // Update the adventure with new step completions
      const { error: updateError } = await supabase
        .from('adventures')
        .update({ step_completions: updatedCompletions })
        .eq('id', adventureId);

      if (updateError) {
        console.error('❌ Update error:', updateError);
        return { error: updateError.message };
      }

      console.log('✅ Step completion updated successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected step completion error:', error);
      return { error: 'Failed to update step completion' };
    }
  }

  /**
   * Update adventure schedule/date
   */
  async updateAdventureSchedule(adventureId: string, newDate: string): Promise<{
    error: string | null;
  }> {
    try {
      console.log('📅 Updating adventure schedule...', { adventureId, newDate });

      const { error } = await supabase
        .from('plans')
        .update({ 
          scheduled_for: new Date(newDate).toISOString()
        })
        .eq('id', adventureId);

      if (error) {
        console.error('❌ Supabase schedule update error:', error);
        return { error: error.message };
      }

      console.log('✅ Adventure schedule updated successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected schedule update error:', error);
      return { error: 'Failed to update adventure schedule' };
    }
  }

  /**
   * Mark entire adventure as completed
   */
  async markAdventureComplete(adventureId: string): Promise<{
    error: string | null;
  }> {
    try {
      console.log('🎉 Marking adventure as complete:', adventureId);

      // First get the adventure to know how many steps there are
      const { data: adventure, error: fetchError } = await supabase
        .from('adventures')
        .select('steps')
        .eq('id', adventureId)
        .single();

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        return { error: fetchError.message };
      }

      // Create step completions object with all steps marked as completed
      const allStepsCompleted: { [stepIndex: number]: boolean } = {};
      if (adventure?.steps) {
        adventure.steps.forEach((_: any, index: number) => {
          allStepsCompleted[index] = true;
        });
      }

      const { error } = await supabase
        .from('adventures')
        .update({ 
          is_completed: true,
          step_completions: allStepsCompleted
        })
        .eq('id', adventureId);

      if (error) {
        console.error('❌ Mark complete error:', error);
        return { error: error.message };
      }

      console.log('✅ Adventure marked as complete');
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected mark complete error:', error);
      return { error: 'Failed to mark adventure as complete' };
    }
  }

  /**
   * Toggle adventure favorite status
   */
  async toggleAdventureFavorite(adventureId: string, isFavorite: boolean): Promise<{
    error: string | null;
  }> {
    try {
      console.log('⭐ Toggling favorite status:', isFavorite);

      const { error } = await supabase
        .from('adventures')
        .update({ is_favorite: isFavorite })
        .eq('id', adventureId);

      if (error) {
        console.error('❌ Favorite toggle error:', error);
        return { error: error.message };
      }

      console.log('✅ Favorite status updated');
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected favorite toggle error:', error);
      return { error: 'Failed to toggle favorite status' };
    }
  }

  /**
   * Share adventure to community
   */
  async shareCommunityAdventure(data: ShareAdventureData) {
    try {
      // Create the community adventure
      const { data: adventure, error } = await supabase
        .from('community_adventures')
        .insert({
          user_id: data.userId,
          original_adventure_id: data.originalAdventureId,
          custom_title: data.customTitle,
          custom_description: data.customDescription,
          rating: data.rating,
          location: data.location,
          duration_hours: data.durationHours,
          estimated_cost: data.estimatedCost,
          steps: data.steps,
          completed_date: data.completedDate,
          featured: false,
          is_public: true
        })
        .select()
        .single();

      if (error) throw error;

      // Upload photos if any
      if (data.photos.length > 0) {
        const photoInserts = data.photos.map((photoUri, index) => ({
          community_adventure_id: adventure.id,
          photo_url: photoUri, // In production, upload to storage first
          caption: '',
          is_cover: index === 0,
          order_index: index
        }));

        await supabase
          .from('adventure_photos')
          .insert(photoInserts);
      }

      return { data: adventure, error: null };
    } catch (error) {
      console.error('Error sharing adventure:', error);
      return { data: null, error };
    }
  }

  /**
   * Regenerate a specific step in an adventure
   */
  async regenerateStep(
    stepIndex: number,
    currentStep: AdventureStep,
    allSteps: AdventureStep[],
    userRequest: string,
    originalFilters: AdventureFilters
  ): Promise<{
    data: AdventureStep | null;
    error: string | null;
  }> {
    try {
      console.log(`🔄 Regenerating step ${stepIndex + 1}:`, userRequest);

      const requestBody = {
        stepIndex,
        currentStep,
        allSteps,
        userRequest,
        originalFilters: this.formatFiltersForBackend(originalFilters),
        radius: originalFilters.radius || 10,
      };

      const response = await fetch(`${this.baseURL}/regenerate-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Step regeneration failed:', response.status, errorText);
        return {
          data: null,
          error: `Step regeneration failed: ${response.status}`,
        };
      }

      const backendData = await response.json();
      console.log('✅ Step regenerated:', backendData.newStep.title);

      // Transform the new step
      const newStep: AdventureStep = {
        time: backendData.newStep.time,
        title: backendData.newStep.title,
        location: backendData.newStep.location,
        booking: backendData.newStep.booking || undefined,
        notes: backendData.newStep.notes || undefined,
      };

      return {
        data: newStep,
        error: null,
      };
    } catch (error) {
      console.error('❌ Network error during step regeneration:', error);
      return {
        data: null,
        error: 'Network error. Please check your connection and try again.',
      };
    }
  }

/**
 * Get community adventures for Discover feed - WITH USER DATA
 */
async getCommunityAdventures(): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('community_adventures')
      .select(`
        id,
        user_id,
        original_adventure_id,
        custom_title,
        custom_description,
        rating,
        location,
        duration_hours,
        estimated_cost,
        steps,
        created_at,
        adventure_photos (
          photo_url,
          is_cover_photo
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching community adventures:', error);
      return { data: null, error: error.message };
    }

    // Get user profile data separately for each adventure
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(adventure => adventure.user_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        // Continue without profile data rather than failing completely
        return { data, error: null };
      }

      // Merge profile data with adventure data
      const adventuresWithProfiles = data.map(adventure => {
        const profile = profilesData?.find(p => p.id === adventure.user_id);
        return {
          ...adventure,
          profiles: profile || { first_name: null, last_name: null }
        };
      });

      return { data: adventuresWithProfiles, error: null };
    }

    return { data, error: null };
  } catch (err) {
    console.error('❌ Unexpected error fetching community adventures:', err);
    return { data: null, error: 'Unexpected error occurred' };
  }
}

  // Helper methods
  private formatTimeDisplay(time: string): string {
    const hour = parseInt(time.split(':')[0]);
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  }

  private formatFiltersForBackend(filters: AdventureFilters): string {
    const parts: string[] = [];

    // Duration and timing (MOST IMPORTANT)
    if (filters.duration) {
      const durationMap = {
        'quick': '2 hours',
        'half-day': '4-6 hours', 
        'full-day': '8+ hours'
      };
      parts.push(`Duration: ${durationMap[filters.duration as keyof typeof durationMap] || filters.duration}`);
    }

    // START TIME AND END TIME - Critical timing info
    if (filters.startTime) {
      parts.push(`Start time: ${filters.startTime} (${this.formatTimeDisplay(filters.startTime)})`);
    }
    
    if (filters.endTime) {
      parts.push(`End time: ${filters.endTime} (${this.formatTimeDisplay(filters.endTime)})`);
    }

    // Flexible timing
    if (filters.flexibleTiming) {
      parts.push('Flexible timing: Allow +/- 1 hour flexibility');
    }

    // Location
    if (filters.location) {
      parts.push(`Location: ${filters.location}`);
    }

    // Experience types with AI definitions
    if (filters.experienceTypes && filters.experienceTypes.length > 0) {
      const aiDefinitions = getAIDefinitionsForSelectedTypes(filters.experienceTypes);
      if (aiDefinitions.length > 0) {
        parts.push(`Experience types and preferences:\n${aiDefinitions.join('\n')}`);
      }
    }

    // Group size
    if (filters.groupSize) {
      parts.push(`Group size: ${filters.groupSize}`);
    }

    // Budget
    if (filters.budget) {
      const budgetMap = {
        'budget': 'Budget-friendly ($)',
        'moderate': 'Moderate ($$)',
        'premium': 'Premium ($$$)'
      };
      parts.push(`Budget: ${budgetMap[filters.budget as keyof typeof budgetMap] || filters.budget}`);
    }

    // Radius
    if (filters.radius) {
      parts.push(`Max distance: ${filters.radius} miles from location`);
    }

    // Dietary restrictions
    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      parts.push(`Dietary restrictions (REQUIRED): ${filters.dietaryRestrictions.join(', ')}`);
    }

    // Food preferences
    if (filters.foodPreferences && filters.foodPreferences.length > 0) {
      parts.push(`Food preferences: ${filters.foodPreferences.join(', ')}`);
    }

    // Custom restriction
    if (filters.otherRestriction) {
      parts.push(`Other restriction: ${filters.otherRestriction}`);
    }

    return parts.join('\n');
  }

  private calculateDuration(steps: any[]): string {
    if (steps.length <= 2) return '2 hours';
    if (steps.length <= 4) return '4 hours';
    return '6+ hours';
  }

  private estimateCost(steps: any[], userBudget?: string): string {
    // Use the user's actual budget preference if provided
    if (userBudget) {
      const budgetMap: Record<string, string> = {
        'budget': '$',
        'moderate': '$$', 
        'premium': '$$$'
      };
      return budgetMap[userBudget] || '$$';
    }

    // Fallback to old logic if no budget provided
    const foodSteps = steps.filter((step: any) => 
      step.title?.toLowerCase().includes('restaurant') ||
      step.title?.toLowerCase().includes('cafe') ||
      step.title?.toLowerCase().includes('lunch')
    );

    if (foodSteps.length <= 1) return '$';
    if (foodSteps.length <= 2) return '$$';
    return '$$$';
  }

  private parseHoursFromDuration(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 4;
  }

  private parseCostFromString(cost: string): number {
    const costMap: Record<string, number> = {
      '$': 25,
      '$$': 75,
      '$$$': 150,
    };
    return costMap[cost] || 50; // Default to moderate if unknown
  }
}

// Export singleton
export const aiService = new AIAdventureService();