// Web-adapted AI service for Motion web app
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
}

export class WebAIAdventureService {
  private baseURL: string;

  constructor() {
    // Web app uses production Railway backend
    this.baseURL = 'https://motion-backend-production.up.railway.app/api/ai';
    console.log('🤖 Web AI Service initialized:', this.baseURL);
  }

  /**
   * Generate adventure plan using backend AI service
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
          error: `Backend error: ${response.status} - ${errorText}`,
        };
      }

      const backendData = await response.json();
      console.log('✅ Got response:', backendData);

      // Transform backend response to our format
      const adventure: GeneratedAdventure = {
        title: backendData.plan_title || this.generateDefaultTitle(filters),
        steps: this.transformSteps(backendData.steps || []),
        estimatedDuration: this.calculateDuration(backendData.steps || []),
        estimatedCost: this.estimateCost(backendData.steps || [], filters.budget),
        createdAt: new Date().toISOString(),
        description: this.generateDefaultDescription(filters),
        location: filters.location,
        filtersUsed: filters,
        category: this.determineCategory(filters.experienceTypes || []),
        rating: 4.5, // Default rating for new adventures
      };

      return { data: adventure, error: null };

    } catch (error) {
      console.error('❌ Network error:', error);
      return {
        data: null,
        error: 'Cannot connect to backend. Check your internet connection.',
      };
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
      console.log('💾 Saving adventure:', adventure.title);
      
      const saveData = {
        userId,
        adventure: {
          ...adventure,
          scheduledFor: scheduledDate || null,
          isScheduled: !!scheduledDate,
        }
      };

      const response = await fetch('https://motion-backend-production.up.railway.app/api/adventures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: `Save failed: ${errorText}` };
      }

      const savedAdventure = await response.json();
      console.log('✅ Adventure saved successfully!');
      return { data: savedAdventure, error: null };

    } catch (error) {
      console.error('❌ Save failed:', error);
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
      const response = await fetch(`https://motion-backend-production.up.railway.app/api/adventures/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: `Failed to fetch adventures: ${errorText}` };
      }

      const adventures = await response.json();
      return { data: adventures, error: null };

    } catch (error) {
      console.error('❌ Failed to fetch adventures:', error);
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
      const response = await fetch(`https://motion-backend-production.up.railway.app/api/adventures/${adventureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
      console.error('❌ Update failed:', error);
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
    if (filters.budget) parts.push(`Budget: ${filters.budget}`);
    if (filters.timeOfDay && filters.timeOfDay !== 'flexible') {
      parts.push(`Time of Day: ${filters.timeOfDay}`);
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
    // Simple mapping - in full implementation, import from experienceTypes.ts
    const definitions = {
      'hidden-gem': 'Off-the-beaten-path discoveries, local favorites',
      'explorer': 'Adventure and discovery focused activities',
      'nature': 'Outdoor activities and green spaces',
      'partier': 'Nightlife and social experiences',
      'solo-freestyle': 'Flexible solo-friendly activities',
      'academic-weapon': 'Educational and intellectual pursuits',
    };

    return types.map(type => definitions[type as keyof typeof definitions] || type).join(', ');
  }

  private transformSteps(backendSteps: any[]): AdventureStep[] {
    return backendSteps.map(step => ({
      time: step.time || '',
      title: step.title || step.name || '',
      location: step.location || '',
      booking: step.booking || undefined,
      notes: step.notes || step.description || '',
    }));
  }

  private calculateDuration(steps: any[]): string {
    // Simple duration calculation
    if (steps.length <= 2) return '2-3 hours';
    if (steps.length <= 4) return '4-6 hours';
    return '6+ hours';
  }

  private estimateCost(steps: any[], budget?: string): string {
    const baseMultiplier = {
      'budget': 1,
      'moderate': 2,
      'premium': 3,
    };

    const multiplier = baseMultiplier[budget as keyof typeof baseMultiplier] || 1;
    const baseCost = steps.length * 15 * multiplier;

    if (baseCost < 30) return '$';
    if (baseCost < 80) return '$$';
    return '$$$';
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
}

// Export singleton instance
export const aiService = new WebAIAdventureService();
