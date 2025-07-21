# Database Integration Summary for Preferences System

## Overview

This document outlines all the database schema requirements and integration points for the new preferences functionality implemented in the ProfileScreen enhancement. This will enable your database team to easily implement the required Supabase tables and relationships.

## Current Database Requirements

### 1. User Profiles Enhancement

The `profiles` table needs to be extended to support the new profile management features.

**Required Fields:**

```sql
-- Add these columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_city VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

**Context:**

- `bio`: User-editable biography text field (displays in EditProfileModal)
- `home_city`: User's home location for location-based recommendations
- `birthday`: Birth date for age-appropriate adventure recommendations
- `profile_picture_url`: Supabase storage URL for uploaded profile images
- Timestamps for tracking profile changes

### 2. User Preferences Table

Create a new `user_preferences` table to store all user preference settings.

**Table Schema:**

```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Adventure Type Preferences
    outdoor_adventures BOOLEAN DEFAULT true,
    cultural_experiences BOOLEAN DEFAULT true,
    food_drinks BOOLEAN DEFAULT true,
    nightlife BOOLEAN DEFAULT true,
    wellness_fitness BOOLEAN DEFAULT true,
    arts_creativity BOOLEAN DEFAULT true,

    -- Notification Preferences
    push_notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    adventure_reminders BOOLEAN DEFAULT true,
    new_recommendations BOOLEAN DEFAULT true,
    social_updates BOOLEAN DEFAULT true,

    -- Privacy & Data Preferences
    location_sharing BOOLEAN DEFAULT true,
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    data_collection BOOLEAN DEFAULT true,
    analytics_tracking BOOLEAN DEFAULT true,
    personalized_ads BOOLEAN DEFAULT true,

    -- System Preferences
    dark_mode BOOLEAN DEFAULT false,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(5) DEFAULT 'USD',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);
```

**Context:**

- Adventure type toggles control which types of experiences appear in recommendations
- Notification settings control all app communication preferences
- Privacy settings manage data sharing and profile visibility
- System preferences for app behavior customization

### 3. Row Level Security (RLS) Policies

Set up proper security policies for the new tables.

**Profiles RLS Updates:**

```sql
-- Allow users to read and update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

**User Preferences RLS:**

```sql
-- Enable RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);
```

### 4. Database Functions & Triggers

Create helper functions for preference management.

**Auto-create preferences function:**

```sql
-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create preferences when profile is created
CREATE TRIGGER create_preferences_trigger
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_user_preferences();
```

**Update timestamp function:**

```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to both tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Frontend Integration Points

### 1. ProfileScreen Component Usage

The ProfileScreen now includes:

- **Profile Picture Upload**: Uses Expo ImagePicker to upload images to Supabase Storage
- **Bio Display**: Shows user bio from profiles.bio field
- **Stats Section**: Can be expanded to show adventure statistics
- **Modal Navigation**: Links to EditProfileModal and PreferencesModal

### 2. EditProfileModal Database Operations

This modal needs to perform:

```typescript
// Profile update operation
const updateProfile = async (profileData: {
  bio?: string;
  home_city?: string;
  birthday?: string;
  profile_picture_url?: string;
}) => {
  const { error } = await supabase.from('profiles').update(profileData).eq('id', user.id);
};
```

### 3. PreferencesModal Database Operations

This modal needs to perform:

```typescript
// Load user preferences
const loadPreferences = async () => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();
};

// Update preferences
const updatePreferences = async (preferences: Partial<UserPreferences>) => {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, ...preferences })
    .eq('user_id', user.id);
};
```

### 4. Image Upload to Supabase Storage

The profile picture upload requires:

```typescript
// Upload image to Supabase Storage
const uploadProfilePicture = async (imageUri: string) => {
  const fileExt = imageUri.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `profile-pictures/${fileName}`;

  const { data, error } = await supabase.storage.from('profiles').upload(filePath, imageUri);

  if (data) {
    const {
      data: { publicUrl },
    } = supabase.storage.from('profiles').getPublicUrl(filePath);
    return publicUrl;
  }
};
```

## Supabase Storage Bucket Setup

Create a storage bucket for profile pictures:

```sql
-- Create the profiles bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true);

-- Set up storage policies
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profiles' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view profile pictures" ON storage.objects
    FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profiles' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
```

## Implementation Checklist for Database Team

### ✅ Immediate Requirements (Core Functionality)

- [ ] Extend `profiles` table with new columns (bio, home_city, birthday, profile_picture_url)
- [ ] Create `user_preferences` table with all preference fields
- [ ] Set up RLS policies for both tables
- [ ] Create `profiles` storage bucket with proper policies
- [ ] Test profile picture upload/download functionality

### ✅ Enhanced Features (For Full Functionality)

- [ ] Create auto-preference creation trigger
- [ ] Set up timestamp update triggers
- [ ] Test all CRUD operations on preferences
- [ ] Validate all toggle switches save/load correctly
- [ ] Ensure adventure type preferences filter recommendations

### ✅ Data Migration (If Existing Users)

- [ ] Create default preferences for existing users
- [ ] Migrate any existing profile data to new schema
- [ ] Test backwards compatibility

## Frontend Code Dependencies

The following components depend on this database setup:

- `ProfileScreen.tsx` - Main profile display
- `EditProfileModal.tsx` - Profile editing form
- `PreferencesModal.tsx` - All preference toggles and settings
- `services/supabase.ts` - Database service layer

## Expected Behavior After Implementation

1. **Profile Management**: Users can upload profile pictures, edit bios, and set personal information
2. **Preferences Control**: All toggle switches in PreferencesModal save to database
3. **Adventure Filtering**: Adventure type preferences filter discovery results
4. **Notification Control**: Notification preferences control app communications
5. **Privacy Settings**: Privacy preferences control data sharing and profile visibility

This implementation will make all the preference toggles and profile management features fully functional with persistent storage.
