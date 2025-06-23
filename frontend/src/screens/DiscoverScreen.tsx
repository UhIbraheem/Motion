import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import Card from '../components/Card';

const DiscoverScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-brand-sage">Discover</Text>
          <Text className="text-text-secondary">Find adventures curated by the community</Text>
        </View>

        {/* Featured adventures */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-2">Featured Adventures</Text>
          
          <Card 
            title="Cozy Coffee Crawl" 
            elevated={true}
            onPress={() => alert('Coffee Crawl pressed')}
            footer={
              <Text className="text-sm text-text-secondary">2 hours • $$</Text>
            }
          >
            <Text className="text-text-primary mb-2">
              Explore 3 artisanal coffee shops with unique atmospheres, perfect for a relaxed morning.
            </Text>
          </Card>
          
          <Card 
            title="Local Art Tour" 
            elevated={true}
            onPress={() => alert('Art Tour pressed')}
            footer={
              <Text className="text-sm text-text-secondary">3 hours • $</Text>
            }
          >
            <Text className="text-text-primary mb-2">
              Discover hidden street art and galleries in the downtown area.
            </Text>
          </Card>
        </View>

        {/* Popular categories */}
        <View>
          <Text className="text-lg font-semibold text-text-primary mb-2">Popular Categories</Text>
          {/* Here we would add category items */}
          <View className="flex-row flex-wrap justify-between">
            {['Food & Drink', 'Outdoors', 'Cultural', 'Nightlife'].map((category) => (
              <View 
                key={category} 
                className="bg-brand-cream rounded-lg w-[48%] h-24 mb-4 items-center justify-center"
              >
                <Text className="text-brand-sage font-semibold">{category}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscoverScreen;