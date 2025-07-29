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
import { Ionicons } from '@expo/vector-icons';

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
  const InputSection = ({ 
    icon, 
    title, 
    description, 
    value,
    onChangeText,
    placeholder,
    multiline = false
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
  }) => (
    <View className="py-4 px-4">
      <View className="flex-row items-center mb-3">
        <Ionicons name={icon as any} size={20} color="#3c7660" />
        <View className="ml-3 flex-1">
          <Text className="text-base font-medium text-gray-800">{title}</Text>
          <Text className="text-sm text-gray-500 mt-1">{description}</Text>
        </View>
      </View>
      
      <View className="ml-8">
        <TextInput
          className={`bg-gray-50 border border-gray-300 rounded-lg px-3 py-3 text-gray-800 ${
            multiline ? 'min-h-[80px]' : ''
          }`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">Edit Profile</Text>
          <TouchableOpacity onPress={onUpdateProfile} disabled={isUpdating}>
            <Text className={`font-medium ${isUpdating ? 'text-gray-400' : 'text-green-600'}`}>
              {isUpdating ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Profile Picture */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Profile Picture</Text>
            </View>
            
            <View className="py-6 px-4 items-center">
              <TouchableOpacity 
                onPress={onPickImage}
                disabled={isUploadingImage}
                className="relative"
              >
                {editForm.profile_picture_url ? (
                  <Image 
                    source={{ uri: editForm.profile_picture_url }} 
                    className="w-24 h-24 rounded-full bg-gray-200"
                  />
                ) : (
                  <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
                    <Text className="text-2xl font-semibold text-gray-600">
                      {getInitials(editForm.first_name, editForm.last_name, userEmail)}
                    </Text>
                  </View>
                )}
                
                <View className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-2">
                  <Ionicons 
                    name={isUploadingImage ? "hourglass" : "camera"} 
                    size={16} 
                    color="white" 
                  />
                </View>
              </TouchableOpacity>
              
              <Text className="text-center text-gray-500 mt-3">
                {isUploadingImage ? 'Uploading...' : 'Tap to change photo'}
              </Text>
            </View>
          </View>

          {/* Basic Information */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Basic Information</Text>
            </View>
            
            <InputSection
              icon="person"
              title="First Name"
              description="Your first name"
              value={editForm.first_name}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, first_name: text }))}
              placeholder="Enter your first name"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <InputSection
              icon="person"
              title="Last Name"
              description="Your last name"
              value={editForm.last_name}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, last_name: text }))}
              placeholder="Enter your last name"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <InputSection
              icon="location"
              title="Home City"
              description="Where you're based"
              value={editForm.home_city}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, home_city: text }))}
              placeholder="Enter your city"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <InputSection
              icon="calendar"
              title="Birthday"
              description="Your date of birth (YYYY-MM-DD)"
              value={editForm.birthday}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, birthday: text }))}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* About */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">About</Text>
            </View>
            
            <InputSection
              icon="document-text"
              title="Bio"
              description="Tell others about yourself"
              value={editForm.bio}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
              placeholder="Write a short bio..."
              multiline={true}
            />
          </View>

          {/* Footer spacing */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default EditProfileModal;
