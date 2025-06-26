// frontend/src/services/aiService.ts - FRESH COMPLETE VERSION
import { ENV } from '../utils/env';

export interface AdventureFilters {
  location?: string;
  radius?: number; // miles
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
}

export class AIAdventureService {
  private baseURL: string;

  constructor() {
    this.baseURL = ENV.apiUrl; // Should be http://192.168.4.30:5000
    console.log('🤖 AI Service initialized with URL:', this.baseURL);
  }

  /**
   * Generate adventure plan using your backend AI
   */
  async generateAdventure(filters: AdventureFilters): Promise<{
    data: GeneratedAdventure | null;
    error: string | null;
  }> {
    try {
      console.log('🎯 Sending request to AI backend:', filters);

      // Format filters for your backend
      const requestBody = {
        app_filter: this.formatFiltersForBackend(filters),
        radius: filters.radius || 10,
      };

      console.log('📤 Request body:', requestBody);

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
      console.log('✅ Backend response:', backendData);

      // Transform backend response to frontend format
      const adventure = this.transformBackendResponse(backendData);

      return {
        data: adventure,
        error: null,
      };
    } catch (error) {
      console.error('❌ Network error:', error);
      return {
        data: null,
        error: 'Network error. Please check your connection and try again.',
      };
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
      console.log(`🔄 Regenerating step ${stepIndex}:`, userRequest);

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
   * Format frontend filters into backend-expected format
   */
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
      parts.push(`Group size: ${filters.groupSize} ${filters.groupSize === 1 ? 'person' : 'people'}`);
    }

    if (filters.transportMethod && filters.transportMethod !== 'flexible') {
      const transportMap = {
        walking: 'walking distance only (very close locations)',
        bike: 'bike or scooter friendly (short distances)',
        rideshare: 'rideshare/driving (can go further distances)',
      };
      parts.push(`Transportation: ${transportMap[filters.transportMethod as keyof typeof transportMap]}`);
    }

    if (filters.vibe && filters.vibe.length > 0) {
      parts.push(`Vibe: ${filters.vibe.join(', ')}`);
    }

    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      parts.push(`Dietary needs: ${filters.dietaryRestrictions.join(', ')}`);
    }

    if (filters.timeOfDay && filters.timeOfDay !== 'flexible') {
      parts.push(`Time preference: ${filters.timeOfDay}`);
    }

    const formatted = parts.join('\n');
    console.log('📝 Formatted filters for backend:', formatted);
    return formatted;
  }

  /**
   * Transform your backend response to frontend format
   */
  private transformBackendResponse(backendData: any): GeneratedAdventure {
    return {
      title: backendData.plan_title || 'Your Motion Adventure',
      steps: (backendData.steps || []).map((step: any) => ({
        time: step.time || 'Flexible',
        title: step.title || 'Adventure Stop',
        location: step.location || 'Location TBD',
        booking: step.booking || undefined,
        notes: step.notes || undefined,
      })),
      estimatedDuration: this.calculateDuration(backendData.steps || []),
      estimatedCost: this.estimateCost(backendData.steps || []),
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Calculate estimated duration from steps
   */
  private calculateDuration(steps: any[]): string {
    if (steps.length === 0) return '2 hours';
    
    // Estimate based on number of steps
    const estimatedHours = Math.max(2, steps.length * 1.5);
    
    if (estimatedHours <= 3) return `${Math.round(estimatedHours)} hours`;
    if (estimatedHours <= 6) return `${Math.round(estimatedHours)} hours`;
    return 'Full day';
  }

  /**
   * Estimate cost from steps (simple heuristic)
   */
  private estimateCost(steps: any[]): string {
    const foodSteps = steps.filter(step => 
      step.title?.toLowerCase().includes('restaurant') ||
      step.title?.toLowerCase().includes('cafe') ||
      step.title?.toLowerCase().includes('lunch') ||
      step.title?.toLowerCase().includes('dinner')
    );

    if (foodSteps.length <= 1) return '$';
    if (foodSteps.length <= 2) return '$$';
    return '$$$';
  }
}

// Export singleton instance
export const aiService = new AIAdventureService();