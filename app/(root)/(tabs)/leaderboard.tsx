import { View, Text, FlatList, SafeAreaView, Image } from "react-native";
import { useGlobalContext } from "@/lib/global-provider";
import Ranking from "@/components/Ranking";
import icons from "@/constants/icons";
import { useState } from "react";
import { useAppwrite } from "@/lib/useAppwrite";
import { getSortedUsersByBalance } from "@/lib/appwrite";
import { IUser } from "@/lib/types";

export default function Leaderboard() {
  const { user } = useGlobalContext();

  const { data, loading } = useAppwrite<{
    leaderboard: LeaderboardUser[];
    userRank?: string;
    userBalance?: number;
  }>({
    fn: () => getSortedUsersByBalance(user?.email),
  });

  const sortedUsers = data?.leaderboard || [];
  const userRank = data?.userRank || "N/A";
  const userBalance = data?.userBalance || 0;

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="px-7 flex flex-row items-center justify-between mt-5">
        <Text className="text-xl font-rubik-bold">Leaderboard</Text>
        <Image source={icons.bell} className="size-5" />
      </View>
      <View className="pb-8 mt-5">
        <View className="relative w-full flex items-center justify-center">
          <Text className="absolute left-6 text-3xl font-rubik-bold">
            {userRank}
          </Text>
          <Image
            source={{
              uri: user?.prefs?.avatar ? user.prefs.avatar : user.avatar,
            }}
            className="size-16 relative rounded-full"
          />
          <Text className="absolute right-6 text-3xl font-rubik-bold">
            {userBalance} pts
          </Text>
        </View>
      </View>

      <View className="px-4 flex-1">
        <FlatList
          data={sortedUsers}
          renderItem={({ item }) => <Ranking user={item} />}
          keyExtractor={(item) => item.$id}
        />
      </View>
    </SafeAreaView>
  );
}
