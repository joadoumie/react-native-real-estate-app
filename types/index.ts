export type INewPost = {
  userId: string;
  name: string;
  avatar: string;
  review: string;
  rating: number;
};

export type INewUser = {
  name: string;
  email: string;
  avatar: string;
  balance: number;
};

export type IUser = {
  name: string;
  email: string;
  avatar: string;
  balance: number;
  username: string;
  rank?: string;
  placedBets: IBet[];
  matchedBets: IBet[];
  transactions: IPointsTransaction[];
};

export type INewComment = {
  postId: string;
  userId: string;
  name: string;
  content: string;
  likes?: number;
};

export type ILike = {
  userId: string;
  itemId: string;
  itemType: "post" | "comment";
  likedAt: string;
};

export type INewLike = {
  userId: string;
  itemId: string;
  itemType: "post" | "comment";
  likedAt: string;
};

export type IBet = {
  $id?: string;
  bettor1Id: string; // User placing the bet
  bettor2Id?: string; // Opponent user (null if betting against house)
  gameId: string; // Game being bet on
  betType: "moneyline";
  bettor1Selection: "home" | "away";
  bettor2Selection?: "home" | "away"; // Opposite of bettor1 (auto-calculated)
  amount: number; // Bet amount (per side)
  bettor1Odds: number; // Odds for bettor1 (from games collection)
  bettor2Odds: number; // Odds for bettor2 (if P2P, includes bonus)
  betMode: "house" | "p2p"; // Against house or peer-to-peer
  status: "open" | "matched" | "active" | "won" | "lost" | "cancelled" | "push";
  matchedAt?: string; // When P2P bet got matched
  resolvedAt?: string;
  winnerId?: string; // ID of winning user (or "house")
  loserId?: string; // ID of losing user (or "house")
  bettor1Payout?: number;
  bettor2Payout?: number;
  $createdAt?: string;
  $updatedAt?: string;
};

export type IPointsTransaction = {
  $id?: string;
  userId: string;
  amount: number;
  type:
    | "bet_placed"
    | "bet_won"
    | "bet_lost"
    | "bet_refund"
    | "bonus"
    | "initial_balance";
  relatedBetId?: string;
  $createdAt?: string;
  $updatedAt?: string;
};

export type IGame = {
  $id: string;
  type: string;
  home: string;
  away: string;
  homeName: string;
  awayName: string;
  date: string;
  homeOdds: number;
  awayOdds: number;
  gameId: string;
  $createdAt?: string;
  $updatedAt?: string;
};

export type UserBalance = {
  totalPoints: number;
  pendingBets: number;
  availablePoints: number;
};
