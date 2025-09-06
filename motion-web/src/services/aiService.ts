// Web-adapted AI service for Motion web app
import { buildAIPromptForVibes } from '@/data/vibes';
import { detectCurrencyFromLocation, getBudgetPromptText } from '@/config/budgetConfig';

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
  scheduledFor?: string;
  rating?: number;
  category?: string;
  // Enhanced data for new schema
  experienceTypes?: string[];
  vibe?: string;
  budget?: string;
  groupSize?: number;
  radius?: number;
}

export class WebAIAdventureService {
  private baseURL: string;

  constructor() {
    // Use environment variable with fallback
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.motionflow.app';
    console.log('🔧 AI Service initialized with baseURL:', this.baseURL);
  }

  /**
   * Generate adventure plan using backend AI service
   */
  async generateAdventure(filters: AdventureFilters): Promise<{
    data: GeneratedAdventure | null;
    error: string | null;
  }> {
    try {
      const requestBody = {
        app_filter: this.formatFiltersForBackend(filters),
        radius: filters.radius || 10,
      };

      console.log('🚀 Generating adventure:', requestBody);

      const response = await fetch(`${this.baseURL}/api/ai/generate-plan`, {
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
          error: `Backend error: ${response.status} - ${errorText}`,
        };
      }

      const backendData = await response.json();
      console.log('✅ Adventure generated:', backendData.title);

      // Transform backend response to our format (with enhanced data)
      const adventure: GeneratedAdventure = {
        title: backendData.title || backendData.plan_title || this.generateDefaultTitle(filters),
        steps: this.transformSteps(backendData.steps || []),
        estimatedDuration: backendData.estimatedDuration || this.calculateDuration(backendData.steps || []),
        estimatedCost: backendData.estimatedCost || this.estimateCost(backendData.steps || [], filters.budget),
        createdAt: new Date().toISOString(),
        description: backendData.description || this.generateDefaultDescription(filters),
        location: filters.location,
        filtersUsed: filters,
        // Enhanced data for new schema
        experienceTypes: filters.experienceTypes,
        vibe: this.extractVibe(filters.experienceTypes || []),
        budget: filters.budget,
        groupSize: filters.groupSize,
        radius: filters.radius,
        category: this.determineCategory(filters.experienceTypes || []),
        rating: 4.5 // Default rating for new adventures
      };

      return { data: adventure, error: null };

    } catch (error) {
      console.error('💥 Network error:', error);
      return {
        data: null,
        error: 'Cannot connect to backend. Please check your internet connection.',
      };
    }
  }

