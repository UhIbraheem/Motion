import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FormatPreferences } from '../utils/formatters';

interface PreferencesContextType {
  preferences: FormatPreferences;
  updatePreferences: (newPreferences: Partial<FormatPreferences>) => void;
  isLoading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<FormatPreferences>({
    distance_unit: 'miles',
    budget_display: 'symbols',
    currency: 'USD',
    time_format: '12h'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from storage/backend on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // TODO: Load from AsyncStorage or user profile in backend
      // For now, using defaults
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<FormatPreferences>) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      setPreferences(updated);
      
      // TODO: Save to AsyncStorage and backend
      console.log('Preferences updated:', updated);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const value: PreferencesContextType = {
    preferences,
    updatePreferences,
    isLoading
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
