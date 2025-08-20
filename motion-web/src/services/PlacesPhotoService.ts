// Thin client that calls backend Google Places-powered endpoints and avoids any random fallback images
export interface StepDescriptor { name: string; location?: string }
export interface PhotoItem { url: string; width?: number; height?: number; source?: string; label?: string; step_index?: number; photo_order?: number }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.motionflow.app';

export async function fetchStepPhotos(steps: StepDescriptor[], photosPerStep = 1): Promise<PhotoItem[]> {
  const res = await fetch(`${API_BASE}/api/places/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ steps, photosPerStep })
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.photos || [];
}

export async function fetchBusinessInfo(name: string, location?: string): Promise<any | null> {
  const res = await fetch(`${API_BASE}/api/places/business-info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, location })
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.business || null;
}
