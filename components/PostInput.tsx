import React from "react";
import { View, TextInput, StyleSheet, Image } from "react-native";
import { useGlobalContext } from "@/lib/global-provider";

const PostInput = ({ postText, setPostText }) => {
  const { user } = useGlobalContext();

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          multiline
          value={postText}
          onChangeText={setPostText}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 10,
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
});

export default PostInput;
