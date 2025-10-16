import { supabase } from '@/lib/supabaseClient';
import { SavedAdventure, AdventureStep } from '@/types/adventureTypes';

class AdventureService {
  supabase = supabase;
  private backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://motion-backend-production.up.railway.app';

  private mapBackendToSaved(adventure: any): SavedAdventure {
    const steps = Array.isArray(adventure.steps) ? adventure.steps : [];
    const scheduledFor = adventure.scheduledFor || adventure.scheduled_date;
    return {
      id: adventure.id || adventure.adventureId || crypto.randomUUID(),
      custom_title: adventure.title || adventure.plan_title || 'Your Adventure',
      custom_description: adventure.description || '',
      location: adventure.location || '',
      duration_hours: Number(adventure.estimatedDurationHours) || 4,
      estimated_cost: adventure.estimatedCost || '$$',
      rating: Number(adventure.rating) || 0,
      adventure_photos: Array.isArray(adventure.photos) && adventure.photos.length
        ? [{ photo_url: adventure.photos[0].url || adventure.photos[0], is_cover_photo: true }]
        : [],
      user_saved: false,
      saved_at: adventure.createdAt || new Date().toISOString(),
      scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      is_scheduled: adventure.is_scheduled === true || adventure.isScheduled === true,
      adventure_steps: steps.map((s: any, idx: number) => this.normalizeStep(s, idx)),
      profiles: null,
      is_completed: !!adventure.isCompleted || adventure.is_completed === true,
    };
  }

  private normalizeStep(step: any, idx: number): AdventureStep {
    if (!step) {
      return {
        id: `step-${idx}`,
        step_number: idx + 1,
        title: `Step ${idx + 1}`,
        description: '',
      };
    }

    const normalized: AdventureStep = {
      id: step.id || step.step_id || `step-${idx}`,
      step_number: step.step_number || step.stepNumber || idx + 1,
      title: step.title || step.name || step.step_title || `Step ${idx + 1}`,
      description: step.description ?? step.notes ?? step.details ?? '',
      location: step.location ?? step.address ?? step.formatted_address,
      estimated_duration_minutes: step.estimated_duration_minutes ?? step.duration_minutes ?? step.duration,
      estimated_cost: step.estimated_cost ?? step.cost,
      business_info: step.business_info,
      completed: step.completed ?? false,
      google_photo_url: step.google_photo_url || step.photo_url || step.primary_photo_url || step.image_url || step.google_places?.photo_url,
      google_places: step.google_places || step.place || step.business_details,
      photo_url: step.photo_url || step.google_photo_url || step.primary_photo_url || step.image_url || step.google_places?.photo_url,
      business_name: step.business_name || step.name || step.place_name,
      address: step.address || step.formatted_address || step.location,
      coordinates: step.coordinates || step.location_coordinates || step.geo,
      raw_data: step,
    };

    if (!normalized.photo_url && normalized.google_places?.photo_url) {
      normalized.photo_url = normalized.google_places.photo_url;
    }

    if (!normalized.google_photo_url && normalized.photo_url) {
      normalized.google_photo_url = normalized.photo_url;
    }

    return normalized;
  }

