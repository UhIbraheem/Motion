# Database Migration: User Preferences

## Overview
This migration adds support for storing user preferences in the `profiles` table.

## Migration SQL

Run this in your Supabase SQL Editor:

```sql
-- Add preferences column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_preferences
ON profiles USING GIN (preferences);

-- Add comment for documentation
COMMENT ON COLUMN profiles.preferences IS 'User preferences for adventure creation defaults, notifications, and UI settings';
```

## Preferences Schema

The `preferences` JSONB column stores the following structure:

```typescript
{
  // Adventure Creation Defaults
  defaultBudget?: 'budget' | 'moderate' | 'premium',
  defaultRadius?: number, // miles
  defaultDuration?: 'short' | 'half-day' | 'full-day',
  defaultGroupSize?: number,

  // Dietary Preferences (persistent)
  savedDietaryRestrictions?: string[],
  savedDietaryPreferences?: string[],

  // UI Preferences
  emailOptIn?: boolean,
  darkMode?: boolean,

  // Notification Preferences
  scheduledReminders?: boolean,
  reminderHoursBefore?: number // 1, 3, 24, 48, or 168
}
```

## Default Values

When preferences are not set, the system uses these defaults:

- `defaultBudget`: 'moderate'
- `defaultRadius`: 10
- `defaultDuration`: 'half-day'
- `defaultGroupSize`: 2
- `emailOptIn`: true
- `darkMode`: false
- `scheduledReminders`: true
- `reminderHoursBefore`: 24

## Usage

Preferences are managed by `PreferencesService`:

```typescript
import PreferencesService from '@/services/PreferencesService';

// Get user preferences
const prefs = await PreferencesService.getUserPreferences(userId);

// Update preferences
await PreferencesService.updateUserPreferences(userId, {
  defaultBudget: 'premium',
  defaultRadius: 15
});

// Reset to defaults
await PreferencesService.resetPreferences(userId);
```

## Integration Points

1. **Settings Page** (`/settings/preferences`)
   - Full UI for managing all preferences
   - Save and reset functionality

2. **Create Page** (`/create`)
   - Auto-loads user preferences on mount
   - Pre-fills form fields if empty
   - Respects localStorage overrides

## Testing

After running the migration:

1. Navigate to `/settings/preferences`
2. Update any preference (e.g., default budget)
3. Save preferences
4. Navigate to `/create`
5. Verify the form pre-fills with your saved preferences
6. Create an adventure using the defaults
7. Return to `/create` - form should remember your last values (localStorage)
8. Clear localStorage and refresh - should revert to saved preferences

## Rollback

To remove the preferences column:

```sql
DROP INDEX IF EXISTS idx_profiles_preferences;
ALTER TABLE profiles DROP COLUMN IF EXISTS preferences;
```

⚠️ **Warning**: This will delete all user preferences permanently.
