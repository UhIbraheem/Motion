// Utility to sync auth state between web and mobile
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const authSync = {
  // Sync user profile data between platforms
  syncUserProfile: async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return profile;
    } catch (error) {
      console.error('Error syncing user profile:', error);
      return null;
    }
  },

  // Ensure user has a profile record (for Google auth users)
  ensureUserProfile: async (user: any) => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const profileData = {
          id: user.id,
          first_name: user.user_metadata?.first_name || 
                     user.user_metadata?.name?.split(' ')[0] || 
                     user.email?.split('@')[0] || '',
          last_name: user.user_metadata?.last_name || 
                    user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
          display_name: user.user_metadata?.name || 
                       user.user_metadata?.full_name || 
                       user.email?.split('@')[0] || '',
          email: user.email,
          membership_tier: 'free',
          monthly_generations: 0,
          monthly_edits: 0,
          generations_limit: 10,
          edits_limit: 3,
          subscription_status: 'active',
          last_reset_date: new Date().toISOString(),
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (createError) throw createError;

        return newProfile;
      }

      return existingProfile;
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      throw error;
    }
  },

  // Update user preferences across platforms
  updateUserPreferences: async (userId: string, preferences: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  },

  // Sync adventure data between platforms
  syncUserAdventures: async (userId: string) => {
    try {
      const { data: adventures, error } = await supabase
        .from('adventures')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return adventures || [];
    } catch (error) {
      console.error('Error syncing user adventures:', error);
      return [];
    }
  },
};

export default authSync;
