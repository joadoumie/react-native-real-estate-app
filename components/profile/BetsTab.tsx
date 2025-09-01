import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl } from "react-native";
import React, { useState, useEffect } from "react";
import icons from "@/constants/icons";
import { IBet, IGame } from "@/types";
import { getActiveBets, getUserBets, getGameById } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

interface BetCardProps {
  bet: IBet;
  game?: IGame;
}

const BetCard = ({ bet, game }: BetCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'open': return 'bg-yellow-100 text-yellow-700';
      case 'matched': return 'bg-purple-100 text-purple-700';
      case 'won': return 'bg-green-100 text-green-700';
      case 'lost': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won': return icons.star;
      case 'lost': return icons.close;
      case 'active': return icons.calendar;
      default: return icons.calendar;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const potentialWin = bet.bettor1Payout || (bet.amount * (bet.bettor1Odds > 0 ? (bet.bettor1Odds / 100) + 1 : (100 / Math.abs(bet.bettor1Odds)) + 1));

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm shadow-black/5">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className={`px-3 py-1 rounded-full ${getStatusColor(bet.status)}`}>
            <Text className={`text-xs font-rubik-medium ${getStatusColor(bet.status).split(' ')[1]}`}>
              {bet.status.toUpperCase()}
            </Text>
          </View>
          {bet.betMode === 'p2p' && (
            <View className="ml-2 px-2 py-1 bg-primary-100 rounded-full">
              <Text className="text-xs font-rubik-medium text-primary-700">P2P</Text>
            </View>
          )}
        </View>
        <Image source={getStatusIcon(bet.status)} className="w-5 h-5 tintColor-gray-400" />
      </View>

      {/* Game Info */}
      <View className="mb-3">
        <Text className="text-lg font-rubik-bold text-gray-900 mb-1">
          {game ? `${game.homeName} vs ${game.awayName}` : 'Game Loading...'}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-sm font-rubik text-gray-600">
            Pick: {bet.bettor1Selection === 'home' ? (game?.homeName || 'Home') : (game?.awayName || 'Away')}
          </Text>
          <Text className="text-sm font-rubik text-gray-400 ml-2">
            • {bet.bettor1Odds > 0 ? '+' : ''}{bet.bettor1Odds}
          </Text>
        </View>
      </View>

      {/* Bet Details */}
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <View>
          <Text className="text-xs font-rubik text-gray-500 mb-1">Amount</Text>
          <Text className="text-base font-rubik-bold text-gray-900">
            {bet.amount.toLocaleString()} pts
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-xs font-rubik text-gray-500 mb-1">Potential Win</Text>
          <Text className="text-base font-rubik-bold text-green-600">
            +{Math.round(potentialWin - bet.amount).toLocaleString()} pts
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs font-rubik text-gray-500 mb-1">
            {bet.$createdAt ? 'Placed' : 'Date'}
          </Text>
          <Text className="text-sm font-rubik text-gray-700">
            {bet.$createdAt ? formatDate(bet.$createdAt) : 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const BetsTab = () => {
  const { user } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [activeBets, setActiveBets] = useState<IBet[]>([]);
  const [betHistory, setBetHistory] = useState<IBet[]>([]);
  const [games, setGames] = useState<{ [key: string]: IGame }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBets = async () => {
    if (!user?.$id) return;
    
    try {
      const [active, history] = await Promise.all([
        getActiveBets(user.$id),
        getUserBets(user.$id, 20)
      ]);

      setActiveBets(active);
      setBetHistory(history.filter(bet => !['open', 'matched', 'active'].includes(bet.status)));

      // Fetch game details for all bets
      const gameIds = [...new Set([...active, ...history].map(bet => bet.gameId))];
      const gamePromises = gameIds.map(id => getGameById(id));
      const gameResults = await Promise.all(gamePromises);
      
      const gamesMap: { [key: string]: IGame } = {};
      gameResults.forEach((game, index) => {
        if (game) gamesMap[gameIds[index]] = game;
      });
      setGames(gamesMap);

    } catch (error) {
      console.error('Failed to fetch bets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, [user?.$id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBets();
  };

  const currentData = activeTab === 'active' ? activeBets : betHistory;

  const EmptyState = ({ type }: { type: 'active' | 'history' }) => (
    <View className="flex-1 items-center justify-center py-12">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Image source={icons.calendar} className="w-10 h-10 tintColor-gray-400" />
      </View>
      <Text className="text-lg font-rubik-bold text-gray-900 mb-2">
        No {type === 'active' ? 'Active' : 'Past'} Bets
      </Text>
      <Text className="text-sm font-rubik text-gray-500 text-center px-8">
        {type === 'active' 
          ? 'You don\'t have any active bets right now. Place your first bet!'
          : 'Your betting history will appear here once you place some bets.'
        }
      </Text>
      {type === 'active' && (
        <TouchableOpacity className="mt-6 bg-primary-600 px-6 py-3 rounded-full">
          <Text className="text-white font-rubik-medium">Place First Bet</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 px-4">
      {/* Tab Switcher */}
      <View className="bg-gray-100 rounded-2xl p-2 mb-4">
        <View className="flex-row">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ${
              activeTab === 'active' ? 'bg-white shadow-sm' : ''
            }`}
            onPress={() => setActiveTab('active')}
          >
            <Text className={`text-center font-rubik-medium ${
              activeTab === 'active' ? 'text-primary-600' : 'text-gray-500'
            }`}>
              Active ({activeBets.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ${
              activeTab === 'history' ? 'bg-white shadow-sm' : ''
            }`}
            onPress={() => setActiveTab('history')}
          >
            <Text className={`text-center font-rubik-medium ${
              activeTab === 'history' ? 'text-primary-600' : 'text-gray-500'
            }`}>
              History ({betHistory.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bets List */}
      <FlatList
        data={currentData}
        renderItem={({ item }) => (
          <BetCard bet={item} game={games[item.gameId]} />
        )}
        keyExtractor={(item) => item.$id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<EmptyState type={activeTab} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};