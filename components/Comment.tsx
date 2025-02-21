import React, { useState, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { Models } from "react-native-appwrite";
import { router } from "expo-router";

interface Props {
  isClickable: boolean;
  item: Models.Document;
}

const Comment = ({ isClickable, item }: Props) => {
  const [liked, setLiked] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleCommentPress = (id: string) => router.push(`/posts/${id}`);

  const handleLikePress = () => {
    setLiked(!liked);
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
        {item.review}
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
              tintColor: liked ? "#FF0000" : "#0061FF",
            }}
            className="size-5"
          />
          <Text className="text-black-300 text-sm font-rubik-medium ml-2">
            120
          </Text>
        </TouchableOpacity>
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

export default Comment;
