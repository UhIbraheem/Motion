export type MainTabParamList = {
  Discover: undefined;
  Curate: undefined;
  Plans: undefined;
  Profile: undefined;
};

// For future stack navigators within each tab
export type DiscoverStackParamList = {
  DiscoverHome: undefined;
  AdventureDetails: { id: string };
  Category: { name: string };
  FoodCategory: undefined;
  CultureCategory: undefined;
  OutdoorCategory: undefined;
  NightlifeCategory: undefined;
};

export type CurateStackParamList = {
  CurateHome: undefined;
  Preferences: undefined;
  Results: undefined;
};

export type PlansStackParamList = {
  PlansHome: undefined;
  PlanDetails: { id: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  EditProfile: undefined;
  Preferences: undefined;
};