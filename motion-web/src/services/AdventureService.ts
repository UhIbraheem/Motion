import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import businessPhotosService from './BusinessPhotosService';
import { SavedAdventure, AdventureStep } from '@/types/adventureTypes';

class AdventureService {
  supabase = createClientComponentClient();

  async getUserSavedAdventures(userId: string): Promise<SavedAdventure[]> {
    try {
      const allAdventures: SavedAdventure[] = [];
      
      // Fetch user's own adventures
      const { data: userAdventures = [] } = await this.supabase
        .from('adventures')
        .select('*')
        .eq('user_id', userId);
      
      // Fetch community adventures
      const { data: communityAdventures = [] } = await this.supabase
        .from('community_adventures')
        .select('*');
      
      // Process user's own adventures
      if (userAdventures) {
        for (const adventure of userAdventures) {
        let adventurePhotos = adventure.adventure_photos || [];
        adventurePhotos = adventurePhotos.map((p: any) => ({ 
          photo_url: p.photo_url || p.url, 
          is_cover_photo: p.is_cover_photo || false 
        }));
        const normalizedSteps: AdventureStep[] = Array.isArray(adventure.adventure_steps) ? adventure.adventure_steps : [];
        
        allAdventures.push({
          id: adventure.id,
          custom_title: adventure.custom_title || adventure.title || 'Your Adventure',
          custom_description: adventure.description,
          location: adventure.location || (adventure.filters_used?.location ?? ''),
          duration_hours: Number(adventure.duration_hours) || 4,
          estimated_cost: adventure.estimated_cost || '$$',
          rating: adventure.rating || 0,
          adventure_photos: adventurePhotos,
          user_saved: false,
          saved_at: adventure.created_at,
          scheduled_for: adventure.scheduled_date,
          adventure_steps: normalizedSteps,
          profiles: null,
          is_completed: adventure.is_completed === true || adventure.status === 'completed',
        });
      }
      }
      
      // Process community adventures
      if (communityAdventures) {
        for (const adventure of communityAdventures) {
        let adventurePhotos = adventure.adventure_photos || [];
        adventurePhotos = adventurePhotos.map((p: any) => ({ 
          photo_url: p.photo_url || p.url, 
          is_cover_photo: p.is_cover_photo || false 
        }));
        const normalizedSteps: AdventureStep[] = Array.isArray(adventure.adventure_steps) ? adventure.adventure_steps : [];
        
        allAdventures.push({
          id: adventure.id,
          custom_title: adventure.custom_title || adventure.title || 'Community Adventure',
          custom_description: adventure.description,
          location: adventure.location || '',
          duration_hours: Number(adventure.duration_hours) || 4,
          estimated_cost: adventure.estimated_cost || '$$',
          rating: adventure.rating || 0,
          adventure_photos: adventurePhotos,
          user_saved: false,
          saved_at: adventure.created_at,
          scheduled_for: adventure.scheduled_date,
          adventure_steps: normalizedSteps,
          profiles: null,
          is_completed: (adventure as any).is_completed === true || (adventure as any).status === 'completed',
        });
      }
      }
      
      return allAdventures;
    } catch (error) {
      console.error('Error fetching user saved adventures:', error);
      throw error;
    }
  }

  async saveAdventure(userId: string, adventureId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('saved_adventures')
        .insert({ user_id: userId, adventure_id: adventureId });
      if (error) throw error;
      await this.supabase.rpc('increment_saves_count', { adventure_id: adventureId });
      return true;
    } catch (error) {
      console.error('Error saving adventure:', error);
      return false;
    }
  }

  async unsaveAdventure(userId: string, adventureId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('saved_adventures')
        .delete()
        .eq('user_id', userId)
        .eq('adventure_id', adventureId);
      if (error) throw error;
      await this.supabase.rpc('decrement_saves_count', { adventure_id: adventureId });
      return true;
    } catch (error) {
      console.error('Error unsaving adventure:', error);
      return false;
    }
  }

  async getAdventureById(adventureId: string): Promise<{ data: SavedAdventure | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
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
          adventure_steps,
          filters_used,
          adventure_photos
        `)
        .eq('id', adventureId)
        .single();

      if (error || !data) {
        return { data: null, error: error?.message || 'Adventure not found' };
      }

      let adventurePhotos = data.adventure_photos || [];
      adventurePhotos = adventurePhotos.map((p: any) => ({ 
        photo_url: p.photo_url || p.url, 
        is_cover_photo: p.is_cover_photo || false 
      }));
      
      const normalizedSteps: AdventureStep[] = Array.isArray(data.adventure_steps) ? data.adventure_steps : [];

      return {
        data: {
          ...data,
          adventure_photos: adventurePhotos,
          adventure_steps: normalizedSteps,
          user_saved: false,
          saved_at: data.created_at || '',
          profiles: null,
          is_completed: false,
        },
        error: null,
      };
    } catch (e: any) {
      return { data: null, error: e.message || 'Failed to fetch adventure' };
    }
  }
}

export default new AdventureService();
