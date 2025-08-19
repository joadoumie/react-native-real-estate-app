import React, { useState } from "react";
import { View, TextInput, StyleSheet, Image, TouchableOpacity, Text, Alert } from "react-native";
import { useGlobalContext } from "@/lib/global-provider";

interface Props {
  postText: string;
  setPostText: (text: string) => void;
  variant?: "post" | "comment";
  placeholder?: string;
  showSubmitButton?: boolean;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  maxLength?: number;
}

const PostInput = ({ 
  postText, 
  setPostText, 
  variant = "post",
  placeholder,
  showSubmitButton = false,
  onSubmit,
  isSubmitting = false,
  maxLength = 1000
}: Props) => {
  const { user } = useGlobalContext();

  const defaultPlaceholder = variant === "comment" ? "Add a comment..." : "What's on your mind?";
  const inputHeight = variant === "comment" ? 40 : 100;
  const showAvatar = variant === "post";

  const handleSubmit = () => {
    if (!postText.trim()) return;
    if (!user) {
      Alert.alert("Error", "You must be logged in");
      return;
    }
    onSubmit?.();
  };

  return (
    <View style={[styles.container, variant === "comment" && styles.commentContainer]}>
      <View style={styles.inputContainer}>
        {showAvatar && (
          <Image source={{ uri: user?.avatar }} style={styles.avatar} />
        )}
        <TextInput
          style={[
            styles.input,
            { minHeight: inputHeight },
            !showAvatar && { paddingLeft: 15 },
            variant === "comment" && styles.commentInput
          ]}
          placeholder={placeholder || defaultPlaceholder}
          multiline={variant === "post"}
          value={postText}
          onChangeText={setPostText}
          placeholderTextColor="#999"
          maxLength={maxLength}
          editable={!isSubmitting}
        />
        {showSubmitButton && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!postText.trim() || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!postText.trim() || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "..." : "Post"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  commentContainer: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    alignItems: "flex-end",
  },
  inputContainer: {
    position: "relative",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    left: 10,
  },
  input: {
    fontSize: 16,
    flex: 1,
    minHeight: 100,
    textAlignVertical: "top",
    padding: 10,
    paddingLeft: 60, // Add padding to the left to make space for the avatar
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: "#0061FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#A9A9A9",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PostInput;
