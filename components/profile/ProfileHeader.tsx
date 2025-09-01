import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import icons from "@/constants/icons";
import { UserBalance } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { config, updateUserProfilePhoto, uploadToStorage } from "@/lib/appwrite";

interface ProfileHeaderProps {
  user: {
    name: string;
    avatar: string;
    email: string;
  };
  balance: UserBalance;
  profileUrl?: string;
  loading?: boolean;
  onRefetch?: () => void;
}

export const ProfileHeader = ({
  user,
  balance,
  profileUrl,
  loading,
  onRefetch,
}: ProfileHeaderProps) => {
  const handleEditProfilePic = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "We may need camera roll permissions to make this work. Please enable it from settings."
        );
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      const uploadResponse = await uploadToStorage(uri);

      if (uploadResponse && uploadResponse.$id) {
        const publicUrl = `${config.endpoint}/storage/buckets/${config.profilePicBucketId}/files/${uploadResponse.$id}/view?project=${config.projectId}`;

        const updateResponse = await updateUserProfilePhoto(publicUrl);

        if (updateResponse) {
          Alert.alert("Success", "Profile picture updated successfully");
          onRefetch?.();
        } else {
          Alert.alert("Error", "Failed to update profile picture");
        }
      } else {
        Alert.alert("Error", "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#007AFF", "#0056CC"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mx-4 mt-6 rounded-3xl p-6 shadow-lg shadow-black/20"
    >
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-rubik-bold text-white">Profile</Text>
        <TouchableOpacity className="p-2">
          <Image source={icons.bell} className="w-6 h-6 tintColor-white" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View className="flex-row items-center mb-6">
        <View className="relative">
          <Image
            source={{
              uri: loading ? user.avatar : profileUrl || user.avatar,
            }}
            className="w-20 h-20 rounded-full border-3 border-white/20"
          />
          <TouchableOpacity
            className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md"
            onPress={handleEditProfilePic}
          >
            <Image source={icons.edit} className="w-4 h-4" />
          </TouchableOpacity>
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-xl font-rubik-bold text-white mb-1">
            {user?.name}
          </Text>
          <Text className="text-sm font-rubik text-white/80">
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Points Display */}
      <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        <Text className="text-sm font-rubik text-white/80 mb-2">Total Balance</Text>
        <Text className="text-3xl font-rubik-bold text-white mb-4">
          {balance.totalPoints.toLocaleString()} pts
        </Text>
        
        <View className="flex-row justify-between">
          <View className="flex-1">
            <Text className="text-xs font-rubik text-white/70 mb-1">Available</Text>
            <Text className="text-lg font-rubik-bold text-white">
              {balance.availablePoints.toLocaleString()}
            </Text>
          </View>
          <View className="w-px bg-white/20 mx-4" />
          <View className="flex-1 items-end">
            <Text className="text-xs font-rubik text-white/70 mb-1">Pending</Text>
            <Text className="text-lg font-rubik-bold text-orange-300">
              {balance.pendingBets.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};