import React, { useRef, useState, useEffect } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import NoResults from "@/components/NoResults";
import icons from "@/constants/icons";
import { router } from "expo-router";
import { useAppwrite } from "@/lib/useAppwrite";
import { format } from "date-fns";

const games = [
  {
    id: "1",
    home: "LAL",
    away: "CHA",
    homeName: "Lakers",
    awayName: "Hornets",
    date: "2025-02-20T03:00Z",
    homeIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/lal.png",
    awayIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/cha.png",
    homeOdds: "+200",
    awayOdds: "+150",
  },
  {
    id: "2",
    home: "MIA",
    away: "BOS",
    homeName: "Heat",
    awayName: "Celtics",
    date: "2025-02-20T05:00Z",
    homeIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/mia.png",
    awayIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/bos.png",
    homeOdds: "+200",
    awayOdds: "+150",
  },
  {
    id: "3",
    home: "GSW",
    away: "SAC",
    homeName: "Warriors",
    awayName: "Kings",
    date: "2025-02-20T07:00Z",
    homeIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/gsw.png",
    awayIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/sac.png",
    homeOdds: "+200",
    awayOdds: "+150",
  },
  {
    id: "4",
    home: "LAL",
    away: "CHA",
    homeName: "Lakers",
    awayName: "Hornets",
    date: "2025-02-20T03:00Z",
    homeIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/lal.png",
    awayIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/cha.png",
    homeOdds: "+200",
    awayOdds: "+150",
  },
  {
    id: "5",
    home: "MIA",
    away: "BOS",
    homeName: "Heat",
    awayName: "Celtics",
    date: "2025-02-20T05:00Z",
    homeIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/mia.png",
    awayIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/bos.png",
    homeOdds: "+200",
    awayOdds: "+150",
  },
  {
    id: "6",
    home: "GSW",
    away: "SAC",
    homeName: "Warriors",
    awayName: "Kings",
    date: "2025-02-20T07:00Z",
    homeIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/gsw.png",
    awayIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/sac.png",
    homeOdds: "+200",
    awayOdds: "+150",
  },
  {
    id: "7",
    home: "LAL",
    away: "CHA",
    homeName: "Lakers",
    awayName: "Hornets",
    date: "2025-02-20T03:00Z",
    homeIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/lal.png",
    awayIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/cha.png",
    homeOdds: "+200",
    awayOdds: "+150",
  },
  {
    id: "8",
    home: "MIA",
    away: "BOS",
    homeName: "Heat",
    awayName: "Celtics",
    date: "2025-02-20T05:00Z",
    homeIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/mia.png",
    awayIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/bos.png",
    homeOdds: "+200",
    awayOdds: "+150",
  },
  {
    id: "9",
    home: "GSW",
    away: "SAC",
    homeName: "Warriors",
    awayName: "Kings",
    date: "2025-02-20T07:00Z",
    homeIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/gsw.png",
    awayIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/sac.png",
    homeOdds: "+200",
    awayOdds: "+150",
  },
];

const loading = false;

export default function Bets() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedBet, setSelectedBet] = useState(null);
  const [wager, setWager] = useState("");
  const [potentialWinnings, setPotentialWinnings] = useState(0);

  const initialSnapPoints = ["25%", "50%", "75%", "100%"]; // Added 100% expansion

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        bottomSheetRef.current?.snapToIndex(3); // Expand to 100% when keyboard appears
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        bottomSheetRef.current?.snapToIndex(0); // Collapse back to 25% when keyboard hides
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleBetPress = (bet) => {
    setSelectedBet(bet);
    bottomSheetRef.current?.snapToIndex(3);
  };

  const handleWagerChange = (value) => {
    setWager(value);
    const odds = parseFloat(selectedBet?.odds.replace("+", ""));
    const winnings = (parseFloat(value) * odds) / 100;
    setPotentialWinnings(winnings);
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <GestureHandlerRootView className="flex-1">
        <View className="px-7 mt-5 flex-1">
          <FlatList
            data={games}
            renderItem={({ item }) => {
              const date = new Date(item.date);
              const formattedDate =
                new Intl.DateTimeFormat("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "America/Los_Angeles",
                }).format(date) + " PT";

              return (
                <View className="py-3">
                  <View className="py-5 border-t border-primary-200">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Image
                          source={{ uri: item.awayIcon }}
                          style={{ width: 50, height: 50, marginRight: 10 }}
                        />
                        <Text className="font-rubik-bold text-lg">
                          {item.away} {item.awayName}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#007bff",
                          padding: 10,
                          borderRadius: 5,
                          alignItems: "center",
                          marginLeft: 10,
                        }}
                        onPress={() =>
                          handleBetPress({
                            team: item.awayName,
                            odds: item.awayOdds,
                          })
                        }
                      >
                        <Text className="text-white text-sm text-center font-rubik-bold">
                          {item.awayOdds}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center justify-between mt-3">
                      <View className="flex-row items-center">
                        <Image
                          source={{ uri: item.homeIcon }}
                          style={{ width: 50, height: 50, marginRight: 10 }}
                        />
                        <Text className="font-rubik-bold text-lg">
                          {item.home} {item.homeName}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#007bff",
                          padding: 10,
                          borderRadius: 5,
                          alignItems: "center",
                          marginLeft: 10,
                        }}
                        onPress={() =>
                          handleBetPress({
                            team: item.homeName,
                            odds: item.homeOdds,
                          })
                        }
                      >
                        <Text className="text-white text-sm text-center font-rubik-bold">
                          {item.homeOdds}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text className="text-black-100 text-sm font-rubik">
                    {formattedDate}
                  </Text>
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
            contentContainerClassName="pb-32"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? (
                <ActivityIndicator
                  size="large"
                  className="text-primary-300 mt-5"
                />
              ) : (
                <NoResults />
              )
            }
            ListHeaderComponent={
              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-rubik-bold text-black-300">
                  NBA Games
                </Text>
              </View>
            }
          />
          {/* Bottom Sheet */}
          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={initialSnapPoints}
            index={-1}
          >
            <BottomSheetView style={{ padding: 20 }}>
              <Text className="text-lg font-rubik-bold">Bet Details</Text>
              {selectedBet && (
                <View>
                  <Text className="text-lg font-rubik-bold">
                    Team: {selectedBet.team}
                  </Text>
                  <Text className="text-lg font-rubik-bold">
                    Odds: {selectedBet.odds}
                  </Text>
                  <TextInput
                    style={{
                      borderColor: "#ccc",
                      borderWidth: 1,
                      padding: 10,
                      marginTop: 10,
                      borderRadius: 5,
                    }}
                    placeholder="Enter wager amount"
                    keyboardType="numeric"
                    value={wager}
                    onChangeText={handleWagerChange}
                  />
                  <Text className="text-lg font-rubik-bold">
                    Potential Winnings: ${potentialWinnings.toFixed(2)}
                  </Text>
                </View>
              )}
            </BottomSheetView>
          </BottomSheet>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