  async getUserSavedAdventures(userId: string): Promise<SavedAdventure[]> {
    try {
      console.log('🔍 AdventureService: Starting getUserSavedAdventures for:', userId);
      
      const allAdventures: SavedAdventure[] = [];
      
      // 1) Fetch user's own adventures with better error handling
      console.log('🔍 AdventureService: Querying user adventures...');
      const { data: userAdventures, error: userError } = await this.supabase
        .from('adventures')
        .select(`
          id,
          user_id,
          title,
          description,
          location,
          duration_hours,
          estimated_cost,
          created_at,
          scheduled_date,
          steps,
          is_completed,
          is_scheduled
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('🔍 AdventureService: User adventures query result:', {
        data: userAdventures?.length || 0,
        error: userError?.message || 'none'
      });

      if (userError) {
        console.error('❌ AdventureService: User adventures query error:', userError);
        throw new Error(`Failed to fetch adventures: ${userError.message}`);
      }

      if (userAdventures && userAdventures.length > 0) {
        console.log('🔍 RAW ADVENTURE DATA FROM DATABASE:', JSON.stringify(userAdventures[0], null, 2));
        
        for (const adventure of userAdventures) {
          const rawSteps: any[] = Array.isArray((adventure as any).steps) ? (adventure as any).steps : [];
          const normalizedSteps: AdventureStep[] = rawSteps.map((s: any, idx: number) => this.normalizeStep(s, idx));
        
          console.log('📸 Extracting photo for adventure:', adventure.title, {
            stepsCount: normalizedSteps.length,
            firstStep: normalizedSteps[0],
            allStepsData: normalizedSteps.map((s: any) => ({
              title: s.title,
              hasGooglePhotoUrl: !!s.google_photo_url,
              hasGooglePlaces: !!s.google_places,
              hasPhotoUrl: !!s.photo_url,
              googlePhotoUrl: s.google_photo_url,
              googlePlacesPhotoUrl: s.google_places?.photo_url
            }))
          });

          // Extract photo from first step with google_photo_url if available
          const photoFromSteps = normalizedSteps.find((s: any) => 
            s.google_photo_url || s.google_places?.photo_url || s.photo_url
          );
          const stepPhotoUrl = photoFromSteps 
            ? (photoFromSteps as any).google_photo_url || (photoFromSteps as any).google_places?.photo_url || (photoFromSteps as any).photo_url
            : null;

          console.log('📸 Extracted photo URL:', stepPhotoUrl);

          allAdventures.push({
            id: adventure.id,
            custom_title: adventure.title || 'Your Adventure',
            custom_description: adventure.description,
            location: adventure.location || '',
            duration_hours: Number(adventure.duration_hours) || 4,
            estimated_cost: adventure.estimated_cost || '$$',
            rating: 0, // Default rating for user adventures
            adventure_photos: stepPhotoUrl ? [{ photo_url: stepPhotoUrl, is_cover_photo: true }] : [],
            user_saved: false,
            saved_at: adventure.created_at,
            scheduled_for: adventure.scheduled_date ?? undefined,
            adventure_steps: normalizedSteps,
            profiles: null,
            is_completed: (adventure as any).is_completed === true,
            is_scheduled: (adventure as any).is_scheduled === true,
          });
        }
      }

      // 2) Fetch adventures the user saved (saved_adventures join)
      // First, get saved rows for user to be robust even without FK embedding
      const { data: savedRows } = await this.supabase
        .from('saved_adventures')
        .select('adventure_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const savedIds = Array.from(new Set((savedRows ?? []).map((r: any) => r.adventure_id).filter(Boolean)));
      if (savedIds.length) {
        const { data: savedAdventuresData } = await this.supabase
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
              steps,
              filters_used,
              is_scheduled
            `)
          .in('id', savedIds);

        for (const adventure of (savedAdventuresData ?? [])) {
          const rawSteps: any[] = Array.isArray((adventure as any).steps) ? (adventure as any).steps : [];
          const normalizedSteps: AdventureStep[] = rawSteps.map((s: any, idx: number) => this.normalizeStep(s, idx));

          // Skip duplicates already in own adventures (by id)
          if (allAdventures.some(a => a.id === adventure.id)) continue;

          console.log('📸 Extracting photo for saved adventure:', adventure.custom_title || adventure.title, {
            stepsCount: normalizedSteps.length,
            allStepsData: normalizedSteps.map((s: any) => ({
              title: s.title,
              hasGooglePhotoUrl: !!s.google_photo_url,
              hasGooglePlaces: !!s.google_places,
              hasPhotoUrl: !!s.photo_url
            }))
          });

          // Extract photo from first step with google_photo_url if available
          const photoFromSteps = normalizedSteps.find((s: any) => 
            s.google_photo_url || s.google_places?.photo_url || s.photo_url
          );
          const stepPhotoUrl = photoFromSteps 
            ? (photoFromSteps as any).google_photo_url || (photoFromSteps as any).google_places?.photo_url || (photoFromSteps as any).photo_url
            : null;

          console.log('📸 Extracted photo URL:', stepPhotoUrl);

          allAdventures.push({
            id: adventure.id,
            custom_title: adventure.custom_title || adventure.title || 'Saved Adventure',
            custom_description: adventure.description,
            location: adventure.location || (adventure.filters_used?.location ?? ''),
            duration_hours: Number(adventure.duration_hours) || 4,
            estimated_cost: adventure.estimated_cost || '$$',
            rating: adventure.rating || 0,
            adventure_photos: stepPhotoUrl ? [{ photo_url: stepPhotoUrl, is_cover_photo: true }] : [],
            user_saved: true,
            saved_at: adventure.created_at,
            scheduled_for: adventure.scheduled_date ?? undefined,
            adventure_steps: normalizedSteps,
            profiles: null,
            is_completed: (adventure as any).is_completed === true || (adventure as any).status === 'completed',
            is_scheduled: (adventure as any).is_scheduled === true,
          });
        }
      }

      // Fetch photos from adventure_photos table for all collected adventure IDs
      const allIds = allAdventures.map(a => a.id);
      if (allIds.length) {
        const { data: photoRows } = await this.supabase
          .from('adventure_photos')
          .select('adventure_id, url, photo_url, is_cover_photo, photo_order, step_index')
          .in('adventure_id', allIds)
          .order('photo_order', { ascending: true });
        if (photoRows && photoRows.length) {
          const byAdv: Record<string, any[]> = {};
          for (const p of photoRows) {
            const id = (p as any).adventure_id;
            if (!byAdv[id]) byAdv[id] = [];
            byAdv[id].push({
              photo_url: (p as any).photo_url || (p as any).url,
              is_cover_photo: !!(p as any).is_cover_photo,
            });
          }
          for (const adv of allAdventures) {
            // Only override if adventure_photos from table exist
            // Otherwise keep photos extracted from steps
            if (byAdv[adv.id] && byAdv[adv.id].length > 0) {
              adv.adventure_photos = byAdv[adv.id];
            }
          }
        }
      }

      // If nothing from Supabase, fallback to backend API
      if (allAdventures.length === 0) {
        try {
          const res = await fetch(`${this.backendBaseUrl}/api/adventures/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
          });
          if (res.ok) {
            const backendList = await res.json();
            for (const adv of (Array.isArray(backendList) ? backendList : [])) {
              allAdventures.push(this.mapBackendToSaved(adv));
            }
          }
        } catch (e) {
          console.warn('Backend fallback failed, returning Supabase results only');
        }
      }

      // Sort combined list by saved_at/created_at desc for consistent ordering
      allAdventures.sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());

      return allAdventures;
    } catch (error) {
      console.error('❌ AdventureService: Error in getUserSavedAdventures:', error);
      
      // Ensure we always throw a proper Error object
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to fetch adventures: ${JSON.stringify(error)}`);
      }
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
          steps,
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
      
      const normalizedSteps: AdventureStep[] = Array.isArray(data.steps)
        ? data.steps.map((step: any, idx: number) => this.normalizeStep(step, idx))
        : [];

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

  async scheduleAdventure(adventureId: string, date: Date): Promise<boolean> {
    try {
      console.log('📅 Scheduling adventure via backend:', adventureId, date.toISOString());

      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const response = await fetch(`${this.backendBaseUrl}/api/adventures/${adventureId}/schedule`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scheduledDate: date.toISOString(),
            userId: user.id,
          })
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          console.error('❌ Backend scheduling error:', errorBody);
          throw new Error(errorBody?.error || 'Failed to schedule adventure');
        }

        const payload = await response.json().catch(() => null);
        console.log('✅ Adventure scheduled successfully via backend:', payload);
        return true;
      } catch (backendError: any) {
        console.warn('⚠️ Backend scheduling failed, attempting Supabase fallback:', backendError?.message);
        await this.scheduleAdventureDirectly({
          adventureId,
          userId: user.id,
          scheduledDate: date.toISOString(),
        });

        return true;
      }
    } catch (e: any) {
      console.error('❌ Error scheduling adventure:', {
        message: e?.message,
        name: e?.name,
        stack: e?.stack
      });
      throw new Error(e?.message || 'Failed to schedule adventure');
    }
  }

  private async scheduleAdventureDirectly({
    adventureId,
    userId,
    scheduledDate,
  }: {
    adventureId: string;
    userId: string;
    scheduledDate: string;
  }): Promise<boolean> {
    console.log('📅 Scheduling adventure via Supabase fallback:', adventureId, scheduledDate);

    // Only update columns that actually exist in the database schema
    const { data, error } = await this.supabase
      .from('adventures')
      .update({
        scheduled_date: scheduledDate,
        is_scheduled: true,
      })
      .eq('id', adventureId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase fallback scheduling error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(error.message || 'Failed to schedule adventure via Supabase');
    }

    console.log('✅ Adventure scheduled via Supabase fallback:', data?.id);
    return true;
  }

  async markAdventureCompleted(adventureId: string): Promise<boolean> {
    try {
      console.log('✅ Marking adventure completed in DB:', adventureId);
      
      const { data, error } = await this.supabase
        .from('adventures')
        .update({ is_completed: true })
        .eq('id', adventureId)
        .select();
        
      if (error) {
        console.error('❌ Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message || error.details || 'Database error occurred');
      }

      if (!data || data.length === 0) {
        throw new Error('Adventure not found or update failed');
      }
      
      console.log('✅ Adventure marked complete:', data);
      return true;
    } catch (e: any) {
      console.error('❌ Error marking adventure completed:', {
        message: e?.message,
        name: e?.name,
        stack: e?.stack
      });
      throw new Error(e?.message || 'Failed to mark adventure as completed');
    }
  }

  async shareAdventureToDiscover(adventureId: string, rating: number, review: string): Promise<boolean> {
    try {
      // Get the completed adventure
      const { data: adventure, error: fetchError } = await this.supabase
        .from('adventures')
        .select('*')
        .eq('id', adventureId)
        .single();
      
      if (fetchError || !adventure) throw fetchError || new Error('Adventure not found');
      
      // Create a shared version in the discover/community table
      const { error: shareError } = await this.supabase
        .from('shared_adventures')
        .insert({
          original_adventure_id: adventureId,
          title: adventure.title || adventure.custom_title,
          description: adventure.description,
          location: adventure.location,
          duration_hours: adventure.duration_hours,
          estimated_cost: adventure.estimated_cost,
          steps: adventure.steps,
          user_rating: rating,
          user_review: review,
          shared_by: adventure.user_id,
          shared_at: new Date().toISOString(),
          tags: adventure.filters_used?.types || [],
          featured: false
        });
      
      if (shareError) throw shareError;
      
      return true;
    } catch (e) {
      console.error('Error sharing adventure to discover:', e);
      return false;
    }
  }

  async duplicateAdventure(adventureId: string, userId: string): Promise<string | null> {
    try {
      // Get the original adventure
      const { data: adventure, error: fetchError } = await this.supabase
        .from('adventures')
        .select('*')
        .eq('id', adventureId)
        .single();
      
      if (fetchError || !adventure) throw fetchError || new Error('Adventure not found');
      
      // Reset steps completion status
      const resetSteps = adventure.steps.map((step: any) => ({
        ...step,
        completed: false
      }));
      
      // Create a new adventure
      const { data: newAdventure, error: createError } = await this.supabase
        .from('adventures')
        .insert({
          user_id: userId,
          title: `${adventure.title || adventure.custom_title} (Copy)`,
          custom_title: `${adventure.title || adventure.custom_title} (Copy)`,
          description: adventure.description,
          location: adventure.location,
          duration_hours: adventure.duration_hours,
          estimated_cost: adventure.estimated_cost,
          steps: resetSteps,
          filters_used: adventure.filters_used,
          is_completed: false,
          scheduled_date: null
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      return newAdventure.id;
    } catch (e) {
      console.error('Error duplicating adventure:', e);
      return null;
    }
  }

  async updateStepCompletion(adventureId: string, stepId: string, completed: boolean): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.backendBaseUrl}/api/adventures/${adventureId}/steps/${encodeURIComponent(stepId)}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed, userId: user.id })
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error('❌ Backend step toggle error:', errorBody);
        throw new Error(errorBody?.error || 'Failed to update step');
      }

      const payload = await response.json();
      console.log('✅ Step completion updated via backend:', payload);
      return true;
    } catch (e: any) {
      console.error('❌ Error updating step completion:', {
        message: e?.message,
        name: e?.name,
        stepId,
        adventureId,
        completed
      });
      throw e; // Re-throw to let caller handle
    }
  }

  async deleteAdventure(adventureId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('adventures')
        .delete()
        .eq('id', adventureId);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error deleting adventure:', e);
      return false;
    }
  }
}

export default new AdventureService();
