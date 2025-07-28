import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface UserProfile {
  first_name: string;
  last_name: string;
  bio: string;
  home_city: string;
  birthday: string;
  profile_picture_url: string;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  editForm: UserProfile;
  setEditForm: React.Dispatch<React.SetStateAction<UserProfile>>;
  onUpdateProfile: () => void;
  onPickImage: () => void;
  isUpdating: boolean;
  isUploadingImage: boolean;
  userEmail: string;
  getInitials: (firstName: string, lastName: string, email: string) => string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  editForm,
  setEditForm,
  onUpdateProfile,
  onPickImage,
  isUpdating,
  isUploadingImage,
  userEmail,
  getInitials,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <SafeAreaView className="flex-1">
          <View className="flex-1 bg-background-light">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center p-6 pb-4">
              <TouchableOpacity 
                onPress={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Text className="text-gray-600 font-bold text-lg">×</Text>
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-text-primary">Edit Profile</Text>
              <View className="w-10" />
            </View>

          <ScrollView 
            className="flex-1 px-6" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* Profile Picture Section */}
            <View className="items-center mb-6">
              <TouchableOpacity onPress={onPickImage} className="relative">
                {editForm.profile_picture_url ? (
                  <View className="w-24 h-24 rounded-full bg-gray-100">
                    <Image
                      source={{ uri: editForm.profile_picture_url }}
                      className="w-24 h-24 rounded-full"
                    />
                  </View>
                ) : (
                  <View className="w-24 h-24 rounded-full bg-brand-sage items-center justify-center">
                    <Text className="text-brand-cream text-2xl font-bold">
                      {getInitials(editForm.first_name, editForm.last_name, userEmail)}
                    </Text>
                  </View>
                )}
                
                {/* Camera Icon Overlay */}
                <View className="absolute bottom-0 right-0 bg-brand-gold rounded-full w-8 h-8 items-center justify-center border-2 border-white">
                  <Text className="text-white text-sm">📷</Text>
                </View>
                
                {isUploadingImage && (
                  <View className="absolute inset-0 bg-black bg-opacity-50 rounded-full items-center justify-center">
                    <Text className="text-white text-xs">Uploading...</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text className="text-text-secondary text-sm mt-2">Tap to change photo</Text>
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              <View>
                <Text className="text-text-primary font-medium mb-2">First Name</Text>
                <TextInput
                  value={editForm.first_name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, first_name: text }))}
                  placeholder="Enter your first name"
                  className="bg-background-subtle border border-gray-200 rounded-xl px-4 py-3 text-text-primary"
                />
              </View>

              <View>
                <Text className="text-text-primary font-medium mb-2">Last Name</Text>
                <TextInput
                  value={editForm.last_name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, last_name: text }))}
                  placeholder="Enter your last name"
                  className="bg-background-subtle border border-gray-200 rounded-xl px-4 py-3 text-text-primary"
                />
              </View>

              <View>
                <Text className="text-text-primary font-medium mb-2">Bio</Text>
                <TextInput
                  value={editForm.bio}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                  placeholder="Tell us about yourself..."
                  multiline
                  numberOfLines={3}
                  className="bg-background-subtle border border-gray-200 rounded-xl px-4 py-3 text-text-primary min-h-20"
                  textAlignVertical="top"
                />
              </View>

              <View>
                <Text className="text-text-primary font-medium mb-2">Home City</Text>
                <TextInput
                  value={editForm.home_city}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, home_city: text }))}
                  placeholder="e.g., San Francisco, CA"
                  className="bg-background-subtle border border-gray-200 rounded-xl px-4 py-3 text-text-primary"
                />
              </View>

              <View>
                <Text className="text-text-primary font-medium mb-2">Birthday</Text>
                <TextInput
                  value={editForm.birthday}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, birthday: text }))}
                  placeholder="MM/DD/YYYY"
                  className="bg-background-subtle border border-gray-200 rounded-xl px-4 py-3 text-text-primary"
                />
              </View>
            </View>
          </ScrollView>

          {/* Fixed Action Buttons at Bottom */}
          <View className="absolute bottom-0 left-0 right-0 bg-background-light border-t border-gray-200 p-6 pb-8">
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={onClose}
                className="flex-1 py-4 px-4 rounded-xl border border-gray-300 items-center"
              >
                <Text className="text-text-secondary font-medium text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={onUpdateProfile}
                disabled={isUpdating}
                className="flex-1 bg-brand-sage py-4 px-4 rounded-xl items-center"
                style={{ opacity: isUpdating ? 0.6 : 1 }}
              >
                <Text className="text-brand-cream font-medium text-base">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default EditProfileModal;
