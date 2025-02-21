import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Text,
  SafeAreaView,
} from "react-native";
import Comment from "@/components/Comment";
import { getReviews } from "@/lib/appwrite";
import { useEffect, useState, useRef, useCallback } from "react";
import { Models } from "react-native-appwrite";
import NoResults from "@/components/NoResults";
import icons from "@/constants/icons";
import { router } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import { useAppwrite } from "@/lib/useAppwrite";

export default function Posts() {
  const { user } = useGlobalContext();
  const [reviews, setReviews] = useState<Models.Document[]>([]);
  const [lastReviewId, setLastReviewId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const hasFetchedOnce = useRef(false);
  const isFetching = useRef(false);
  const lastFetchTimestamp = useRef(0);
  const reachedBottom = useRef(false);
  const prevReviews = useRef<Models.Document[]>([]);

  const { data, refetch, loading } = useAppwrite({
    fn: getReviews,
    params: {
      limit: 10,
      cursorAfter: lastReviewId ?? undefined,
    },
    skip: true,
  });

  useEffect(() => {
    if (!hasFetchedOnce.current) {
      hasFetchedOnce.current = true;
      refetch({ limit: 10 });
    }
  }, [refetch]);

  useEffect(() => {
    if (!data) return;

    if (data.length === 0) {
      setHasMore(false);
      return;
    }

    // Check if new reviews actually change the state
    const newReviews = data.filter(
      (review) => !prevReviews.current.some((prev) => prev.$id === review.$id)
    );

    if (newReviews.length > 0) {
      prevReviews.current = [...prevReviews.current, ...newReviews]; // Keep track of previous data
      setReviews((prev) => [...prev, ...newReviews]);
      setLastReviewId(data[data.length - 1].$id);
      setHasMore(data.length === 10);
    }
  }, [data]);

  const loadMoreReviews = useCallback(async () => {
    if (
      loadingMore ||
      loading ||
      !hasMore ||
      isFetching.current ||
      !reachedBottom.current
    )
      return;

    const now = Date.now();
    if (now - lastFetchTimestamp.current < 1000) return;
    lastFetchTimestamp.current = now;

    isFetching.current = true;
    setLoadingMore(true);

    try {
      await refetch({
        limit: 10,
        cursorAfter: lastReviewId ?? undefined,
      });
    } finally {
      isFetching.current = false;
      setLoadingMore(false);
    }
  }, [loadingMore, loading, hasMore, refetch, lastReviewId]);

  /** 🔥 Memoize renderItem to avoid unnecessary re-renders */
  const renderItem = useCallback(({ item }: { item: Models.Document }) => {
    return (
      <View className="border-t border-primary-200 py-5">
        <Comment item={item} isClickable={true} />
      </View>
    );
  }, []);

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="px-7 mt-5 flex-1">
        <FlatList
          data={reviews}
          renderItem={renderItem} // Memoized!
          keyExtractor={(item) => item.$id}
          contentContainerClassName="pb-32"
          initialNumToRender={10} // Prevents unnecessary loading on first render
          extraData={reviews.length} // Forces re-render only when list length changes
          onEndReached={() => {
            reachedBottom.current = true;
            loadMoreReviews();
          }}
          onEndReachedThreshold={0.1}
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
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: 15, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#888" />
                <Text style={{ color: "#888", marginTop: 5 }}>
                  Loading more...
                </Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            <View className="flex flex-row items-center justify-between">
              <Text className="pb-3 text-xl font-rubik-bold text-black-300">
                Posts
              </Text>
            </View>
          }
        />
        <View
          style={{
            position: "absolute",
            bottom: 90,
            right: 20,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            className="bg-primary-300 shadow-md shadow-zinc-400"
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              elevation: 5,
            }}
            onPress={() => router.push(`/posts/create`)}
          >
            <Image source={icons.plus} style={{ width: 24, height: 24 }} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
