// src/screens/PlansScreen.tsx - Netflix-style Horizontal Scrolling
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  RefreshControl, 
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import { GradientAdventureCard } from '../components/GradientAdventureCard';
import { AdventureDetailModal } from '../components/modals/AdventureDetailModal';
import { ShareAdventureModal } from '../components/modals/ShareAdventureModal';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


// Updated interface to match GradientAdventureCard
interface SavedAdventure {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  estimated_cost: number;
  steps: any[];
  is_completed: boolean;
  is_favorite: boolean; // Required, not optional
  created_at: string;
  filters_used?: any;
  step_completions?: { [stepIndex: number]: boolean }; // Add step completion tracking
}

const PlansScreen: React.FC = () => {
  const { user } = useAuth();
  const [adventures, setAdventures] = useState<SavedAdventure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [adventureToShare, setAdventureToShare] = useState<SavedAdventure | null>(null);
  
  // Modal state
  const [selectedAdventure, setSelectedAdventure] = useState<SavedAdventure | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
      
      // Ensure all adventures have required fields with defaults
      const processedAdventures = (data || []).map(adventure => ({
        ...adventure,
        is_favorite: adventure.is_favorite ?? false, // Default to false if undefined
        step_completions: adventure.step_completions ?? {} // Default to empty object
      }));
      
      setAdventures(processedAdventures);
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

  // Open adventure detail modal
  const viewAdventureDetails = (adventure: SavedAdventure) => {
    setSelectedAdventure(adventure);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedAdventure(null);
  };

  // Handle step completion updates
  const handleUpdateStepCompletion = async (adventureId: string, stepIndex: number, completed: boolean) => {
    try {
      const { error } = await aiService.updateStepCompletion(adventureId, stepIndex, completed);
      
      if (error) {
        Alert.alert('Error', 'Failed to update step completion');
        return;
      }

      // Update local state
      setAdventures(prev => prev.map(adventure => {
        if (adventure.id === adventureId) {
          const updatedCompletions = {
            ...adventure.step_completions,
            [stepIndex]: completed
          };
          return {
            ...adventure,
            step_completions: updatedCompletions
          };
        }
        return adventure;
      }));

      // Also update selected adventure if it's the same one
      if (selectedAdventure?.id === adventureId) {
        setSelectedAdventure(prev => ({
          ...prev!,
          step_completions: {
            ...prev!.step_completions,
            [stepIndex]: completed
          }
        }));
      }

    } catch (error) {
      console.error('Error updating step completion:', error);
      Alert.alert('Error', 'Failed to update step completion');
    }
  };

  // Mark entire adventure as complete
  const handleMarkAdventureComplete = async (adventureId: string) => {
    try {
      const { error } = await aiService.markAdventureComplete(adventureId);
      
      if (error) {
        Alert.alert('Error', 'Failed to mark adventure as complete');
        return;
      }

      // Update local state
      setAdventures(prev => prev.map(adventure => {
        if (adventure.id === adventureId) {
          // Mark all steps as completed when adventure is completed
          const allStepsCompleted: { [stepIndex: number]: boolean } = {};
          adventure.steps.forEach((_, index) => {
            allStepsCompleted[index] = true;
          });

          return {
            ...adventure,
            is_completed: true,
            step_completions: allStepsCompleted
          };
        }
        return adventure;
      }));

      // Show success message
      Alert.alert(
        'Congratulations!', 
        'Adventure completed! Great job exploring.',
        [{ text: 'Awesome!', style: 'default' }]
      );

    } catch (error) {
      console.error('Error marking adventure complete:', error);
      Alert.alert('Error', 'Failed to mark adventure as complete');
    }
  };

  // Handle adventure deletion with confirmation
  const handleDeleteAdventure = async (adventureId: string) => {
    Alert.alert(
      'Delete Adventure',
      'Are you sure you want to delete this adventure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await aiService.deleteAdventure(adventureId);
              
              if (error) {
                Alert.alert('Error', 'Failed to delete adventure');
                return;
              }

              // Remove from local state
              setAdventures(prev => prev.filter(a => a.id !== adventureId));
              
              // Close modal if this adventure was being viewed
              if (selectedAdventure?.id === adventureId) {
                closeModal();
              }
              
              Alert.alert('Success', 'Adventure deleted successfully');
            } catch (error) {
              console.error('Error deleting adventure:', error);
              Alert.alert('Error', 'Failed to delete adventure');
            }
          }
        }
      ]
    );
  };

  const handleShareAdventure = (adventure: SavedAdventure) => {
    setAdventureToShare(adventure);
    setShareModalVisible(true);
  };

  // Handle scheduled date update
  const handleUpdateScheduledDate = async (adventureId: string, scheduledDate: string) => {
    try {
      console.log('📅 Updating scheduled date for adventure:', adventureId, 'to:', scheduledDate);
      
      // Update local state immediately for better UX
      setAdventures(prev => prev.map(adventure => {
        if (adventure.id === adventureId) {
          return {
            ...adventure,
            scheduled_date: scheduledDate
          };
        }
        return adventure;
      }));

      // Update in database
      const { error } = await aiService.updateAdventureSchedule(adventureId, scheduledDate);
      
      if (error) {
        console.error('Error updating scheduled date:', error);
        // Revert local state on error
        setAdventures(prev => prev.map(adventure => {
          if (adventure.id === adventureId) {
            return {
              ...adventure,
              scheduled_date: undefined
            };
          }
          return adventure;
        }));
        Alert.alert('Error', 'Failed to schedule adventure');
        return;
      }

      console.log('✅ Adventure scheduled successfully');
    } catch (error) {
      console.error('Error scheduling adventure:', error);
      Alert.alert('Error', 'Failed to schedule adventure');
    }
  };

  // Render horizontal adventure list
  const renderHorizontalAdventureList = (adventures: SavedAdventure[], showShareButton: boolean = false) => {
    const cardWidth = SCREEN_WIDTH * 0.75; // 75% of screen width

    return (
      <FlatList
        data={adventures}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item: adventure }) => (
          <View>
            <GradientAdventureCard
              adventure={adventure}
              onPress={viewAdventureDetails}
              onDelete={handleDeleteAdventure}
              formatDuration={formatDuration}
              formatCost={formatCost}
              formatDate={formatDate}
              cardWidth={cardWidth}
            />
            
            {/* Share button for completed adventures */}
            {showShareButton && (
              <TouchableOpacity
                onPress={() => handleShareAdventure(adventure)}
                style={{
                  backgroundColor: '#f2cc6c',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                  marginTop: 8,
                  marginHorizontal: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: cardWidth - 8,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#3c7660', marginRight: 8 }}>
                  Share to Community
                </Text>
                <Ionicons name="sparkles" size={16} color="#f59e0b" />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    );
  };

  const upcomingAdventures = getUpcomingAdventures();
  const completedAdventures = getCompletedAdventures();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-light">
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading your adventures...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light">
        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadAdventures(true)}
              colors={['#3c7660']} // brand-sage
              tintColor="#3c7660"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Adventures</Text>
            <Text style={styles.headerSubtitle}>
              {adventures.length === 0 
                ? 'No adventures yet' 
                : `${adventures.length} adventure${adventures.length === 1 ? '' : 's'} saved`
              }
            </Text>
          </View>

          {/* Content */}
          {adventures.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="explore" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No Adventures Yet</Text>
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
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={16} color="#f59e0b" />
                    <Text style={styles.sectionTitle}> Upcoming Adventures ({upcomingAdventures.length})</Text>
                  </View>
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Swipe left/right to browse • Long press to delete
                  </Text>
                  
                  {renderHorizontalAdventureList(upcomingAdventures, false)}
                </View>
              )}

              {/* Completed Adventures */}
              {completedAdventures.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={styles.sectionTitle}> Completed Adventures ({completedAdventures.length})</Text>
                  </View>
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Swipe left/right to browse • Tap share button to inspire others
                  </Text>
                  
                  {renderHorizontalAdventureList(completedAdventures, true)}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Adventure Detail Modal */}
        <AdventureDetailModal
          visible={modalVisible}
          adventure={selectedAdventure}
          onClose={closeModal}
          onMarkComplete={handleMarkAdventureComplete}
          onUpdateStepCompletion={handleUpdateStepCompletion}
          onUpdateScheduledDate={handleUpdateScheduledDate}
          formatDate={formatDate}
          formatDuration={formatDuration}
          formatCost={formatCost}
        />

        {/* Share Adventure Modal */}
        <ShareAdventureModal
          visible={shareModalVisible}
          adventure={adventureToShare}
          onClose={() => {
            setShareModalVisible(false);
            setAdventureToShare(null);
          }}
          onSuccess={() => {
            loadAdventures(); // Refresh the list
          }}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for tab bar
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#3c7660',
    fontWeight: '500',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3c7660',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3c7660',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3c7660',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
});

export default PlansScreen;