  /**
   * Regenerate a single step using backend per-step endpoint
   */
  async regenerateStep(original: GeneratedAdventure, stepIndex: number, userRequest: string = 'Regenerate this step'): Promise<{ step: AdventureStep | null; error: string | null; }> {
    const backendUrl = `${this.baseURL}/api/ai/regenerate-step`;
    try {
      const filters = original.filtersUsed || {} as AdventureFilters;
      const allSteps = original.steps;
      const currentStep = allSteps[stepIndex];
      const radius = filters.radius || 10;
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepIndex,
          currentStep,
          allSteps,
          userRequest,
          originalFilters: this.formatFiltersForBackend(filters),
          radius
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        return { step: null, error: errorText };
      }
      const data = await res.json();
      if (data.newStep) {
        return { step: data.newStep, error: null };
      }
      return { step: null, error: 'No step returned' };
    } catch (e: any) {
      return { step: null, error: e.message || 'Unexpected error regenerating step' };
    }
  }

  /**
   * Save adventure to backend (will implement database integration)
   */
  async saveAdventure(
    adventure: GeneratedAdventure, 
    userId: string, 
    scheduledDate?: string
  ): Promise<{
    data: any | null;
    error: string | null;
  }> {
    try {
      const saveData = {
        userId,
        adventure: {
          ...adventure,
          scheduledFor: scheduledDate || null,
          isScheduled: !!scheduledDate,
        }
      };

      const response = await fetch(`${this.baseURL}/api/adventures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: `Save failed: ${errorText}` };
      }

      const savedAdventure = await response.json();
      return { data: savedAdventure, error: null };

    } catch (error) {
      console.error('💥 Save adventure error:', error);
      return { data: null, error: 'Failed to save adventure' };
    }
  }

  /**
   * Get user's saved adventures
   */
  async getUserAdventures(userId: string): Promise<{
    data: GeneratedAdventure[] | null;
    error: string | null;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/api/adventures/user/${userId}`, {
        // Remove Authorization header as it's not being used
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: `Failed to fetch adventures: ${errorText}` };
      }

      const adventures = await response.json();
      return { data: adventures, error: null };

    } catch (error) {
      console.error('💥 Fetch adventures error:', error);
      return { data: null, error: 'Failed to fetch adventures' };
    }
  }

  /**
   * Update adventure (mark as completed, add rating, etc.)
   */
  async updateAdventure(
    adventureId: string, 
    updates: Partial<GeneratedAdventure>
  ): Promise<{
    data: any | null;
    error: string | null;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/api/adventures/${adventureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: `Update failed: ${errorText}` };
      }

      const updatedAdventure = await response.json();
      return { data: updatedAdventure, error: null };

    } catch (error) {
      console.error('💥 Update adventure error:', error);
      return { data: null, error: 'Failed to update adventure' };
    }
  }

  // Helper methods
  private formatFiltersForBackend(filters: AdventureFilters): string {
    const parts: string[] = [];

    if (filters.location) parts.push(`Location: ${filters.location}`);
    if (filters.experienceTypes?.length) {
      const definitions = this.getAIDefinitionsForTypes(filters.experienceTypes);
      parts.push(`Experience Types: ${definitions}`);
    }
    if (filters.duration) parts.push(`Duration: ${filters.duration}`);
    
    // Enhanced budget formatting with currency detection
    if (filters.budget) {
      const currency = filters.location ? detectCurrencyFromLocation(filters.location) : 'USD';
      const groupSize = filters.groupSize || 1;
      const budgetText = getBudgetPromptText(filters.budget, currency, groupSize);
      parts.push(budgetText);
    }
    
    if (filters.timeOfDay && filters.timeOfDay !== 'flexible') {
      parts.push(`Time of Day: ${filters.timeOfDay}`);
    }
    if (filters.startTime) {
      parts.push(`Start at: ${filters.startTime}`);
    }
    if (filters.endTime) {
      parts.push(`End by: ${filters.endTime}`);
    }
    if (filters.groupSize) parts.push(`Group Size: ${filters.groupSize}`);
    if (filters.transportMethod && filters.transportMethod !== 'flexible') {
      parts.push(`Transportation: ${filters.transportMethod}`);
    }
    if (filters.dietaryRestrictions?.length) {
      parts.push(`Dietary Restrictions: ${filters.dietaryRestrictions.join(', ')}`);
    }
    if (filters.foodPreferences?.length) {
      parts.push(`Food Preferences: ${filters.foodPreferences.join(', ')}`);
    }
    if (filters.otherRestriction?.trim()) {
      parts.push(`Other Requirements: ${filters.otherRestriction}`);
    }

    return parts.join('; ');
  }

  private getAIDefinitionsForTypes(types: string[]): string {
    return buildAIPromptForVibes(types);
  }

  private transformSteps(backendSteps: any[]): AdventureStep[] {
    return backendSteps.map(step => ({
      time: step.time || '',
      title: step.title || step.name || '',
      location: step.location || '',
      booking: step.booking || undefined,
      notes: step.notes || step.description || '',
      // Preserve Google Places business data
      business_name: step.business_name || '',
      rating: step.rating || undefined,
      business_hours: step.business_hours || undefined,
      business_phone: step.business_phone || undefined,
      business_website: step.business_website || undefined,
      validated: step.validated || false,
      photos: step.photos || [],
    }));
  }

  private calculateDuration(steps: any[]): string {
    // Simple duration calculation
    if (steps.length <= 2) return '2-3 hours';
    if (steps.length <= 4) return '4-6 hours';
    return '6+ hours';
  }

  private estimateCost(steps: any[], budget?: string): string {
    // Use the updated budget ranges
    if (!budget) return '$15-45 per person';
    
    const budgetMap = {
      'budget': '$0-30 per person',
      'moderate': '$30-70 per person', 
      'premium': '$70+ per person'
    };

    return budgetMap[budget as keyof typeof budgetMap] || '$15-45 per person';
  }

  private generateDefaultTitle(filters: AdventureFilters): string {
    const location = filters.location || 'Local Area';
    const experience = filters.experienceTypes?.[0] || 'adventure';
    return `${experience} in ${location}`;
  }

  private generateDefaultDescription(filters: AdventureFilters): string {
    return `A personalized ${filters.duration || 'half-day'} adventure created just for you, featuring ${filters.experienceTypes?.join(', ') || 'exciting activities'} in ${filters.location || 'your area'}.`;
  }

  private determineCategory(experienceTypes: string[]): string {
    if (experienceTypes.includes('nature')) return 'Nature';
    if (experienceTypes.includes('partier')) return 'Nightlife';
    if (experienceTypes.includes('academic-weapon')) return 'Culture';
    if (experienceTypes.includes('hidden-gem')) return 'Local Gems';
    return 'Adventure';
  }

  private extractVibe(experienceTypes: string[]): string | undefined {
    // Extract vibe from experience types (vibes are: romantic, chill, spontaneous, trending, mindful, special-occasion)
    const vibes = ['romantic', 'chill', 'spontaneous', 'trending', 'mindful', 'special-occasion'];
    return experienceTypes.find(type => vibes.includes(type));
  }
}

// Export singleton instance
export const aiService = new WebAIAdventureService();