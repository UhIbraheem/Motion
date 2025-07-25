// Test component to verify formatting preferences work
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePreferences } from '../context/PreferencesContext';
import { formatBudget, formatDistance, formatDuration } from '../utils/formatters';

const PreferencesTest: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();

  const testCosts = [25, 40, 60]; // Should show different budget levels
  const testDistance = 5.5; // Miles
  const testDuration = 3.5; // Hours

  return (
    <View style={{ padding: 20, backgroundColor: 'white' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Preferences Test
      </Text>
      
      <Text>Current Settings:</Text>
      <Text>• Distance: {preferences.distance_unit}</Text>
      <Text>• Budget: {preferences.budget_display}</Text>
      <Text>• Currency: {preferences.currency}</Text>
      <Text>• Time: {preferences.time_format}</Text>
      
      <View style={{ marginTop: 15 }}>
        <Text style={{ fontWeight: 'bold' }}>Budget Examples:</Text>
        {testCosts.map(cost => (
          <Text key={cost}>
            ${cost} → {formatBudget(cost, preferences)}
          </Text>
        ))}
      </View>
      
      <View style={{ marginTop: 15 }}>
        <Text style={{ fontWeight: 'bold' }}>Distance Example:</Text>
        <Text>{testDistance} miles → {formatDistance(testDistance, preferences)}</Text>
      </View>
      
      <View style={{ marginTop: 15 }}>
        <Text style={{ fontWeight: 'bold' }}>Duration Example:</Text>
        <Text>{testDuration} hours → {formatDuration(testDuration, preferences)}</Text>
      </View>
      
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#10b981', padding: 10, borderRadius: 8, marginBottom: 10 }}
          onPress={() => updatePreferences({ 
            distance_unit: preferences.distance_unit === 'miles' ? 'kilometers' : 'miles' 
          })}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Toggle Distance Unit
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ backgroundColor: '#10b981', padding: 10, borderRadius: 8, marginBottom: 10 }}
          onPress={() => updatePreferences({ 
            budget_display: preferences.budget_display === 'symbols' ? 'numbers' : 'symbols' 
          })}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Toggle Budget Display
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ backgroundColor: '#10b981', padding: 10, borderRadius: 8 }}
          onPress={() => updatePreferences({ 
            currency: preferences.currency === 'USD' ? 'EUR' : 'USD' 
          })}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Toggle Currency (USD/EUR)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreferencesTest;
