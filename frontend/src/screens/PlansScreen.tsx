import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  RefreshControl, 
  Alert,
  StyleSheet 
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Button from '../components/Button';
import { GradientAdventureCard } from '../components/GradientAdventureCard';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

interface SavedAdventure {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  estimated_cost: number;
  steps: any[];
  is_completed: boolean;
  is_favorite: boolean;
  created_at: string;
  filters_used?: any;
}

const PlansScreen: React.FC = () => {
  const { user } = useAuth();
  const [adventures, setAdventures] = useState<SavedAdventure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAdventures = async (showRefreshSpinner = false) => {
    if (!user) return;

    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      console.log('📖 Loading adventures for user:', user.email);
      const { data, error } = await aiService.getUserAdventures(user.id);

      if (error) {
        console.error('❌ Error loading adventures:', error);
        Alert.alert('Error', 'Failed to load your adventures');
        return;
      }

      console.log('✅ Loaded adventures:', data?.length || 0);
      setAdventures(data || []);
    } catch (error) {
      console.error('❌ Unexpected error loading adventures:', error);
      Alert.alert('Error', 'Something went wrong loading your adventures');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load adventures when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAdventures();
    }, [user])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (hours: number) => {
    if (hours <= 2) return `${hours} hour${hours === 1 ? '' : 's'}`;
    if (hours <= 6) return `${hours} hours`;
    return 'Full day';
  };

  const formatCost = (cost: number) => {
    // Fixed cost formatting based on stored values
    if (cost <= 25) return '$';        // Budget: exactly $25 
    if (cost <= 75) return '$$';       // Moderate: exactly $75
    return '$$$';                      // Premium: $150+
  };

  const getUpcomingAdventures = () => {
    return adventures.filter(adventure => !adventure.is_completed);
  };

  const getCompletedAdventures = () => {
    return adventures.filter(adventure => adventure.is_completed);
  };

  const viewAdventureDetails = (adventure: SavedAdventure) => {
    // For now, just show an alert with details
    const stepsList = adventure.steps.map((step, index) => 
      `${index + 1}. ${step.title} at ${step.time}`
    ).join('\n');

    Alert.alert(
      adventure.title,
      `${adventure.description}\n\nSteps:\n${stepsList}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Mark Complete', onPress: () => markAsCompleted(adventure.id) }
      ]
    );
  };

  const handleDeleteAdventure = async (adventureId: string) => {
    Alert.alert(
      'Delete Adventure',
      'Are you sure you want to delete this adventure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement delete in aiService
              // await aiService.deleteAdventure(adventureId);
              
              // For now, remove from local state
              setAdventures(prev => prev.filter(a => a.id !== adventureId));
              Alert.alert('Success', 'Adventure deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete adventure');
            }
          }
        }
      ]
    );
  };

  const handleEditAdventure = (adventure: SavedAdventure) => {
    // TODO: Navigate to edit screen or show edit modal
    Alert.alert('Edit Feature', 'Edit functionality coming soon!');
  };

  const markAsCompleted = async (adventureId: string) => {
    // TODO: Implement marking as completed
    Alert.alert('Feature Coming Soon', 'Mark as completed feature will be added soon!');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingEmoji}>🌊</Text>
          <Text style={styles.loadingText}>Loading your adventures...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingEmoji}>🔐</Text>
          <Text style={styles.centerText}>
            Please sign in to view your saved adventures
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const upcomingAdventures = getUpcomingAdventures();
  const completedAdventures = getCompletedAdventures();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadAdventures(true)}
              tintColor="#3c7660"
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.title}>My Adventures</Text>
            <Text style={styles.subtitle}>
              {adventures.length === 0 
                ? "Start creating your first adventure!"
                : `${adventures.length} adventure${adventures.length === 1 ? '' : 's'} saved`
              }
            </Text>
          </View>

          {adventures.length === 0 ? (
            // Empty state
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🗺️</Text>
              <Text style={styles.emptyStateTitle}>
                No adventures yet!
              </Text>
              <Text style={styles.emptyStateText}>
                Create your first AI-powered adventure in the Curate tab to see it here.
              </Text>
              <Button
                title="Create Your First Adventure"
                onPress={() => {
                  Alert.alert('Tip', 'Go to the Curate tab to create your first adventure!');
                }}
                variant="primary"
              />
            </View>
          ) : (
            <>
              {/* Upcoming Adventures */}
              {upcomingAdventures.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    🎯 Upcoming Adventures ({upcomingAdventures.length})
                  </Text>
                  
                  {upcomingAdventures.map((adventure) => (
                    <GradientAdventureCard
                      key={adventure.id}
                      adventure={adventure}
                      onPress={(a) => viewAdventureDetails(a as SavedAdventure)}
                      onDelete={handleDeleteAdventure}
                      onEdit={(a) => handleEditAdventure(a as SavedAdventure)}
                      formatDuration={formatDuration}
                      formatCost={formatCost}
                      formatDate={formatDate}
                    />
                  ))}
                </View>
              )}

              {/* Completed Adventures */}
              {completedAdventures.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    ✅ Completed Adventures ({completedAdventures.length})
                  </Text>
                  
                  {completedAdventures.map((adventure) => (
                    <GradientAdventureCard
                      key={adventure.id}
                      adventure={adventure}
                      onPress={(a) => viewAdventureDetails(a as SavedAdventure)}
                      onDelete={handleDeleteAdventure}
                      onEdit={(a) => handleEditAdventure(a as SavedAdventure)}
                      formatDuration={formatDuration}
                      formatCost={formatCost}
                      formatDate={formatDate}
                    />
                  ))}
                </View>
              )}

              {/* Quick Stats */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Your Stats</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{adventures.length}</Text>
                    <Text style={styles.statLabel}>Total Adventures</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#4d987b' }]}>
                      {completedAdventures.length}
                    </Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#3c7660' }]}>
                      {upcomingAdventures.length}
                    </Text>
                    <Text style={styles.statLabel}>Planned</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3c7660',
  },
  subtitle: {
    color: '#666666',
    marginTop: 4,
  },
  loadingEmoji: {
    fontSize: 48,
  },
  loadingText: {
    fontSize: 18,
    color: '#3c7660',
    marginTop: 8,
  },
  centerText: {
    fontSize: 18,
    color: '#3c7660',
    textAlign: 'center',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3c7660',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
    width: '32%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f6dc9b',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f2cc6c',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default PlansScreen;