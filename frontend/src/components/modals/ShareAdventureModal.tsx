import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Button from '../Button';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShareAdventureModalProps {
  visible: boolean;
  adventure: any; // Your adventure type
  onClose: () => void;
  onSuccess: () => void;
}

export const ShareAdventureModal: React.FC<ShareAdventureModalProps> = ({
  visible,
  adventure,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [customTitle, setCustomTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setCustomTitle(adventure?.title || '');
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.slice(0, 3).map(asset => asset.uri);
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 3));
    }
  };

  const handleShare = async () => {
    if (!customTitle.trim()) {
      Alert.alert('Title Required', 'Please add a title for your adventure');
      return;
    }

    setIsSharing(true);
    try {
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        setIsSharing(false);
        return;
      }
      await aiService.shareCommunityAdventure({
        userId: user.id,
        originalAdventureId: adventure.id,
        customTitle,
        customDescription: description,
        rating,
        photos,
        location: adventure.location || 'Unknown',
        durationHours: adventure.duration_hours,
        estimatedCost: adventure.estimated_cost,
        steps: adventure.steps,
        completedDate: new Date().toISOString()
      });

      Alert.alert('Success!', 'Your adventure has been shared with the community');
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to share adventure');
      console.error(error);
    } finally {
      setIsSharing(false);
    }
  };

  const animateClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Overlay */}
      <TouchableOpacity 
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        activeOpacity={1}
        onPress={animateClose}
      />
      
      {/* Modal Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
      >
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: SCREEN_HEIGHT * 0.9,
          }}
        >
          <SafeAreaView>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <TouchableOpacity onPress={animateClose}>
                <Text className="text-gray-500 text-lg">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-brand-sage">Share Adventure</Text>
              <View className="w-16" />
            </View>

            <ScrollView 
              className="px-4 py-2"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: SCREEN_HEIGHT * 0.7 }}
            >
              {/* Custom Title */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-gray-800 mb-2">
                  Title
                </Text>
                <TextInput
                  value={customTitle}
                  onChangeText={setCustomTitle}
                  placeholder="Give your adventure a memorable title..."
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-base text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-gray-800 mb-2">
                  Description
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Share highlights, tips, or memorable moments..."
                  multiline
                  numberOfLines={4}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-base text-gray-800"
                  style={{ height: 100, textAlignVertical: 'top' }}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Rating */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-gray-800 mb-2">
                  Rating
                </Text>
                <View className="flex-row items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      className="p-1"
                    >
                      <Text className="text-2xl">
                        <Ionicons 
                          name={star <= rating ? "star" : "star-outline"} 
                          size={20} 
                          color="#f59e0b" 
                        />
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <Text className="text-gray-600 ml-2">({rating}/5)</Text>
                </View>
              </View>

              {/* Photos */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-800 mb-2">
                  Photos (Optional)
                </Text>
                <View className="flex-row space-x-3">
                  {photos.map((photo, index) => (
                    <View key={index} className="relative">
                      <View className="w-20 h-20 rounded-xl bg-gray-100">
                        {/* Photo preview would go here */}
                      </View>
                      <TouchableOpacity
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                        onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                      >
                        <Ionicons name="close" size={12} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {photos.length < 3 && (
                    <TouchableOpacity
                      onPress={pickImage}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-brand-gold items-center justify-center bg-gray-50"
                    >
                      <Ionicons name="camera" size={24} color="#9CA3AF" />
                      <Text className="text-xs text-gray-600 mt-1">Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Fixed bottom action buttons */}
            <View className="flex-row space-x-3 p-4 bg-white border-t border-gray-100">
              <View className="flex-1">
                <Button
                  title="Cancel"
                  onPress={animateClose}
                  variant="outline"
                  disabled={isSharing}
                />
              </View>
              <View className="flex-1">
                <Button
                  title={isSharing ? "Sharing..." : "Share Adventure"}
                  onPress={handleShare}
                  variant="primary"
                  isLoading={isSharing}
                />
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};