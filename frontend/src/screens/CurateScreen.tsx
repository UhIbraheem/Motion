import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert } from 'react-native';
import AdventureFilters from '../components/AdventureFilters';
import GeneratedAdventureView from '../components/GeneratedAdventureView';
import { aiService, AdventureFilters as AdventureFiltersType, GeneratedAdventure } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { 
  Poppins_700Bold, 
  Poppins_600SemiBold,
  useFonts 
} from '@expo-google-fonts/poppins';
import { 
  Inter_600SemiBold,
  Inter_500Medium 
} from '@expo-google-fonts/inter';

const CurateScreen: React.FC = () => {
    const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
    Inter_600SemiBold,
    Inter_500Medium,
  });


  const { user } = useAuth(); // Get current user
const [filters, setFilters] = useState<AdventureFiltersType>({
  location: '',
  duration: 'half-day',
  budget: 'moderate',
  timeOfDay: 'flexible',
  groupSize: 1,
  radius: 5,
  transportMethod: 'flexible',
  // Phase 1 additions
  experienceTypes: [],
  dietaryRestrictions: [],
  foodPreferences: [],
  startTime: '10:00',
  endTime: '16:00',
  flexibleTiming: true,
  customEndTime: false,
  // Phase 2 additions
  otherRestriction: '',
});
  
  const [generatedAdventure, setGeneratedAdventure] = useState<GeneratedAdventure | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Step editing states
  const [isSaving, setIsSaving] = useState(false);

  // NEW: Random greeting rotation
  // At the top of your component (after other useState/useEffect imports):
  const greetings = [
    "What's the vibe?",
    "What are you looking for?", 
    "What's the plan?",
    "Ready to explore?",
    "Where to today?",
    "What's calling you?",
    "Adventure awaits...",
    "What sounds good?",
    "Let's get started",
    "Time to discover"
  ];

  const [greeting, setGreeting] = useState(greetings[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    setGreeting(greetings[randomIndex]);
  }, []);



  // Smart end time calculation based on duration
  const calculateEndTime = (startTime: string, duration: string): string => {
    const start = parseInt(startTime.split(':')[0]);
    let hours = 4; // default
    
    switch (duration) {
      case 'quick': hours = 2; break;
      case 'half-day': hours = 6; break;
      case 'full-day': hours = 9; break;
    }
    
    const endHour = start + hours;
    return `${endHour}:00`;
  };

  // Format time for display (24h to 12h)
  const formatTimeDisplay = (time: string): string => {
    const hour = parseInt(time.split(':')[0]);
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };



  // Update radius based on transport method
  const handleTransportChange = (transport: 'walking' | 'bike' | 'rideshare' | 'flexible') => {
    setFilters((prev: AdventureFiltersType) => {
      const transportRadiusMap: Record<'walking' | 'bike' | 'rideshare' | 'flexible', number> = {
        walking: 0.5,
        bike: 3,
        rideshare: 15,
        flexible: 10
      };
      
      return {
        ...prev,
        transportMethod: transport,
        radius: transportRadiusMap[transport]
      };
    });
  };

  // Handle start time change with auto end time calculation
  const handleStartTimeChange = (startTime: string) => {
    const newEndTime = filters.customEndTime ? filters.endTime : calculateEndTime(startTime, filters.duration ?? 'half-day');
    setFilters((prev: AdventureFiltersType) => ({
      ...prev,
      startTime,
      endTime: newEndTime
    }));
  };

  // Handle duration change with auto end time calculation  
  const handleDurationChange = (duration: string) => {
    const newEndTime = filters.customEndTime ? filters.endTime : calculateEndTime(filters.startTime ?? '', duration);
    setFilters((prev: AdventureFiltersType) => ({
      ...prev,
      duration: duration as any,
      endTime: newEndTime
    }));
  };

  const generateAdventure = async () => {
    if (!filters.location || filters.location.trim() === '') {
      Alert.alert('Location Required', 'Please enter your location to generate an adventure.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // DEBUG: Log the exact timing info being sent
      console.log('🎯 Timing info being sent to AI:');
      console.log('- Start time:', filters.startTime);
      console.log('- End time:', filters.endTime);
      console.log('- Duration:', filters.duration);
      console.log('- Flexible timing:', filters.flexibleTiming);
      console.log('- Custom end time:', filters.customEndTime);
      console.log('🎯 Starting adventure generation with filters:', filters);
      const { data, error } = await aiService.generateAdventure(filters);
      
      if (error) {
        console.error('❌ Generation failed:', error);
        Alert.alert('Generation Failed', error);
        return;
      }

      if (data) {
        console.log('✅ Adventure generated successfully:', data.title);
        setGeneratedAdventure(data);
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setGeneratedAdventure(null);
  };

  const saveAdventure = async () => {
    if (!generatedAdventure || !user) {
      Alert.alert('Error', 'Please generate an adventure and make sure you are logged in.');
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('💾 Saving adventure for user:', user.email);
      const { data, error } = await aiService.saveAdventure(generatedAdventure, user.id);
      
      if (error) {
        Alert.alert('Save Failed', error);
        return;
      }

      Alert.alert(
        'Adventure Saved!', 
        `"${generatedAdventure.title}" has been saved to your plans.`,
        [
          { 
            text: 'View My Plans', 
            onPress: () => {
              // This will navigate to Plans tab in the future
              console.log('Navigate to Plans tab');
            }
          },
          { text: 'Create Another', onPress: resetForm }
        ]
      );
    } catch (error) {
      console.error('❌ Save error:', error);
      Alert.alert('Error', 'Failed to save adventure. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Only show filters if no adventure is generated
  if (!generatedAdventure) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <AdventureFilters
          greeting={greeting}
          filters={filters}
          setFilters={setFilters}
          isGenerating={isGenerating}
          onGenerateAdventure={generateAdventure}
          onStartTimeChange={handleStartTimeChange}
          onDurationChange={handleDurationChange}
        />
      </SafeAreaView>
    );
  }

  // Show generated adventure
  if (generatedAdventure) {
    return (
      <GeneratedAdventureView
        adventure={generatedAdventure}
        onBack={resetForm}
        onSave={saveAdventure}
        isSaving={isSaving}
        filters={filters}
        onAdventureUpdate={setGeneratedAdventure}
      />
    );
  }

}

export default CurateScreen;