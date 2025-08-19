import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { Models } from "react-native-appwrite";
import { router } from "expo-router";
import { toggleLike } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

interface Props {
  isClickable: boolean;
  item: Models.Document;
  itemType: "post" | "comment";
}

const Comment = ({ isClickable, item, itemType }: Props) => {
  const { user } = useGlobalContext();
  
  // Single state object to minimize re-renders  
  const [state, setState] = useState({
    liked: false,
    likeCount: item.likes || 0
  });
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hasUserInteracted = useRef(false);
  const isInitialLoadComplete = useRef(false);
  const isLiking = useRef(false); // Use ref to avoid re-renders
  const renderCount = useRef(0);

  // Debug: Track every render
  renderCount.current++;
  console.log(`🔄 Comment ${item.$id.slice(0,8)} render #${renderCount.current}:`, {
    liked: state.liked,
    likeCount: state.likeCount,
    isLiking: isLiking.current,
    hasUserInteracted: hasUserInteracted.current,
    user: user?.$id?.slice(0,8)
  });

  // Load like status for this specific item
  useEffect(() => {
    if (!user || hasUserInteracted.current) return;
    
    const loadLikeStatus = async () => {
      try {
        const { getUserLikeStatus } = await import("@/lib/appwrite");
        const status = await getUserLikeStatus(user.$id, [item.$id]);
        
        // Only update if user hasn't interacted yet
        if (!hasUserInteracted.current) {
          console.log(`📥 Loading initial like status for ${item.$id.slice(0,8)}:`, status[item.$id] || false);
          setState(prev => ({ ...prev, liked: status[item.$id] || false }));
        }
        isInitialLoadComplete.current = true;
      } catch (error) {
        console.error("Failed to load like status:", error);
        isInitialLoadComplete.current = true;
      }
    };

    loadLikeStatus();
  }, [user, item.$id]);

  const handleCommentPress = (id: string) => router.push(`/posts/${id}`);

  const handleLikePress = async () => {
    if (isLiking.current || !user) return; // Prevent double-taps and require login
    
    hasUserInteracted.current = true; // Prevent race condition with initial load
    const newLikedState = !state.liked;
    const newLikeCount = newLikedState ? state.likeCount + 1 : Math.max(0, state.likeCount - 1);
    
    // Single atomic state update to prevent multiple re-renders
    console.log(`❤️ User clicked like on ${item.$id.slice(0,8)}: ${state.liked} → ${newLikedState}`);
    isLiking.current = true; // Set loading state without re-render
    setState({
      liked: newLikedState,
      likeCount: newLikeCount
    });
    
    // Animate heart
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Update database
    try {
      if (!user || !user.$id) {
        throw new Error('User not authenticated');
      }
      const result = await toggleLike(user.$id, item.$id, itemType);
      
      // Only update if server result differs from optimistic update
      console.log(`🌐 Server response for ${item.$id.slice(0,8)}:`, result.liked, 'expected:', newLikedState);
      isLiking.current = false; // Clear loading state without re-render
      
      if (result.liked !== newLikedState) {
        console.log(`🔄 Server disagreed! Updating ${item.$id.slice(0,8)} to:`, result.liked);
        setState(prev => ({ ...prev, liked: result.liked }));
      } else {
        console.log(`✅ Server agreed! No state update needed for ${item.$id.slice(0,8)}`);
        // No setState call = no re-render = no flash!
      }
      
    } catch (error) {
      // Revert on error with single state update
      isLiking.current = false; // Clear loading state
      setState({
        liked: !newLikedState,
        likeCount: newLikedState ? state.likeCount - 1 : state.likeCount + 1
      });
      console.error("Failed to toggle like:", error);
    }
  };

  const CommentContent = () => (
    <View className="flex flex-col items-start">
      <View className="flex flex-row items-center">
        <Image source={{ uri: item.avatar }} className="size-14 rounded-full" />
        <Text className="text-base text-black-300 text-start font-rubik-bold ml-3">
          {item.name}
        </Text>
      </View>

      <Text className="text-black-200 text-base font-rubik mt-2">
        {item.content || item.review}
      </Text>

      <View className="flex flex-row items-center w-full justify-between mt-4">
        <TouchableOpacity
          onPress={handleLikePress}
          className="flex flex-row items-center"
        >
          <Animated.Image
            source={icons.heart}
            style={{
              transform: [{ scale: scaleAnim }],
              tintColor: state.liked ? "#FF0000" : "#0061FF",
            }}
            className="size-5"
          />
          <Text className="text-black-300 text-sm font-rubik-medium ml-2">
            {state.likeCount}
          </Text>
        </TouchableOpacity>
        
        {/* Show comment count for posts (when isClickable is true) */}
        {isClickable && item.commentCount !== undefined && (
          <TouchableOpacity className="flex flex-row items-center">
            <Image source={icons.chat} className="size-5" tintColor="#0061FF" />
            <Text className="text-black-300 text-sm font-rubik-medium ml-1">
              {item.commentCount || 0}
            </Text>
          </TouchableOpacity>
        )}
        
        <Text className="text-black-100 text-sm font-rubik">
          {new Date(item.$createdAt).toDateString()}
        </Text>
      </View>
    </View>
  );

  return isClickable ? (
    <TouchableOpacity onPress={() => handleCommentPress(item.$id)}>
      <CommentContent />
    </TouchableOpacity>
  ) : (
    <View>
      <CommentContent />
    </View>
  );
};

export default React.memo(Comment);
