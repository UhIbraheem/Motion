// Migration utility to clean up local profile picture URIs
import { supabase } from '../services/supabase';

export const migrateLocalProfilePictures = async () => {
  console.log('🔄 Starting profile picture migration...');
  
  try {
    // Find all profiles with local file URIs (file://)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, profile_picture_url')
      .not('profile_picture_url', 'is', null)
      .ilike('profile_picture_url', 'file://%');
    
    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return false;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('✅ No local profile pictures found to migrate');
      return true;
    }
    
    console.log(`🔍 Found ${profiles.length} profiles with local URIs to clean up`);
    
    // Clear local URIs (they will fall back to initials)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_picture_url: null })
      .in('id', profiles.map(p => p.id));
    
    if (updateError) {
      console.error('❌ Error clearing local URIs:', updateError);
      return false;
    }
    
    console.log(`✅ Successfully cleared ${profiles.length} local profile picture URIs`);
    return true;
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
  }
};
