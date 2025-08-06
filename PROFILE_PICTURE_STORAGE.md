# Profile Picture Storage Setup

This document outlines the setup required for profile picture storage using Supabase Storage.

## Automatic Setup

The app will automatically attempt to create the storage bucket on startup. However, you may need to configure it manually in the Supabase dashboard.

## Manual Setup (if needed)

1. **Go to your Supabase Dashboard**

   - Navigate to Storage → Buckets

2. **Create the bucket** (if not automatically created):

   - Bucket name: `profile-pictures`
   - Make it public: `Yes`
   - File size limit: `5MB`
   - Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

3. **Set up RLS Policies** (if needed):

   ```sql
   -- Allow users to upload their own profile pictures
   CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow public access to view profile pictures
   CREATE POLICY "Public can view profile pictures" ON storage.objects
   FOR SELECT USING (bucket_id = 'profile-pictures');

   -- Allow users to update their own profile pictures
   CREATE POLICY "Users can update their own profile pictures" ON storage.objects
   FOR UPDATE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to delete their own profile pictures
   CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
   FOR DELETE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Features

- ✅ Automatic bucket creation
- ✅ File upload with proper MIME type detection
- ✅ Public URL generation for profile pictures
- ✅ Error handling and fallback to user initials
- ✅ Migration of existing local URIs
- ✅ Optimized image caching

## Technical Implementation

- Profile pictures are uploaded to `profile-pictures` bucket
- Files are named: `profile-{user_id}-{timestamp}.{extension}`
- Public URLs are stored in the `profiles.profile_picture_url` field
- Local file URIs are automatically migrated on app startup
- Images that fail to load fall back to user initials

## Troubleshooting

If profile pictures aren't working:

1. Check the console logs for storage setup messages
2. Verify the bucket exists in Supabase dashboard
3. Ensure the bucket is public
4. Check that RLS policies allow the operations
5. Verify your Supabase URL and anon key are correct
