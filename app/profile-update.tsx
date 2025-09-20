import { AutoDismissNotification } from '@/components/ui/AutoDismissNotification';
import { ModernTextInput } from '@/components/ui/ModernTextInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { validateIndianMobile } from '@/constants/Api';
import { useAuth } from '@/contexts/AuthContext';
import { getAvatarProps, getInitialsBackgroundColor } from '@/utils/avatarUtils';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ProfileUpdateScreen() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Validation errors
  const [nameError, setNameError] = useState('');
  const [mobileError, setMobileError] = useState('');

  // Get avatar props for current user
  const avatarProps = user ? getAvatarProps(user) : null;

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      // Remove +91 prefix if present, keep only 10 digits
      const mobileNumber = user.mobile ? user.mobile.replace(/^\+91/, '').replace(/^\+/, '') : '';
      setMobile(mobileNumber);
      setProfilePicture(user.profile_picture || null);
    }
  }, [user]);

  // Fetch fresh profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log('🔍 Fetching fresh profile data for update screen');
        // The user data will be updated through AuthContext when needed
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfileData();
  }, []);

  const handleNameChange = (text: string) => {
    setName(text);
    setNameError('');
  };

  const handleMobileChange = (text: string) => {
    // Clean the input - remove all non-digit characters
    const cleanedText = text.replace(/\D/g, '');
    
    // Limit to 10 digits for Indian mobile numbers
    const limitedText = cleanedText.slice(0, 10);
    
    setMobile(limitedText);
    setMobileError('');
    
    if (limitedText.length > 0 && !validateIndianMobile(limitedText)) {
      setMobileError('Please enter a valid 10-digit mobile number');
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate mobile (optional but if provided, must be valid)
    if (mobile.trim() && !validateIndianMobile(mobile.trim())) {
      setMobileError('Please enter a valid 10-digit mobile number');
      isValid = false;
    } else {
      setMobileError('');
    }

    return isValid;
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access photo library is required to upload a profile picture.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
        setImageLoadError(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = () => {
    setProfilePicture(null);
    setImageLoadError(false);
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const profileData: {
        name?: string;
        mobile?: string;
        profile_picture?: string;
      } = {
        name: name.trim(),
      };

      // Add mobile if provided (add +91 prefix for Indian numbers)
      if (mobile.trim()) {
        profileData.mobile = `+91${mobile.trim()}`;
      }

      // Add profile picture if selected and different from current
      if (profilePicture && profilePicture !== user?.profile_picture) {
        profileData.profile_picture = profilePicture;
      }

      console.log('🔍 Updating profile with data:', profileData);

      // Use AuthContext updateProfile method
      const error = await updateProfile(profileData);

      if (error) {
        throw error;
      }

      // Show success notification
      setShowSuccessNotification(true);

      // Navigate back to profile screen after a delay
      setTimeout(() => {
        router.back();
      }, 2000);

    } catch (error) {
      console.error('Profile update error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile');
      setShowErrorNotification(true);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCancel = () => {
    // Reset form to original values
    if (user) {
      setName(user.name || '');
      // Remove +91 prefix if present, keep only 10 digits
      const mobileNumber = user.mobile ? user.mobile.replace(/^\+91/, '').replace(/^\+/, '') : '';
      setMobile(mobileNumber);
      setProfilePicture(user.profile_picture || null);
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePictureWrapper}>
              {profilePicture && !imageLoadError ? (
                <Image 
                  source={{ uri: profilePicture }}
                  style={styles.profileImage}
                  onError={() => setImageLoadError(true)}
                />
              ) : (
                <View style={[
                  styles.profileInitialsContainer,
                  { backgroundColor: getInitialsBackgroundColor(user?.id || 0) }
                ]}>
                  <Text style={styles.profileInitials}>
                    {avatarProps?.initials || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.profileImageBorder} />
            </View>

            <View style={styles.profilePictureActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={16} color="#3B82F6" />
                <Text style={styles.actionButtonText}>Change</Text>
              </TouchableOpacity>
              
              {profilePicture && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={removeImage}
                >
                  <Ionicons name="trash" size={16} color="#EF4444" />
                  <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          {/* Name Field */}
          <ModernTextInput
            icon="person"
            placeholder="Full Name"
            value={name}
            onChangeText={handleNameChange}
            error={nameError}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {/* Email Field (Read-only) */}
          <View style={styles.inputContainer}>
            <ModernTextInput
              icon="mail"
              placeholder="Email Address"
              value={user?.email || ''}
              editable={false}
              style={styles.readOnlyInput}
            />
            <Text style={styles.readOnlyNote}>
              Email cannot be changed as it's unique to your account
            </Text>
          </View>

          {/* Mobile Field */}
          <ModernTextInput
            icon="call"
            placeholder="Phone Number"
            value={mobile}
            onChangeText={handleMobileChange}
            error={mobileError}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <PrimaryButton
            title={isLoading ? "Updating..." : "Update Profile"}
            onPress={handleUpdateProfile}
            loading={isLoading}
            style={styles.updateButton}
          />
        </View>
      </ScrollView>

      {/* Notifications */}
      <AutoDismissNotification
        visible={showSuccessNotification}
        message="Profile updated successfully!"
        type="success"
        onDismiss={() => setShowSuccessNotification(false)}
      />

      <AutoDismissNotification
        visible={showErrorNotification}
        message={errorMessage}
        type="error"
        onDismiss={() => setShowErrorNotification(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  placeholder: {
    width: 40,
  },
  profilePictureSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  profilePictureContainer: {
    alignItems: 'center',
  },
  profilePictureWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileInitialsContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  profileImageBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 54,
    borderWidth: 4,
    borderColor: '#3B82F6',
  },
  profilePictureActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  removeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  removeButtonText: {
    color: '#EF4444',
  },
  formSection: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  readOnlyInput: {
    backgroundColor: '#F8FAFC',
    color: '#94A3B8',
    borderColor: '#E2E8F0',
  },
  readOnlyNote: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    marginLeft: 16,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  updateButton: {
    flex: 2,
  },
});
