import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';

const PlansScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-brand-sage">My Plans</Text>
          <Text className="text-text-secondary">Your saved adventures</Text>
        </View>

        {/* Upcoming plans */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-2">Upcoming</Text>
          
          <Card 
            title="Downtown Food Tour" 
            elevated={true}
            onPress={() => alert('Food Tour pressed')}
            footer={
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-text-secondary">Tomorrow • 4 hours</Text>
                <Button 
                  title="View" 
                  onPress={() => alert('View pressed')} 
                  variant="outline"
                  size="sm"
                />
              </View>
            }
          >
            <Text className="text-text-primary mb-2">
              A culinary adventure through the best downtown eateries.
            </Text>
          </Card>
        </View>

        {/* Past plans */}
        <View>
          <Text className="text-lg font-semibold text-text-primary mb-2">Past Adventures</Text>
          
          <Card 
            title="Coffee & Bookstore Hop" 
            onPress={() => alert('Coffee Hop pressed')}
            footer={
              <Text className="text-sm text-text-secondary">April 15, 2025</Text>
            }
          >
            <Text className="text-text-primary mb-2">
              A cozy day exploring coffee shops and independent bookstores.
            </Text>
          </Card>
          
          <Card 
            title="Museum & Lunch Date" 
            onPress={() => alert('Museum Date pressed')}
            footer={
              <Text className="text-sm text-text-secondary">March 28, 2025</Text>
            }
          >
            <Text className="text-text-primary mb-2">
              Art gallery visit followed by lunch at a trendy bistro.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlansScreen;