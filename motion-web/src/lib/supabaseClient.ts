import { createClient } from './supabase';

// Export singleton instance for backwards compatibility
export const supabase = createClient();
