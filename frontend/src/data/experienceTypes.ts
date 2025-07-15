export interface ExperienceType {
  id: string;
  name: string;
  aiDefinition: string;
  icon: string;
  description: string;
}

export const experienceTypes: ExperienceType[] = [
  {
    id: 'hidden-gem',
    name: 'Hidden Gem',
    icon: '💎',
    description: 'Off-the-beaten-path discoveries',
    aiDefinition: 'Hidden Gem: Focus on lesser-known, authentic local spots that aren\'t tourist traps. Prioritize neighborhood favorites, hole-in-the-wall restaurants, secret viewpoints, small local businesses, and places locals actually go. Avoid chain restaurants and major tourist attractions. Something you\'d only find if you really knew the area well.'
  },
  {
    id: 'explorer',
    name: 'Explorer',
    icon: '🗺️',
    description: 'Adventure and discovery focused',
    aiDefinition: 'Explorer: Emphasize adventure, discovery, and exploration. Include museums, historical sites, walking tours, hikes, scenic viewpoints, parks, unique neighborhoods to wander, markets to explore, and activities that involve learning about the local area and culture.'
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌿',
    description: 'Outdoor activities and green spaces',
    aiDefinition: 'Nature: Prioritize outdoor activities, parks, gardens, hiking trails, beaches, waterfront areas, botanical gardens, outdoor markets, hiking, camping, rooftop venues, and any activities that involve being outside in natural settings. Minimize indoor time.'
  },
  {
    id: 'partier',
    name: 'Partier',
    icon: '🎉',
    description: 'Nightlife and social experiences',
    aiDefinition: 'Partier: Focus on vibrant social experiences, bars, breweries, live music venues, nightlife districts, happy hour spots, rooftop bars, dance venues, and energetic social environments. Consider the time of day and include pre-gaming or late-night options.'
  },
  {
    id: 'solo-freestyle',
    name: 'Solo Freestyle',
    icon: '🎭',
    description: 'Flexible solo-friendly activities',
    aiDefinition: 'Solo Freestyle: Design for independent exploration with flexible timing. Include solo-friendly activities like coffee shops with good vibes, bookstores, art galleries, walking routes, markets, museums, and places where being alone feels natural and comfortable.'
  },
  {
    id: 'academic-weapon',
    name: 'Academic Weapon',
    icon: '📚',
    description: 'Educational and intellectual pursuits',
    aiDefinition: 'Academic Weapon: Focus on intellectually stimulating activities like museums, libraries, lectures, bookstores, educational tours, historical sites, science centers, study cafes, cultural institutions, and thought-provoking experiences that involve learning and intellectual engagement. Include study sessions and recommendations for them (places).'
  },
  {
    id: 'special-occasion',
    name: 'Special Occasion',
    icon: '🎊',
    description: 'Celebrating memorable moments',
    aiDefinition: 'Special Occasion: Design for celebration and memorable moments. Include upscale restaurants, special experiences, photo-worthy locations, unique activities, wine tastings, special venues, and activities that feel elevated and worthy of celebrating an important event. Something you do not do often and so memorable'
  },
  {
    id: 'artsy',
    name: 'Artsy',
    icon: '🎨',
    description: 'Creative and artistic experiences',
    aiDefinition: 'Artsy: Emphasize creative and artistic experiences including art galleries, street art tours, creative workshops, artist studios, design shops, creative districts, craft markets, performance venues, and spaces that showcase local creativity and artistic expression.'
  },
  {
    id: 'foodie-adventure',
    name: 'Foodie Adventure',
    icon: '🍜',
    description: 'Culinary exploration and food experiences',
    aiDefinition: 'Foodie Adventure: Center the experience around exceptional food and culinary exploration. Include diverse restaurants, food markets, specialty food shops, cooking classes, wine/beer tastings, food tours, ice cream, sweets, and unique dining experiences that showcase local flavors and culinary culture.'
  },
  {
    id: 'culture-dive',
    name: 'Culture Dive',
    icon: '🏛️',
    description: 'Deep cultural immersion',
    aiDefinition: 'Culture Dive: Focus on deep cultural immersion and authentic local experiences. Include cultural centers, traditional markets, local festivals, community events, ethnic neighborhoods, cultural performances, historical sites, and activities that provide genuine insight into local culture and traditions.'
  },
    {
    id: 'sweet-treat',
    name: 'Sweet Treat',
    icon: '🍰',
    description: 'Indulging in desserts and sweet experiences',
    aiDefinition: 'Sweet Treat: Focus on delightful desserts and sweet experiences. Include bakeries, dessert shops, ice cream parlors, candy stores, and unique sweet treats that showcase local flavors and creativity. If paired with other things this would be included around the end.'
  },
    {
    id: 'puzzle-solver',
    name: 'Puzzle Solver',
    icon: '🧩',
    description: 'Engaging in problem-solving and challenges',
    aiDefinition: 'Puzzle Solver: Focus on engaging problem-solving activities and challenges. Include escape rooms, puzzle cafes, trivia nights, board game cafes, interactive experiences, and activities that involve critical thinking, teamwork, and mental challenges. Ideal for those who enjoy intellectual stimulation and hands-on problem-solving.'
  },
  {
    id: 'wellness',
    name: 'Wellness',
    icon: '🧘‍♀️',
    description: 'Relaxation and self-care experiences',
    aiDefinition: 'Wellness: Focus on relaxation, self-care, and rejuvenation. Include spas, wellness centers, yoga studios, meditation spaces, nature retreats, and activities that promote mental and physical well-being. Ideal for those looking to unwind and recharge.'
  },
  
];

export const getExperienceTypeById = (id: string): ExperienceType | undefined => {
  return experienceTypes.find(type => type.id === id);
};

export const getExperienceTypeByName = (name: string): ExperienceType | undefined => {
  return experienceTypes.find(type => type.name === name);
};

export const getAIDefinitionsForSelectedTypes = (selectedTypes: string[]): string[] => {
  return selectedTypes
    .map(typeName => getExperienceTypeByName(typeName))
    .filter((type): type is ExperienceType => type !== undefined)
    .map(type => type.aiDefinition);
};

export const getExperienceTypeNames = (): string[] => {
  return experienceTypes.map(type => type.name);
};
