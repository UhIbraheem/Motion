// Setup script for Supabase Storage bucket
import { supabase } from '../services/supabase';

export const setupSupabaseStorage = async () => {
  console.log('🚀 Setting up Supabase Storage...');
  
  try {
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'profile-pictures');
    
    if (!bucketExists) {
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('profile-pictures', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (error) {
        console.error('❌ Error creating bucket:', error);
        console.log('ℹ️ Note: If you see "Bucket already exists" error, this is normal');
        // Don't return false for this error - bucket might exist from Supabase dashboard
      } else {
        console.log('✅ Profile pictures bucket created successfully');
      }
    } else {
      console.log('✅ Profile pictures bucket already exists');
    }
    
    // Test bucket access
    const { data: testData, error: testError } = await supabase.storage
      .from('profile-pictures')
      .list('', {
        limit: 1,
      });
    
    if (testError) {
      console.error('❌ Error accessing bucket:', testError);
      console.log('ℹ️ Make sure the bucket is properly configured in Supabase dashboard');
      return false;
    }
    
    console.log('✅ Supabase Storage setup complete');
    return true;
    
  } catch (error) {
    console.error('❌ Setup error:', error);
    return false;
  }
};
