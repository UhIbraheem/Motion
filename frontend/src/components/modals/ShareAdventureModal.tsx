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
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
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
      duration: 300,
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
            {/* Handle */}
            <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
              <View style={{
                width: 40,
                height: 4,
                backgroundColor: '#E5E5E5',
                borderRadius: 2,
              }} />
            </View>

            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#3c7660',
                marginBottom: 8,
                textAlign: 'center'
              }}>
                Share Your Adventure
              </Text>
              {/* Custom Title */}
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>
                  Give it a memorable title
                </Text>
                <TextInput
                  value={customTitle}
                  onChangeText={setCustomTitle}
                  placeholder="e.g., Amazing Coffee Crawl in Downtown"
                  style={{
                    borderWidth: 1,
                    borderColor: '#E5E5E5',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 15
                  }}
                />
              </View>
              {/* Description */}
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>
                  What made it special?
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Share highlights, tips, or memorable moments..."
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E5E5E5',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 15,
                    height: 70,
                    textAlignVertical: 'top'
                  }}
                />
              </View>
              {/* Rating */}
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>
                  Rate your experience
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                    >
                      <Text style={{ fontSize: 26 }}>
                        {star <= rating ? '⭐' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {/* Divider */}
              <View style={{
                height: 1,
                backgroundColor: '#E5E5E5',
                marginVertical: 8,
                marginHorizontal: -24 // full width
              }} />
            </View>

            {/* Scrollable Content */}
            <ScrollView style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
              {/* Photos */}
              <View style={{ marginBottom: 30 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                  Add photos (optional)
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {photos.map((photo, index) => (
                    <View key={index} style={{
                      width: 100,
                      height: 100,
                      borderRadius: 12,
                      backgroundColor: '#F5F5F5'
                    }}>
                      {/* Photo preview would go here */}
                      <TouchableOpacity
                        style={{ position: 'absolute', top: 4, right: 4 }}
                        onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                      >
                        <Text>❌</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {photos.length < 3 && (
                    <TouchableOpacity
                      onPress={pickImage}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: '#f2cc6c',
                        borderStyle: 'dashed',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>📷</Text>
                      <Text style={{ fontSize: 12, color: '#666' }}>Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Cancel"
                    onPress={animateClose}
                    variant="outline"
                    disabled={isSharing}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title={isSharing ? "Sharing..." : "Share Adventure"}
                    onPress={handleShare}
                    variant="primary"
                    isLoading={isSharing}
                  />
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};