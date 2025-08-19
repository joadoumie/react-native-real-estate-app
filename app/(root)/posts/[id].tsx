import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Comment from "@/components/Comment";
import PostInput from "@/components/PostInput";
import { getReviewById, getCommentsByPostId, createComment } from "@/lib/appwrite";
import { useEffect, useState, useCallback, useRef } from "react";
import { Models } from "react-native-appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import icons from "@/constants/icons";
import { useLocalSearchParams, router } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import { INewComment } from "@/types";

export default function Posts() {
  const { user } = useGlobalContext();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [comments, setComments] = useState<Models.Document[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { data: post } = useAppwrite({
    fn: getReviewById,
    params: { id: id! },
  });

  const { 
    data: commentsData, 
    loading: commentsLoading, 
    refetch: refetchComments 
  } = useAppwrite({
    fn: getCommentsByPostId,
    params: { postId: id!, limit: 20 },
    skip: !id,
  });

  useEffect(() => {
    if (commentsData) {
      setComments(commentsData);
    }
  }, [commentsData]);

  const handleCommentSubmit = useCallback(async () => {
    if (!commentText.trim() || !user || !id) return;

    setIsSubmittingComment(true);

    const newComment: INewComment = {
      postId: id,
      userId: user.$id,
      name: user.name,
      content: commentText.trim(),
      likes: 0,
    };

    try {
      const result = await createComment(newComment);
      if (result) {
        setCommentText("");
        // Refresh comments to show the new one
        await refetchComments({ postId: id, limit: 20 });
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [commentText, user, id, refetchComments]);

  const renderComment = useCallback(({ item }: { item: Models.Document }) => (
    <View className="border-t border-primary-200 py-4 px-4">
      <Comment 
        item={item} 
        isClickable={false} 
        itemType="comment"
      />
    </View>
  ), []);

  const renderPost = useCallback(() => {
    if (!post || post.length === 0) return null;
    
    return (
      <View className="px-4 py-5 border-b border-primary-200">
        <Comment 
          item={post[0]} 
          isClickable={false} 
          itemType="post"
        />
        <Text className="text-lg font-rubik-bold text-black-300 mt-4 mb-2">
          Comments ({comments.length})
        </Text>
      </View>
    );
  }, [post, comments.length]);

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-5 py-3 border-b border-primary-100">
          <View className="flex flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
            >
              <Image source={icons.backArrow} className="size-5" />
            </TouchableOpacity>
            <Text className="text-lg font-rubik-bold text-black-300">Post</Text>
            <Image source={icons.bell} className="w-6 h-6" />
          </View>
        </View>

        {/* Content */}
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.$id}
          ListHeaderComponent={renderPost}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            commentsLoading ? (
              <View className="py-10">
                <ActivityIndicator size="large" className="text-primary-300" />
              </View>
            ) : (
              <View className="py-10 px-4">
                <Text className="text-center text-black-200 font-rubik">
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            )
          }
        />

        {/* Comment Input */}
        <PostInput
          postText={commentText}
          setPostText={setCommentText}
          variant="comment"
          showSubmitButton={true}
          onSubmit={handleCommentSubmit}
          isSubmitting={isSubmittingComment}
          maxLength={500}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
