import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const CurateScreen: React.FC = () => {
  const [location, setLocation] = useState('');
  
  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-brand-sage">Curate</Text>
          <Text className="text-text-secondary">Create your perfect adventure</Text>
        </View>

        <Card title="Adventure Preferences" elevated={true}>
          <Text className="text-text-secondary mb-4">
            Tell us what you're looking for and our AI will create a personalized adventure.
          </Text>
          
          <Input
            label="Location"
            placeholder="Current location"
            value={location}
            onChangeText={setLocation}
          />
          
          {/* Vibe selector */}
          <View className="mb-4">
            <Text className="text-text-primary text-sm font-medium mb-1.5">
              Vibe
            </Text>
            <View className="flex-row flex-wrap">
              {['Relaxed', 'Energetic', 'Cultural', 'Foodie', 'Budget'].map((vibe) => (
                <View 
                  key={vibe} 
                  className="bg-brand-cream rounded-full px-4 py-2 mr-2 mb-2"
                >
                  <Text className="text-brand-sage">{vibe}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Duration selector */}
          <View className="mb-4">
            <Text className="text-text-primary text-sm font-medium mb-1.5">
              Duration
            </Text>
            <View className="flex-row justify-between">
              {['2 hours', 'Half Day', 'Full Day'].map((duration) => (
                <View 
                  key={duration} 
                  className="bg-brand-light rounded-lg px-4 py-2 w-[32%] items-center"
                >
                  <Text className="text-brand-sage font-medium">{duration}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <Button 
            title="Generate Adventure" 
            onPress={() => alert('Generate pressed')} 
            variant="primary"
            size="lg"
          />
        </Card>
        
        <View className="mt-6 mb-4">
          <Text className="text-lg font-semibold text-text-primary mb-2">Recent Creations</Text>
          
          <Card 
            title="Weekend Nature Escape" 
            onPress={() => alert('Nature Escape pressed')}
            footer={
              <Text className="text-sm text-text-secondary">Created 2 days ago</Text>
            }
          >
            <Text className="text-text-primary mb-2">
              A refreshing outdoor adventure with hiking and picnic spots.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CurateScreen;