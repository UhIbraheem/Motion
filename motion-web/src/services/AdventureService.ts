// Supabase Adventure Service for real data integration
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import businessPhotosService from './BusinessPhotosService';

interface BusinessPhoto {
  url: string;
  width: number;
  height: number;
  source: 'google' | 'ai_generated';
  photo_reference?: string;
}

interface AdventureStep {
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

interface SavedAdventure {
  id: string;
  custom_title: string;
  custom_description?: string;
  description?: string;
  location: string;
  duration_hours: number;
  estimated_cost: string;
  rating: number;
  adventure_photos: Array<{ photo_url: string; is_cover_photo: boolean }>;
  saves_count?: number;
  likes_count?: number;
  user_saved: boolean;
  saved_at: string;
  scheduled_for?: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
  adventure_steps?: AdventureStep[];
}

const ENABLE_STEP_PHOTOS = false; // Disable remote photo fetching to keep UI snappy

class AdventureService {
  private supabase = createClientComponentClient();

  /**
   * Get saved adventures for the current user (both user's own adventures and saved community adventures)
   */
  async getUserSavedAdventures(userId: string): Promise<SavedAdventure[]> {
    try {
      console.log('Fetching adventures for user:', userId);
      
      // Get user's own adventures (supports two shapes)
      const { data: userAdventures, error: userError } = await this.supabase
        .from('adventures')
        .select(`
          id,
          user_id,
          custom_title,
          title,
          description,
          location,
          duration_hours,
          estimated_cost,
          rating,
          created_at,
          scheduled_date,
          steps,
          filters_used,
          adventure_photos (
            photo_url,
            is_cover_photo
          ),
          adventure_steps (
            id,
            step_number,
            title,
            description,
            location,
            estimated_duration_minutes,
            estimated_cost,
            business_info
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (userError) {
        console.error('Error fetching user adventures:', userError);
      }

      // Get saved community adventures
      const { data: savedAdventures, error: savedError } = await this.supabase
        .from('adventure_interactions')
        .select(`
          id,
          created_at,
          community_adventures (
            id,
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
          )
        `)
        .eq('user_id', userId)
        .eq('interaction_type', 'save')
        .order('created_at', { ascending: false });

      if (savedError) {
        console.error('Error fetching saved adventures:', savedError);
      }

      console.log('User adventures data:', userAdventures?.length || 0);
      console.log('Saved adventures data:', savedAdventures?.length || 0);

      // Transform and combine both types of adventures
      const allAdventures: SavedAdventure[] = [];

      // Add user's own adventures
      if (userAdventures) {
        for (const adventure of userAdventures as any[]) {
          let adventurePhotos = adventure.adventure_photos || [];
          
          // Get Google Photos for adventure steps if available
          const normalizedSteps: AdventureStep[] = (() => {
            // If relational steps available, use them
            if (Array.isArray(adventure.adventure_steps) && adventure.adventure_steps.length) {
              return adventure.adventure_steps;
            }
            // Else, if JSON steps column exists (as in your provided SQL), map it
            if (Array.isArray(adventure.steps) && adventure.steps.length) {
              return adventure.steps.map((s: any, idx: number) => ({
                id: `${adventure.id}-step-${idx + 1}`,
                step_number: idx + 1,
                title: s.title,
                description: s.notes,
                location: s.location,
                estimated_duration_minutes: undefined,
                estimated_cost: undefined,
                business_info: s.booking ? { name: s.booking.method, photos: [], description: '', hours: '', avg_price: '', ai_description: '' } : undefined,
              }));
            }
            return [];
          })();

          if (ENABLE_STEP_PHOTOS && normalizedSteps.length > 0) {
            try {
              const stepPhotos = await businessPhotosService.getAdventurePhotos(
                normalizedSteps.map((step: AdventureStep) => ({
                  name: step.title,
                  location: step.location || adventure.location
                }))
              );

              // Use Google Photos as primary, fallback to stored photos
              if (stepPhotos.length > 0) {
                adventurePhotos = stepPhotos.map((photo: BusinessPhoto) => ({
                  photo_url: photo.url,
                  is_cover_photo: false
                }));
                adventurePhotos[0].is_cover_photo = true;
              }
            } catch (error) {
              console.error('Error loading business photos:', error);
            }
          }

          allAdventures.push({
            id: adventure.id,
            custom_title: adventure.custom_title || adventure.title || 'Your Adventure',
            custom_description: adventure.description,
            location: adventure.location || (adventure.filters_used?.location ?? ''),
            duration_hours: Number(adventure.duration_hours) || 4,
            estimated_cost: adventure.estimated_cost || '$$',
            rating: adventure.rating || 0,
            adventure_photos: adventurePhotos,
            user_saved: false, // It's their own adventure
            saved_at: adventure.created_at,
            scheduled_for: adventure.scheduled_date,
            adventure_steps: normalizedSteps,
            profiles: null // User's own adventure
          });
        }
      }

      // Add saved community adventures
      if (savedAdventures) {
        for (const interaction of savedAdventures) {
          const adventure = interaction.community_adventures;
          if (!adventure) continue;

          let adventurePhotos = (adventure as any).adventure_photos || [];
          
          // Get Google Photos if available
          if (ENABLE_STEP_PHOTOS && (adventure as any).steps && (adventure as any).steps.length > 0) {
            try {
              const stepPhotos = await businessPhotosService.getAdventurePhotos(
                (adventure as any).steps.map((step: any) => ({
                  name: step.title || step.business_name,
                  location: step.location || (adventure as any).location
                }))
              );

              if (stepPhotos.length > 0) {
                adventurePhotos = stepPhotos.map((photo: BusinessPhoto) => ({
                  photo_url: photo.url,
                  is_cover_photo: false
                }));
                adventurePhotos[0].is_cover_photo = true;
              }
            } catch (error) {
              console.error('Error loading business photos:', error);
            }
          }

          allAdventures.push({
            id: (adventure as any).id,
            custom_title: (adventure as any).custom_title,
            custom_description: (adventure as any).custom_description,
            location: (adventure as any).location,
            duration_hours: (adventure as any).duration_hours,
            estimated_cost: (adventure as any).estimated_cost,
            rating: (adventure as any).rating,
            adventure_photos: adventurePhotos,
            user_saved: true,
            saved_at: interaction.created_at,
            adventure_steps: (adventure as any).steps || [],
            profiles: null
          });
        }
      }

      console.log('Total adventures found:', allAdventures.length);
      return allAdventures;

    } catch (error) {
      console.error('Error in getUserSavedAdventures:', error);
      return [];
    }
  }

  /**
   * Save an adventure for the current user
   */
  async saveAdventure(userId: string, adventureId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_saved_adventures')
        .insert({
          user_id: userId,
          adventure_id: adventureId,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving adventure:', error);
        return false;
      }

      // Update saves count
      await this.supabase.rpc('increment_saves_count', { adventure_id: adventureId });

      return true;
    } catch (error) {
      console.error('Error in saveAdventure:', error);
      return false;
    }
  }

  /**
   * Remove a saved adventure for the current user
   */
  async unsaveAdventure(userId: string, adventureId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_saved_adventures')
        .delete()
        .eq('user_id', userId)
        .eq('adventure_id', adventureId);

      if (error) {
        console.error('Error unsaving adventure:', error);
        return false;
      }

      // Update saves count
      await this.supabase.rpc('decrement_saves_count', { adventure_id: adventureId });

      return true;
    } catch (error) {
      console.error('Error in unsaveAdventure:', error);
      return false;
    }
  }

  /**
   * Get user's usage statistics
   */
  async getUserUsageStats(userId: string): Promise<{
    generationsUsed: number;
    generationsLimit: number;
    editsUsed: number;
    editsLimit: number;
    resetDate: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('user_usage_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Return default stats for new users
        return {
          generationsUsed: 0,
          generationsLimit: 15,
          editsUsed: 0,
          editsLimit: 10,
          resetDate: this.getNextWeekDate()
        };
      }

      return {
        generationsUsed: data.generations_used,
        generationsLimit: data.generations_limit,
        editsUsed: data.edits_used,
        editsLimit: data.edits_limit,
        resetDate: data.reset_date
      };

    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        generationsUsed: 0,
        generationsLimit: 15,
        editsUsed: 0,
        editsLimit: 10,
        resetDate: this.getNextWeekDate()
      };
    }
  }

  /**
   * Update user's usage statistics
   */
  async updateUsageStats(userId: string, type: 'generation' | 'edit'): Promise<boolean> {
    try {
      const field = type === 'generation' ? 'generations_used' : 'edits_used';
      
      const { error } = await this.supabase.rpc('increment_usage_stat', {
        user_id: userId,
        stat_field: field
      });

      if (error) {
        console.error('Error updating usage stats:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUsageStats:', error);
      return false;
    }
  }

  private getNextWeekDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get mock data for development (fallback when Supabase isn't available)
   */
  getMockSavedAdventures(): SavedAdventure[] {
    return [
      {
        id: 'mock-1',
        custom_title: 'Sunset Photography Walk in Golden Gate Park',
        description: 'Capture the golden hour magic with a guided photography adventure through San Francisco\'s most beautiful park.',
        location: 'San Francisco, CA',
        duration_hours: 2,
        estimated_cost: '$$',
        rating: 4.8,
        adventure_photos: [
          { photo_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', is_cover_photo: true }
        ],
        saves_count: 234,
        likes_count: 456,
        user_saved: true,
        saved_at: '2025-01-15',
        profiles: {
          first_name: 'Emma',
          last_name: 'Thompson'
        },
        adventure_steps: [
          {
            id: 'step-1',
            step_number: 1,
            title: 'Meet at Japanese Tea Garden',
            description: 'Begin your photography journey at this serene location',
            location: 'Japanese Tea Garden, Golden Gate Park',
            estimated_duration_minutes: 30,
            estimated_cost: '$'
          }
        ]
      }
    ];
  }
}

export default new AdventureService();
