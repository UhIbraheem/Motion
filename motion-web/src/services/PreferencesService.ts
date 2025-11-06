import { supabase } from '@/lib/supabaseClient';

export interface UserPreferences {
  // Adventure Creation Defaults
  defaultBudget?: 'budget' | 'moderate' | 'premium';
  defaultRadius?: number; // in miles
  defaultDuration?: 'short' | 'half-day' | 'full-day';
  defaultGroupSize?: number;

  // Dietary Preferences (persistent)
  savedDietaryRestrictions?: string[];
  savedDietaryPreferences?: string[];

  // UI Preferences
  emailOptIn?: boolean;
  darkMode?: boolean;

  // Notification Preferences
  scheduledReminders?: boolean;
  reminderHoursBefore?: number;
}

class PreferencesService {
  /**
   * Get user preferences from their profile
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      console.log('📋 [Preferences] Fetching preferences for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist or preferences not set, use defaults (not an error)
        if (error.code === 'PGRST116' || !data) {
          console.log('ℹ️ [Preferences] No saved preferences found, using defaults');
        } else {
          console.warn('⚠️ [Preferences] Error fetching preferences, using defaults:', error.message || 'Unknown error');
        }
        return this.getDefaultPreferences();
      }

      const prefs = data?.preferences || {};
      console.log('✅ [Preferences] Fetched:', prefs);

      return {
        ...this.getDefaultPreferences(),
        ...prefs
      };
    } catch (error) {
      console.error('❌ [Preferences] Exception:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      console.log('💾 [Preferences] Updating preferences for user:', userId, preferences);

      // Get existing preferences first
      const existing = await this.getUserPreferences(userId);

      // Merge with new preferences
      const updated = {
        ...existing,
        ...preferences
      };

      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updated })
        .eq('id', userId);

      if (error) {
        console.error('❌ [Preferences] Update error:', error);
        return false;
      }

      console.log('✅ [Preferences] Updated successfully');
      return true;
    } catch (error) {
      console.error('❌ [Preferences] Update exception:', error);
      return false;
    }
  }

  /**
   * Get default preferences
   */
  getDefaultPreferences(): UserPreferences {
    return {
      defaultBudget: 'moderate',
      defaultRadius: 10,
      defaultDuration: 'half-day',
      defaultGroupSize: 2,
      savedDietaryRestrictions: [],
      savedDietaryPreferences: [],
      emailOptIn: true,
      darkMode: false,
      scheduledReminders: true,
      reminderHoursBefore: 24
    };
  }

  /**
   * Reset preferences to defaults
   */
  async resetPreferences(userId: string): Promise<boolean> {
    return this.updateUserPreferences(userId, this.getDefaultPreferences());
  }
}

export default new PreferencesService();
