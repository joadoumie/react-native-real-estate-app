import {
  Button,
  Image,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Link, useLocalSearchParams, router } from "expo-router";
import images from "@/constants/images";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import PostInput from "@/components/PostInput";
import { Card, FeaturedCard } from "@/components/Cards";
import Filters from "@/components/Filters";
import { useGlobalContext } from "@/lib/global-provider";
import seed from "@/lib/seed";
import { useAppwrite } from "@/lib/useAppwrite";
import { getLatestProperties, getProperties, createPost } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import NoResults from "@/components/NoResults";

export default function CreatePost() {
  const { user } = useGlobalContext();
  const [postText, setPostText] = useState("");

  const handlePostSubmit = async () => {
    console.log(postText);
    const newPost: INewPost = {
      userId: user.$id,
      name: user.name,
      avatar: user.avatar,
      review: postText,
      rating: 5,
    };
    try {
      await createPost(newPost);
      setPostText(""); // Clear the input after submitting
      router.push(`/posts`);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <SafeAreaView>
      <View className="px-5">
        <View className="flex flex-row items-center justify-between mt-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
          >
            <Image source={icons.cancel} className="size-5" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePostSubmit}
            disabled={!postText}
            style={[styles.postButton, !postText && styles.postButtonDisabled]}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="mt-5">
        <PostInput postText={postText} setPostText={setPostText} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  postButton: {
    justifyContent: "center",
    backgroundColor: "#0061FF", // Enabled background color
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#FBFBFD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  postButtonDisabled: {
    justifyContent: "center",
    backgroundColor: "#A9A9A9", // Disabled background color
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowOpacity: 0, // Remove shadow for disabled state
  },
  postButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});
