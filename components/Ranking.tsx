import React, { useState, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { Models } from "react-native-appwrite";
import { router } from "expo-router";

interface RankingProps {
  user: IUser;
}

const Ranking = ({ user }: RankingProps) => {
  return (
    <View className="border-t border-primary-200 py-5">
      <View className="flex flex-col items-start">
        <View className="flex flex-row items-center w-full">
          <Text className="text-xl text-black-300 text-start font-rubik-bold">
            {user.rank}
          </Text>
          <Image
            source={{ uri: user.avatar }}
            className="size-14 rounded-full ml-6"
          />
          <Text className="text-base text-black-300 text-start font-rubik-regular ml-4 flex-grow">
            {user.name}
          </Text>
          <Text className="text-xl text-black-300 text-end font-rubik-bold">
            {user.balance}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Ranking;
