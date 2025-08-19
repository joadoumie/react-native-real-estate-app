import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { Models } from "react-native-appwrite";

interface Props {
  item: Models.Document;
  onPress?: () => void;
}

export const FeaturedCard = ({
  item: { image, rating, name, address, price },
  onPress,
}: Props) => {
  const [isHeartFilled, setIsHeartFilled] = React.useState(false);

  const handleHeartPress = () => {
    setIsHeartFilled((prev) => !prev);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-col items-start w-60 h-80 relative"
    >
      <Image source={{ uri: image }} className="size-full rounded-2xl" />
      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      />
      <View className="flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5">
        <Image source={icons.star} className="size-3.5" />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
          {rating}
        </Text>
      </View>
      <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
        <Text className="text-xl font-rubik-bold text-white" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-base font-rubik text-white">{address}</Text>
        <View className="flex flex-row items-center justify-between w-full">
          <Text className="text-xl font-rubik-bold text-white">${price}</Text>
          <TouchableOpacity onPress={handleHeartPress}>
            <Image
              source={isHeartFilled ? icons.heart : icons.bed}
              className="size-5"
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const Card = ({
  item: { rating, name, address },
  onPress,
}: Props) => {
  // Mock NBA game data - later this will come from your API
  const homeTeam = name || "Lakers";
  const awayTeam = address || "Warriors";
  const homeOdds = "+110";
  const awayOdds = "-130";
  const gameTime = "8:00 PM EST";
  const isLive = rating > 4; // Mock live indicator

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-full mt-4 px-4 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
    >
      {/* Live indicator */}
      {isLive && (
        <View className="absolute top-3 right-3 bg-red-500 px-2 py-1 rounded-full">
          <Text className="text-xs text-white font-rubik-bold">LIVE</Text>
        </View>
      )}
      
      {/* Game time */}
      <Text className="text-xs text-black-200 font-rubik text-center mb-3">
        {gameTime}
      </Text>
      
      {/* Teams and odds */}
      <View className="flex flex-row items-center justify-between">
        {/* Away team */}
        <View className="flex flex-col items-center flex-1">
          <Text className="text-base font-rubik-bold text-black-300 mb-2">
            {awayTeam}
          </Text>
          <TouchableOpacity className="bg-primary-100 border border-primary-200 px-4 py-2 rounded-lg min-w-[70px]">
            <Text className="text-sm font-rubik-bold text-primary-300 text-center">
              {awayOdds}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* VS */}
        <View className="mx-4">
          <Text className="text-black-200 font-rubik-bold">VS</Text>
        </View>
        
        {/* Home team */}
        <View className="flex flex-col items-center flex-1">
          <Text className="text-base font-rubik-bold text-black-300 mb-2">
            {homeTeam}
          </Text>
          <TouchableOpacity className="bg-primary-100 border border-primary-200 px-4 py-2 rounded-lg min-w-[70px]">
            <Text className="text-sm font-rubik-bold text-primary-300 text-center">
              {homeOdds}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Additional betting options */}
      <View className="flex flex-row justify-between mt-4 pt-3 border-t border-gray-100">
        <TouchableOpacity className="flex-1 mr-2 bg-accent-100 py-2 rounded-lg">
          <Text className="text-xs text-black-300 font-rubik text-center">
            Over 218.5
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 ml-2 bg-accent-100 py-2 rounded-lg">
          <Text className="text-xs text-black-300 font-rubik text-center">
            Under 218.5
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
