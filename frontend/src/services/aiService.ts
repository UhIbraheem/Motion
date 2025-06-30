// frontend/src/services/aiService.ts - SIMPLE WORKING VERSION
import { supabase } from './supabase';

export interface AdventureFilters {
  location?: string;
  radius?: number;
  duration?: 'quick' | 'half-day' | 'full-day';
  budget?: 'budget' | 'moderate' | 'premium';
  vibe?: string[];
  dietaryRestrictions?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  groupSize?: number;
  transportMethod?: 'walking' | 'bike' | 'rideshare' | 'flexible';
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

export class AIAdventureService {
  private baseURL: string;

  constructor() {
    // Detect if we're on mobile or web and use appropriate URL
    const Platform = require('react-native').Platform;
    
    if (Platform.OS === 'web') {
      // Web can use localhost
      this.baseURL = 'http://localhost:3001/api/ai';
    } else {
      // Mobile needs your Mac's IP address
      this.baseURL = 'http://192.168.4.27:3001/api/ai';
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
        estimatedCost: this.estimateCost(backendData.steps || []),
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
  // Helper methods
  private formatFiltersForBackend(filters: AdventureFilters): string {
    const parts: string[] = [];

    if (filters.location) {
      parts.push(`Location: ${filters.location}`);
    }

    if (filters.duration) {
      const durationMap = {
        quick: '2 hours or less',
        'half-day': '4-6 hours',
        'full-day': 'full day (8+ hours)',
      };
      parts.push(`Duration: ${durationMap[filters.duration]}`);
    }

    if (filters.budget) {
      const budgetMap = {
        budget: 'Budget-friendly ($)',
        moderate: 'Moderate budget ($$)',
        premium: 'Higher-end ($$$)',
      };
      parts.push(`Budget: ${budgetMap[filters.budget]}`);
    }

    if (filters.groupSize) {
      parts.push(`Group size: ${filters.groupSize} people`);
    }

    if (filters.vibe && filters.vibe.length > 0) {
      parts.push(`Vibe: ${filters.vibe.join(', ')}`);
    }

    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      parts.push(`Dietary needs: ${filters.dietaryRestrictions.join(', ')}`);
    }

    return parts.join('\n');
  }

  private calculateDuration(steps: any[]): string {
    if (steps.length <= 2) return '2 hours';
    if (steps.length <= 4) return '4 hours';
    return '6+ hours';
  }

  private estimateCost(steps: any[]): string {
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