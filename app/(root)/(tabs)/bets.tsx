import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Text,
  SafeAreaView,
} from "react-native";
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
    date: "2025-02-20T07:00Z",
    homeIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/gsw.png",
    awayIcon: "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/sac.png",
    homeOdds: "+200",
    awayOdds: "+150",
  },
];

const loading = false;

export default function Bets() {
  console.log("Games data:", games);
  console.log("Loading state:", loading);

  return (
    <View className="mt-7 px-4 flex-1">
      <FlatList
        data={games}
        renderItem={({ item }) => {
          const date = new Date(item.date);
          const options = {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "America/Los_Angeles",
          };
          const formattedDate =
            new Intl.DateTimeFormat("en-US", options).format(date) + " PT";

          return (
            <View className="py-3">
              <View className="py-5 border-t border-primary-200">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: item.awayIcon }}
                      style={{ width: 50, height: 50, marginRight: 10 }}
                    />
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                      {item.away}
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
                    onPress={() => console.log(`Bet on ${item.away} to win`)}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
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
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                      {item.home}
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
                    onPress={() => console.log(`Bet on ${item.home} to win`)}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
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
        contentContainerClassName="mt-5 pb-32"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
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
    </View>
  );
}
