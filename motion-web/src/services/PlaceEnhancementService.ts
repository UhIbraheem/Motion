/**
 * Service to enhance existing adventures with Google Places data
 * Fetches missing photos, ratings, and business info for saved adventures
 */

interface PlaceEnhancement {
  placeId?: string;
  rating?: number;
  photos?: string[];
  businessHours?: string[];
  phone?: string;
  website?: string;
  validated: boolean;
}

interface EnhancedStep {
  id?: string;
  title: string;
  location: string;
  description: string;
  tips?: string;
  estimatedTime?: string;
  enhancement?: PlaceEnhancement;
}

class PlaceEnhancementService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.motionflow.app' 
    : 'https://api.motionflow.app';

  /**
   * Enhance an adventure with Google Places data for missing info
   */
  async enhanceAdventure(adventureId: string): Promise<{ success: boolean; enhanced: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/places/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adventureId }),
      });

      if (!response.ok) {
        throw new Error(`Enhancement failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Place enhancement error:', error);
      return { 
        success: false, 
        enhanced: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if an adventure needs enhancement (missing photos/ratings)
   */
  async checkEnhancementNeeded(adventureId: string): Promise<{ needed: boolean; missingData: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/places/check-enhancement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adventureId }),
      });

      if (!response.ok) {
        return { needed: false, missingData: [] };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Enhancement check error:', error);
      return { needed: false, missingData: [] };
    }
  }

  /**
   * Batch enhance multiple adventures
   */
  async enhanceMultipleAdventures(adventureIds: string[]): Promise<{ 
    results: Array<{ adventureId: string; success: boolean; enhanced: boolean; error?: string }> 
  }> {
    const results = [];
    
    for (const adventureId of adventureIds) {
      const result = await this.enhanceAdventure(adventureId);
      results.push({ adventureId, ...result });
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { results };
  }
}

export default new PlaceEnhancementService();
