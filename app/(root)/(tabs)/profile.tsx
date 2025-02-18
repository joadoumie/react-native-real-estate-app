import {
  Alert,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { settings } from "@/constants/data";
import { logout, uploadToStorage } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import * as ImagePicker from "expo-image-picker";
import { useAppwrite } from "@/lib/useAppwrite";

interface SettingsItemProps {
  title: string;
  icon: ImageSourcePropType;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingsItem = ({
  title,
  icon,
  onPress,
  textStyle,
  showArrow = true,
}: SettingsItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-row items-center justify-between py-3"
    >
      <View className="flex flex-row items-center gap-3">
        <Image source={icon} className="size-6" />
        <Text className="{`text-lg font-rubik-medium text-black-300 ${textStyle}`}">
          {title}
        </Text>
      </View>
      {showArrow && <Image source={icons.rightArrow} className="size-5" />}
    </TouchableOpacity>
  );
};

const Profile = () => {
  const { user } = useGlobalContext();

  // Store selected image details
  const [uploadParams, setUploadParams] = useState<{
    uri: string;
    permissions: string[];
    fileId: string;
    name?: string;
    ftype?: string;
  } | null>(null);

  const {
    data: response,
    loading,
    refetch,
  } = useAppwrite({
    fn: uploadToStorage,
    params: uploadParams, // Trigger only when uploadParams is set
    skip: !uploadParams, // Skip if no image is selected
  });

  useEffect(() => {
    console.log("uploadParams updated:", uploadParams);
    if (response) {
      Alert.alert("Success", "Profile picture updated successfully");
      refetch();
    }
  }, [response, uploadParams]);

  const handleLogout = async () => {
    const result = await logout();

    if (result) {
      Alert.alert("Success", "Logged out successfully");
      refetch();
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  const handleEditProfilePic = async () => {
    console.log("Trying to edit profile pic");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log("ImagePicker result:", result);

      if (result.canceled) {
        console.log("Image picker cancelled");
        return;
      }

      const uri = result.assets[0].uri;
      console.log(uri);

      if (uri) {
        setUploadParams({
          uri,
          permissions: [],
          fileId: result.assets[0].assetId,
          name: result.assets[0].fileName,
          ftype: result.assets[0].type,
        });
      }
    } catch (error) {
      console.error("Error launching image picker:", error);
    }
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >
        <View className="flex flex-row items-center justify-between mt-5">
          <Text className="text-xl font-rubik-bold">Profile</Text>
          <Image source={icons.bell} className="size-5" />
        </View>

        <View className="flex-row justify-center flex mt-5">
          <View className="flex flex-col items-center relative mt-5">
            <Image
              source={{
                uri: user?.prefs?.avatar ? user.prefs.avatar : user.avatar,
              }}
              className="size-44 relative rounded-full"
            />
            <TouchableOpacity
              className="absolute bottom-11 right-2"
              onPress={handleEditProfilePic}
            >
              <Image source={icons.edit} className="size-9" />
            </TouchableOpacity>
            <Text className="text-2xl font-rubik-bold mt-2">{user?.name}</Text>
          </View>
        </View>
        <View className="flex flex-col mt-10">
          <SettingsItem title="My Bookings" icon={icons.calendar} />
          <SettingsItem title="Payments" icon={icons.wallet} />
        </View>
        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
          {settings.slice(2).map((item, index) => (
            <SettingsItem key={index} {...item} />
          ))}
        </View>
        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
          <SettingsItem
            title="Logout"
            icon={icons.logout}
            onPress={handleLogout}
            textStyle="text-danger"
            showArrow={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
