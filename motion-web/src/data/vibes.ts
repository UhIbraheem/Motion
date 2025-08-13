// Centralized vibe / experience type definitions for AI prompting & UI cohesion.
// Source-controlled (no DB table) so both web & mobile can import the same canonical list.
// Each item includes a concise tooltip & a richer AI guidance string.

export interface VibeDefinition {
  key: string;
  label: string;
  shortDescription: string; // For hover tooltips / side panel explanations
  aiDefinition: string;     // Injected into AI prompt to steer semantic intent
  examples?: string[];
}

export const VIBES: VibeDefinition[] = [
  // High-level plan vibes (distinct from granular experience types). These are emotional / pacing archetypes.
  {
    key: 'romantic',
    label: 'Romantic',
    shortDescription: 'Intimate, warm, connection-focused rhythm',
    aiDefinition: 'Design a soft, unhurried arc with cozy, ambient settings (candle/soft light, scenic overlooks, tucked-away dessert or wine stop). Avoid loud overcrowded venues unless adding contrast. Include at least one micro-moment prompt for a photo or shared reflection.'
  },
  {
    key: 'chill',
    label: 'Chill',
    shortDescription: 'Low-pressure, easy-going flow',
    aiDefinition: 'Keep energy gentle; favor breathable spaces (parks, relaxed cafes, mellow galleries). No tightly timed transitions. Offer optional branches if user wants a slightly more active variation.'
  },
  {
    key: 'spontaneous',
    label: 'Spontaneous',
    shortDescription: 'Loose structure & playful discovery',
    aiDefinition: 'Provide a lightly scaffolded sequence with 1-2 “pick one” forks. Encourage serendipity (street market, pop-up, live busker). Keep fallback suggestions if first choice is closed or crowded.'
  },
  {
    key: 'energized',
    label: 'Energized',
    shortDescription: 'Active, upbeat momentum arc',
    aiDefinition: 'Progressively build stimulation (light movement → interactive/activity → social peak). Insert a hydration / reset midpoint. Avoid stacking high-intensity steps without a brief decompression.'
  },
  {
    key: 'mindful',
    label: 'Mindful',
    shortDescription: 'Grounded, reflective cadence',
    aiDefinition: 'Calming sensory profile (nature textures, tea / light nourishment, contemplative space). Integrate a brief guided reflection suggestion. Avoid chaotic or high-noise venues.'
  },
  // Legacy / detailed vibes (kept for backward compatibility with existing adventure records)
  {
    key: 'hidden-gem',
    label: 'Hidden Gem',
    shortDescription: 'Under‑the‑radar local finds and niche delights',
    aiDefinition: 'Surface lesser-known but quality local spots (indie cafes, micro galleries, specialty makers). Avoid generic tourist traps & large chains unless uniquely iconic.'
  },
  {
    key: 'explorer',
    label: 'Explorer',
    shortDescription: 'Movement, variety & discovery pacing',
    aiDefinition: 'Design a progressive route with contrasting environments (urban → green → cultural) and minimal backtracking.'
  },
  {
    key: 'nature',
    label: 'Nature',
    shortDescription: 'Parks, water, light hikes & open air',
    aiDefinition: 'Prioritize accessible green / waterfront / open-air segments with realistic daylight & seasonal viability.'
  },
  {
    key: 'partier',
    label: 'Partier',
    shortDescription: 'Social energy & nightlife arc',
    aiDefinition: 'Stage a social energy build (warm‑up lounge → peak venue → optional wind‑down). Ensure venues are open & age-appropriate.'
  },
  {
    key: 'solo-freestyle',
    label: 'Solo Freestyle',
    shortDescription: 'Flexible, low‑pressure solo flow',
    aiDefinition: 'Low friction, self‑paced stops with optional forks (“If you feel like more…”). Favor psychologically comfortable spaces.'
  },
  {
    key: 'academic-weapon',
    label: 'Academic Weapon',
    shortDescription: 'Intellectual depth & focus intervals',
    aiDefinition: 'Blend intellectually rich venues (museums, archives, design bookstores) with structured recharge (tea bar, minimalist cafe). Limit noisy overstimulation.'
  },
  {
    key: 'special-occasion',
    label: 'Special Occasion',
    shortDescription: 'Elevated, polished & memorable arc',
    aiDefinition: 'Slightly premium, photogenic sequencing with a climax moment (tasting, skyline, immersive exhibit) + fallback if booking fails.'
  },
  {
    key: 'artsy',
    label: 'Artsy',
    shortDescription: 'Creation & visual culture blend',
    aiDefinition: 'Mix create + appreciate (gallery → studio / workshop → design cafe). Encourage multi‑sensory variety.'
  },
  {
    key: 'foodie-adventure',
    label: 'Foodie Adventure',
    shortDescription: 'Curated culinary progression',
    aiDefinition: 'Balanced taste journey; avoid stacking heavy meals. Interleave tasting flight, palate cleanser, artisan sweet. Respect dietary & budget signals.'
  },
  {
    key: 'culture-dive',
    label: 'Culture Dive',
    shortDescription: 'Local identity & heritage narrative',
    aiDefinition: 'Storytelling arc (historic walk → niche museum wing → regional specialty eatery) with contextual notes tying them together.'
  },
  {
    key: 'sweet-treat',
    label: 'Sweet Treat',
    shortDescription: 'Dessert-centric delight path',
    aiDefinition: 'Feature dessert craftsmanship (patisserie, gelato lab, bean‑to‑bar). Balance sugar with a neutral reset (scenic stroll / tea stop).'
  },
  {
    key: 'puzzle-solver',
    label: 'Puzzle Solver',
    shortDescription: 'Cognitive challenge & pattern joy',
    aiDefinition: 'Sequence mental intensity (escape/puzzle) → lighter decompression (board game lounge / logic cafe). Avoid repetitive mechanics.'
  },
  {
    key: 'wellness',
    label: 'Wellness',
    shortDescription: 'Restorative & mindful balance',
    aiDefinition: 'Calming arc (gentle movement → nourishment → reflective / breath oriented space). Avoid high sensory overload.'
  },
];

export const VIBES_BY_KEY: Record<string, VibeDefinition> = Object.fromEntries(
  VIBES.map(v => [v.key, v])
);

export function buildAIPromptForVibes(selected: string[] = []): string {
  if (!selected.length) return '';
  return selected
    .map(s => VIBES_BY_KEY[s])
    .filter(Boolean)
    .map(v => `${v.label}: ${v.aiDefinition}`)
    .join(' | ');
}
