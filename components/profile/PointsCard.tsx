import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import icons from "@/constants/icons";
import { UserBalance } from "@/types";

interface PointsCardProps {
  balance: UserBalance;
  activeBetsCount?: number;
  onViewDetails?: () => void;
}

interface StatItemProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: any;
}

const StatItem = ({ title, value, subtitle, color = "text-gray-900", icon }: StatItemProps) => (
  <View className="flex-1 items-center">
    {icon && (
      <View className="w-12 h-12 bg-primary-50 rounded-full items-center justify-center mb-2">
        <Image source={icon} className="w-6 h-6 tintColor-primary-600" />
      </View>
    )}
    <Text className="text-sm font-rubik text-gray-500 mb-1">{title}</Text>
    <Text className={`text-xl font-rubik-bold ${color} mb-1`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Text>
    {subtitle && (
      <Text className="text-xs font-rubik text-gray-400">{subtitle}</Text>
    )}
  </View>
);

export const PointsCard = ({ 
  balance, 
  activeBetsCount = 0,
  onViewDetails 
}: PointsCardProps) => {
  const winRate = 0; // TODO: Calculate from betting history

  return (
    <View className="mx-4 mb-6">
      {/* Quick Stats Row */}
      <View className="flex-row mb-4">
        <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm shadow-black/5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-rubik text-gray-500 mb-1">Available</Text>
              <Text className="text-2xl font-rubik-bold text-green-600">
                {balance.availablePoints.toLocaleString()}
              </Text>
              <Text className="text-xs font-rubik text-gray-400">pts</Text>
            </View>
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
              <Image source={icons.wallet} className="w-5 h-5 tintColor-green-600" />
            </View>
          </View>
        </View>

        <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm shadow-black/5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-rubik text-gray-500 mb-1">In Bets</Text>
              <Text className="text-2xl font-rubik-bold text-orange-600">
                {balance.pendingBets.toLocaleString()}
              </Text>
              <Text className="text-xs font-rubik text-gray-400">pts</Text>
            </View>
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
              <Image source={icons.calendar} className="w-5 h-5 tintColor-orange-600" />
            </View>
          </View>
        </View>
      </View>

      {/* Detailed Stats Card */}
      <View className="bg-white rounded-2xl p-6 shadow-sm shadow-black/5">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-lg font-rubik-bold text-gray-900">Statistics</Text>
          <TouchableOpacity 
            onPress={onViewDetails}
            className="flex-row items-center"
          >
            <Text className="text-sm font-rubik text-primary-600 mr-1">View All</Text>
            <Image source={icons.rightArrow} className="w-4 h-4 tintColor-primary-600" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between">
          <StatItem
            title="Active Bets"
            value={activeBetsCount}
            subtitle="ongoing"
            color="text-blue-600"
            icon={icons.calendar}
          />
          
          <View className="w-px bg-gray-200 mx-4" />
          
          <StatItem
            title="Win Rate"
            value={`${winRate}%`}
            subtitle="last 30 days"
            color="text-green-600"
            icon={icons.star}
          />
          
          <View className="w-px bg-gray-200 mx-4" />
          
          <StatItem
            title="Total Balance"
            value={balance.totalPoints}
            subtitle="points"
            color="text-purple-600"
            icon={icons.wallet}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row mt-4">
        <TouchableOpacity className="flex-1 bg-primary-600 rounded-2xl p-4 mr-2 items-center">
          <Image source={icons.plus} className="w-6 h-6 tintColor-white mb-2" />
          <Text className="text-sm font-rubik-bold text-white">Add Funds</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 bg-gray-100 rounded-2xl p-4 ml-2 items-center">
          <Image source={icons.calendar} className="w-6 h-6 tintColor-gray-600 mb-2" />
          <Text className="text-sm font-rubik-bold text-gray-700">Place Bet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};