import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import Comment from "@/components/Comment";
import { getReviews, getReviewById } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { Models } from "react-native-appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import NoResults from "@/components/NoResults";
import icons from "@/constants/icons";
import { useLocalSearchParams, router } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";

export default function Posts() {
  const { user } = useGlobalContext();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: post, loading } = useAppwrite({
    fn: getReviewById,
    params: {
      id: id!,
    },
  });

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="px-5">
        <View className="flex flex-row items-center justify-between mt-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
          >
            <Image source={icons.backArrow} className="size-5" />
          </TouchableOpacity>

          <Image source={icons.bell} className="w-6 h-6" />
        </View>
      </View>
      <View className="mt-7 px-4 flex-1">
        <FlatList
          data={post}
          renderItem={({ item }) => (
            <View className="border-t border-primary-200 py-5">
              <Comment item={item!} isClickable={false} />
            </View>
          )}
          keyExtractor={(item) => item.$id}
          contentContainerClassName="mt-5 pb-32" // Extra padding at the bottom for button space
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator
                size="large"
                className="text-primary-300 mt-5"
              />
            ) : (
              <NoResults />
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
