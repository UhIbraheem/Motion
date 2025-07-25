// Service for handling adventure interactions (likes, saves, views)
import { supabase } from './supabase';

export interface AdventureInteraction {
  id: string;
  user_id: string;
  community_adventure_id: string;
  interaction_type: 'save' | 'heart' | 'view';
  created_at: string;
}

export const adventureInteractionService = {
  // Add or remove a like/save interaction
  async toggleInteraction(
    communityAdventureId: string, 
    interactionType: 'save' | 'heart'
  ): Promise<{ success: boolean; isAdded: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, isAdded: false, error: 'User not authenticated' };
      }

      // Check if interaction already exists
      const { data: existingInteraction, error: checkError } = await supabase
        .from('adventure_interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('community_adventure_id', communityAdventureId)
        .eq('interaction_type', interactionType)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return { success: false, isAdded: false, error: checkError.message };
      }

      if (existingInteraction) {
        // Remove interaction
        const { error: deleteError } = await supabase
          .from('adventure_interactions')
          .delete()
          .eq('id', existingInteraction.id);

        if (deleteError) {
          return { success: false, isAdded: false, error: deleteError.message };
        }

        return { success: true, isAdded: false };
      } else {
        // Add interaction
        const { error: insertError } = await supabase
          .from('adventure_interactions')
          .insert({
            user_id: user.id,
            community_adventure_id: communityAdventureId,
            interaction_type: interactionType
          });

        if (insertError) {
          return { success: false, isAdded: true, error: insertError.message };
        }

        return { success: true, isAdded: true };
      }
    } catch (error) {
      return { success: false, isAdded: false, error: 'Unexpected error occurred' };
    }
  },

  // Get user's saved adventures
  async getUserSavedAdventures(): Promise<{
    data: any[] | null;
    error: string | null;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
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
        .eq('user_id', user.id)
        .eq('interaction_type', 'save')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      // Transform data to match adventure structure
      const savedAdventures = data?.map(interaction => ({
        ...interaction.community_adventures,
        saved_at: interaction.created_at,
        interaction_id: interaction.id
      })) || [];

      return { data: savedAdventures, error: null };
    } catch (error) {
      return { data: null, error: 'Unexpected error occurred' };
    }
  },

  // Check if user has liked/saved an adventure
  async getUserInteractions(communityAdventureId: string): Promise<{
    hasLiked: boolean;
    hasSaved: boolean;
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { hasLiked: false, hasSaved: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('adventure_interactions')
        .select('interaction_type')
        .eq('user_id', user.id)
        .eq('community_adventure_id', communityAdventureId)
        .in('interaction_type', ['heart', 'save']);

      if (error) {
        return { hasLiked: false, hasSaved: false, error: error.message };
      }

      const hasLiked = data?.some(interaction => interaction.interaction_type === 'heart') || false;
      const hasSaved = data?.some(interaction => interaction.interaction_type === 'save') || false;

      return { hasLiked, hasSaved };
    } catch (error) {
      return { hasLiked: false, hasSaved: false, error: 'Unexpected error occurred' };
    }
  },

  // Record a view interaction
  async recordView(communityAdventureId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if view already exists for today (to avoid spam)
      const today = new Date().toISOString().split('T')[0];
      const { data: existingView } = await supabase
        .from('adventure_interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('community_adventure_id', communityAdventureId)
        .eq('interaction_type', 'view')
        .gte('created_at', `${today}T00:00:00`)
        .single();

      if (existingView) {
        return { success: true }; // Already viewed today
      }

      const { error } = await supabase
        .from('adventure_interactions')
        .insert({
          user_id: user.id,
          community_adventure_id: communityAdventureId,
          interaction_type: 'view'
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
};
