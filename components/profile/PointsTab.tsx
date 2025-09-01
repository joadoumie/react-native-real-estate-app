import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl } from "react-native";
import React, { useState, useEffect } from "react";
import icons from "@/constants/icons";
import { IPointsTransaction } from "@/types";
import { getPointsHistory } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

interface TransactionCardProps {
  transaction: IPointsTransaction;
}

const TransactionCard = ({ transaction }: TransactionCardProps) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'bet_placed': return icons.calendar;
      case 'bet_won': return icons.star;
      case 'bet_lost': return icons.close;
      case 'bet_refund': return icons.wallet;
      case 'bonus': return icons.plus;
      case 'initial_balance': return icons.wallet;
      default: return icons.wallet;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'bet_placed': return 'text-orange-600 bg-orange-100';
      case 'bet_won': return 'text-green-600 bg-green-100';
      case 'bet_lost': return 'text-red-600 bg-red-100';
      case 'bet_refund': return 'text-blue-600 bg-blue-100';
      case 'bonus': return 'text-purple-600 bg-purple-100';
      case 'initial_balance': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'bet_placed': return 'Bet Placed';
      case 'bet_won': return 'Bet Won';
      case 'bet_lost': return 'Bet Lost';
      case 'bet_refund': return 'Bet Refund';
      case 'bonus': return 'Bonus';
      case 'initial_balance': return 'Initial Balance';
      default: return 'Transaction';
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

  const isPositive = transaction.amount > 0;
  const colorClasses = getTransactionColor(transaction.type);

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm shadow-black/5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-12 h-12 rounded-full items-center justify-center ${colorClasses.split(' ')[1]}`}>
            <Image 
              source={getTransactionIcon(transaction.type)} 
              className={`w-6 h-6 ${colorClasses.split(' ')[0].replace('text-', 'tintColor-')}`} 
            />
          </View>
          
          <View className="ml-3 flex-1">
            <Text className="text-base font-rubik-bold text-gray-900">
              {getTransactionTitle(transaction.type)}
            </Text>
            <Text className="text-sm font-rubik text-gray-500">
              {transaction.$createdAt ? formatDate(transaction.$createdAt) : 'Date not available'}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className={`text-lg font-rubik-bold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{transaction.amount.toLocaleString()}
          </Text>
          <Text className="text-xs font-rubik text-gray-500">points</Text>
        </View>
      </View>
    </View>
  );
};

interface FilterButtonProps {
  title: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}

const FilterButton = ({ title, active, onPress, count }: FilterButtonProps) => (
  <TouchableOpacity
    className={`px-4 py-2 rounded-full mr-3 ${
      active ? 'bg-primary-600' : 'bg-gray-100'
    }`}
    onPress={onPress}
  >
    <Text className={`font-rubik-medium ${
      active ? 'text-white' : 'text-gray-600'
    }`}>
      {title} {count !== undefined ? `(${count})` : ''}
    </Text>
  </TouchableOpacity>
);

export const PointsTab = () => {
  const { user } = useGlobalContext();
  const [transactions, setTransactions] = useState<IPointsTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<IPointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const fetchTransactions = async () => {
    if (!user?.$id) return;
    
    try {
      const history = await getPointsHistory(user.$id, 50);
      setTransactions(history);
      filterTransactions(history, activeFilter);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTransactions = (txns: IPointsTransaction[], filter: string) => {
    if (filter === 'all') {
      setFilteredTransactions(txns);
    } else {
      setFilteredTransactions(txns.filter(txn => txn.type === filter));
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.$id]);

  useEffect(() => {
    filterTransactions(transactions, activeFilter);
  }, [activeFilter, transactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const getFilterCounts = () => {
    return {
      all: transactions.length,
      bet_placed: transactions.filter(t => t.type === 'bet_placed').length,
      bet_won: transactions.filter(t => t.type === 'bet_won').length,
      bonus: transactions.filter(t => t.type === 'bonus').length,
    };
  };

  const counts = getFilterCounts();

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Image source={icons.wallet} className="w-10 h-10 tintColor-gray-400" />
      </View>
      <Text className="text-lg font-rubik-bold text-gray-900 mb-2">
        No Transactions Yet
      </Text>
      <Text className="text-sm font-rubik text-gray-500 text-center px-8">
        Your points activity will appear here once you start placing bets or earning rewards.
      </Text>
    </View>
  );

  const totalEarned = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <View className="flex-1 px-4">
      {/* Summary Cards */}
      <View className="flex-row mb-4">
        <View className="flex-1 bg-green-50 rounded-2xl p-4 mr-2">
          <Text className="text-sm font-rubik text-green-600 mb-1">Total Earned</Text>
          <Text className="text-xl font-rubik-bold text-green-700">
            +{totalEarned.toLocaleString()}
          </Text>
          <Text className="text-xs font-rubik text-green-600">points</Text>
        </View>
        
        <View className="flex-1 bg-red-50 rounded-2xl p-4 ml-2">
          <Text className="text-sm font-rubik text-red-600 mb-1">Total Spent</Text>
          <Text className="text-xl font-rubik-bold text-red-700">
            -{totalSpent.toLocaleString()}
          </Text>
          <Text className="text-xs font-rubik text-red-600">points</Text>
        </View>
      </View>

      {/* Filters */}
      <View className="mb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'all', title: 'All' },
            { key: 'bet_placed', title: 'Bets' },
            { key: 'bet_won', title: 'Wins' },
            { key: 'bonus', title: 'Bonus' },
          ]}
          renderItem={({ item }) => (
            <FilterButton
              title={item.title}
              active={activeFilter === item.key}
              onPress={() => setActiveFilter(item.key)}
              count={counts[item.key as keyof typeof counts]}
            />
          )}
          keyExtractor={(item) => item.key}
        />
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        keyExtractor={(item) => item.$id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};