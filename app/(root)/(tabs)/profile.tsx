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
import { logout, uploadToStorage, getUserBalance } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import * as ImagePicker from "expo-image-picker";
import { config, updateUserProfilePhoto } from "@/lib/appwrite";
import { getUserProfilePic } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import { UserBalance } from "@/types";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PointsCard } from "@/components/profile/PointsCard";
import { BetsTab } from "@/components/profile/BetsTab";
import { PointsTab } from "@/components/profile/PointsTab";

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
      className="flex flex-row items-center justify-between py-3 px-4"
    >
      <View className="flex flex-row items-center gap-3">
        <Image source={icon} className="size-6" />
        <Text
          className={`text-lg font-rubik-medium text-black-300 ${
            textStyle || ""
          }`}
        >
          {title}
        </Text>
      </View>
      {showArrow && <Image source={icons.rightArrow} className="size-5" />}
    </TouchableOpacity>
  );
};

const Profile = () => {
  const { user, refetch } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<
    "overview" | "bets" | "points" | "settings"
  >("overview");
  const [balance, setBalance] = useState<UserBalance>({
    totalPoints: 0,
    pendingBets: 0,
    availablePoints: 0,
  });
  const [balanceLoading, setBalanceLoading] = useState(true);

  const { data: profileUrl, loading } = useAppwrite(
    {
      fn: getUserProfilePic,
      params: user!,
      skip: !user,
    },
    [user]
  );

  const fetchBalance = async () => {
    if (!user?.$id) return;

    try {
      const userBalance = await getUserBalance(user.$id);
      setBalance(userBalance);
    } catch (error) {
      console.error("Failed to fetch user balance:", error);
      // Set default balance on error
      setBalance({
        totalPoints: 0,
        pendingBets: 0,
        availablePoints: 0,
      });
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user?.$id]);

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
          refetch();
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

  const TabButton = ({
    id,
    title,
    active,
    onPress,
  }: {
    id: string;
    title: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      className={`flex-1 py-3 items-center border-b-2 ${
        active ? "border-primary-600" : "border-transparent"
      }`}
      onPress={onPress}
    >
      <Text
        className={`font-rubik-medium ${
          active ? "text-primary-600" : "text-gray-500"
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <PointsCard
              balance={balance}
              onViewDetails={() => setActiveTab("points")}
            />
          </ScrollView>
        );
      case "bets":
        return <BetsTab />;
      case "points":
        return <PointsTab />;
      case "settings":
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <View className="bg-white rounded-2xl shadow-sm shadow-black/5 mt-4">
              <SettingsItem title="My Bookings" icon={icons.calendar} />
              <View className="h-px bg-gray-100 mx-4" />
              <SettingsItem title="Payments" icon={icons.wallet} />
              <View className="h-px bg-gray-100 mx-4" />
              {settings.slice(2).map((item, index) => (
                <View key={index}>
                  <SettingsItem {...item} />
                  {index < settings.slice(2).length - 1 && (
                    <View className="h-px bg-gray-100 mx-4" />
                  )}
                </View>
              ))}
              <View className="h-px bg-gray-200 mx-4" />
              <SettingsItem
                title="Logout"
                icon={icons.logout}
                onPress={handleLogout}
                textStyle="text-red-600"
                showArrow={false}
              />
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView className="h-full bg-gray-50">
      {/* Simple Header */}
      <View className="bg-white mx-4 rounded-2xl mt-6 shadow-sm shadow-black/5 p-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-rubik-bold text-gray-900">Profile</Text>
          <TouchableOpacity className="p-2">
            <Image source={icons.bell} className="w-6 h-6" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center">
          <View className="relative">
            <Image
              source={{
                uri: loading ? user.avatar : profileUrl || user.avatar,
              }}
              className="w-16 h-16 rounded-full border-2 border-gray-200"
            />
            <TouchableOpacity
              className="absolute -bottom-1 -right-1 bg-primary-600 rounded-full p-1.5"
              onPress={handleEditProfilePic}
            >
              <Image source={icons.edit} className="w-3 h-3 tint-white" />
            </TouchableOpacity>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-lg font-rubik-bold text-gray-900 mb-1">
              {user?.name}
            </Text>
            <Text className="text-sm font-rubik text-gray-500">
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white mx-4 rounded-2xl mt-4 shadow-sm shadow-black/5">
        <View className="flex-row">
          <TabButton
            id="overview"
            title="Overview"
            active={activeTab === "overview"}
            onPress={() => setActiveTab("overview")}
          />
          <TabButton
            id="bets"
            title="Bets"
            active={activeTab === "bets"}
            onPress={() => setActiveTab("bets")}
          />
          <TabButton
            id="points"
            title="Points"
            active={activeTab === "points"}
            onPress={() => setActiveTab("points")}
          />
          <TabButton
            id="settings"
            title="Settings"
            active={activeTab === "settings"}
            onPress={() => setActiveTab("settings")}
          />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 mt-4">{renderContent()}</View>
    </SafeAreaView>
  );
};

export default Profile;
