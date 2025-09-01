import {
  Client,
  Account,
  Avatars,
  OAuthProvider,
  Databases,
  Query,
  ID,
  Storage,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import {
  INewPost,
  INewUser,
  IUser,
  INewComment,
  INewLike,
  IBet,
  IPointsTransaction,
  IGame,
  UserBalance,
} from "@/types";
import * as FileSystem from "expo-file-system";
import { getOrdinalSuffix } from "@/lib/helpers";

export const config = {
  platform: "com.betwork.restate",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  galleriesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
  reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
  agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
  propertiesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
  profilePicBucketId: process.env.EXPO_PUBLIC_APPWRITE_PROFILE_PIC_STORAGE_ID,
  usersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
  commentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID,
  likesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_LIKES_COLLECTION_ID,
  gamesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GAMES_COLLECTION_ID,
  betsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BETS_COLLECTION_ID,
  pointsTransactionsCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_POINTS_TRANSACTIONS_COLLECTION_ID,
};

export const client = new Client();

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export async function login() {
  try {
    // First, clear any existing sessions
    try {
      await account.deleteSession("current");
    } catch (e) {
      // Session might not exist, ignore error
    }

    const redirectUri = Linking.createURL("/");
    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );

    if (!response) throw new Error("Failed to login");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );

    if (browserResult.type != "success") throw new Error("Failed to login");

    const url = new URL(browserResult.url);

    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();

    if (!secret || !userId) throw new Error("Failed to login");

    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("Failed to create session");

    const user = await account.get();

    // Check if user is already in our DB
    try {
      const userDoc = await getUserByEmail(user.email || "");
      if (!userDoc) {
        // Create user in our DB if it does not exist
        await createUser({
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          balance: 1000, // Give new users starting balance
        });
      }
    } catch (dbError) {
      console.error("Database error during login:", dbError);
      // Continue login even if DB operation fails
    }

    return true;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

export async function logout() {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function uploadToStorage(
  uri: string,
  permissions: string[] = [],
  fileId: string = ID.unique(),
  name?: string,
  ftype?: string
) {
  const match = /\.(\w+)$/.exec(uri);
  const filename = name ? `${name}.${match[1]}` : uri.split("/").pop();
  const fileIdP = filename.split("_").pop().split(".").shift();
  const type = ftype ? ftype : match ? `image/${match[1]}` : `image`;

  const formData = new FormData();
  formData.append("fileId", fileIdP);
  formData.append("file", {
    uri: uri,
    name: filename,
    type,
  });
  permissions.forEach((p) => {
    formData.append("permissions[]", p);
  });

  const response = await fetch(
    `${config.endpoint}/storage/buckets/${config.profilePicBucketId}/files`,
    {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "multipart/form-data;",
        "X-Appwrite-Project": config.projectId!,
      },
      body: formData,
    }
  );

  return response.json();
}

export async function getCurrentUser() {
  try {
    const response = await account.get();
    console.log("getCurrentUser response:", response);

    if (response.$id) {
      const userAvatar = avatar.getInitials(response.name);

      return {
        ...response,
        avatar: userAvatar.toString(),
      };
    }
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

export async function getLatestProperties() {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [Query.orderAsc("$createdAt"), Query.limit(5)]
    );
    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getProperties({
  filter,
  query,
  limit,
}: {
  filter: string;
  query: string;
  limit?: number;
}) {
  try {
    const buildQuery = [Query.orderDesc("$createdAt")];
    if (filter && filter != "All") {
      buildQuery.push(Query.equal("type", filter));
    }

    if (query) {
      buildQuery.push(
        Query.or([
          Query.search("name", query),
          Query.search("address", query),
          Query.search("type", query),
        ])
      );
    }

    if (limit) {
      buildQuery.push(Query.limit(limit));
    }

    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      buildQuery
    );
    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPropertyById({ id }: { id: string }) {
  try {
    const result = await databases.getDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      id
    );
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getReviews({
  limit,
  cursorAfter,
}: {
  limit?: number;
  cursorAfter?: string;
}) {
  try {
    console.log("Fetching reviews through getReviews()");
    const queries = [Query.orderDesc("$createdAt"), Query.limit(limit || 10)];
    if (cursorAfter) {
      queries.push(Query.cursorAfter(cursorAfter));
    }

    const result = await databases.listDocuments(
      config.databaseId!,
      config.reviewsCollectionId!,
      queries
    );
    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getReviewById({ id }: { id: string }) {
  try {
    console.log("Fetching review through getReviewById()");
    const result = await databases.getDocument(
      config.databaseId!,
      config.reviewsCollectionId!,
      id
    );
    return [result];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createPost(data: INewPost) {
  try {
    const result = await databases.createDocument(
      config.databaseId!,
      config.reviewsCollectionId!,
      ID.unique(),
      data
    );
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateUserPreferences(prefs: Record<string, any>) {
  try {
    const response = await account.updatePrefs(prefs);
    return response;
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    return null;
  }
}

export async function updateUserProfilePhoto(uri: string) {
  try {
    // Find the user by the logged in email
    const user = await account.get();
    const userDoc = await getUserByEmail(user.email || "");
    if (!userDoc) {
      console.error("User not found");
      throw new Error("User not found");
    }

    const result = await databases.updateDocument(
      config.databaseId!,
      config.usersCollectionId!,
      userDoc.$id,
      { avatar: uri }
    );

    return result;
  } catch (error) {
    console.error("Failed to update user profile photo:", error);
    return null;
  }
}

export async function createUser(data: INewUser) {
  try {
    const result = await databases.createDocument(
      config.databaseId!,
      config.usersCollectionId!,
      ID.unique(),
      data
    );
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.usersCollectionId!,
      [Query.equal("email", email)]
    );

    if (result.documents.length === 0) {
      console.log("User not found");
      return null;
    }

    return result.documents[0];
  } catch (error) {
    console.error("Failed to get user by accountId:", error);
    throw error;
  }
}

export async function getUserProfilePic(user) {
  try {
    console.log("GET USER PROFILE PIC WORKING");
    console.log(user);
    console.log(user.email);
    const userDoc = await getUserByEmail(user.email);
    if (!userDoc) {
      console.error("User not found");
      return null;
    }

    console.log(userDoc["avatar"]);
    return userDoc["avatar"];
  } catch (error) {
    console.error("Failed to get user profile picture:", error);
    return null;
  }
}

export async function getSortedUsersByBalance(userEmail?: string): Promise<{
  leaderboard: IUser[];
  userRank?: string;
  userBalance?: number;
}> {
  try {
    const users = await databases.listDocuments<IUser>(
      config.databaseId!,
      config.usersCollectionId!,
      [Query.orderDesc("balance")]
    );

    const sortedUsers = users.documents;

    let ranks = [];
    let rank = 1;
    let previousBalance = null;
    let tieCount = 0;
    let userRank: string | undefined;
    let userBalance: number | undefined;

    for (let i = 0; i < sortedUsers.length; i++) {
      const currentUser = sortedUsers[i];
      if (currentUser.balance === previousBalance) {
        tieCount += 1;
      } else {
        rank += tieCount;
        tieCount = 1;
      }

      previousBalance = currentUser.balance;
      const computedRank = `${rank}${getOrdinalSuffix(rank)}`;

      ranks.push({
        ...currentUser,
        rank: computedRank,
      });

      if (currentUser.email === userEmail) {
        userRank = computedRank;
        userBalance = currentUser.balance;
      }
    }

    return { leaderboard: ranks, userRank, userBalance };
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Comment Functions
export async function createComment(data: INewComment) {
  try {
    const result = await databases.createDocument(
      config.databaseId!,
      config.commentsCollectionId!,
      ID.unique(),
      data
    );

    // Increment comment count on the post
    await incrementCommentCount(data.postId);

    return result;
  } catch (error) {
    console.error("Failed to create comment:", error);
    return null;
  }
}

export async function getCommentsByPostId({
  postId,
  limit = 10,
  cursorAfter,
}: {
  postId: string;
  limit?: number;
  cursorAfter?: string;
}) {
  try {
    const queries = [
      Query.equal("postId", postId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (cursorAfter) {
      queries.push(Query.cursorAfter(cursorAfter));
    }

    const result = await databases.listDocuments(
      config.databaseId!,
      config.commentsCollectionId!,
      queries
    );

    return result.documents;
  } catch (error) {
    console.error("Failed to get comments:", error);
    return [];
  }
}

async function incrementCommentCount(postId: string) {
  try {
    // Get current post to read current comment count
    const post = await databases.getDocument(
      config.databaseId!,
      config.reviewsCollectionId!,
      postId
    );

    // Increment the count
    await databases.updateDocument(
      config.databaseId!,
      config.reviewsCollectionId!,
      postId,
      {
        commentCount: (post.commentCount || 0) + 1,
      }
    );
  } catch (error) {
    console.error("Failed to increment comment count:", error);
  }
}

export async function deleteComment(commentId: string, postId: string) {
  try {
    await databases.deleteDocument(
      config.databaseId!,
      config.commentsCollectionId!,
      commentId
    );

    // Decrement comment count
    await decrementCommentCount(postId);

    return true;
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return false;
  }
}

async function decrementCommentCount(postId: string) {
  try {
    const post = await databases.getDocument(
      config.databaseId!,
      config.reviewsCollectionId!,
      postId
    );

    await databases.updateDocument(
      config.databaseId!,
      config.reviewsCollectionId!,
      postId,
      {
        commentCount: Math.max((post.commentCount || 0) - 1, 0),
      }
    );
  } catch (error) {
    console.error("Failed to decrement comment count:", error);
  }
}

// ===== NEW SCALABLE LIKES SYSTEM =====

export async function toggleLike(
  userId: string,
  itemId: string,
  itemType: "post" | "comment"
) {
  try {
    if (!userId) {
      throw new Error("userId is required but not provided");
    }
    const existingLike = await checkUserLike(userId, itemId);

    if (existingLike) {
      await databases.deleteDocument(
        config.databaseId!,
        config.likesCollectionId!,
        existingLike.$id
      );

      // Do NOT update the item from the client when using event-driven counters
      // await updateItemLikeCount(itemId, itemType, -1); // removed

      return { liked: false, action: "unliked" };
    } else {
      const newLike: INewLike = {
        userId,
        itemId,
        itemType,
        likedAt: new Date().toISOString(),
      };

      await databases.createDocument(
        config.databaseId!,
        config.likesCollectionId!,
        ID.unique(),
        newLike
      );

      // Do NOT update the item from the client when using event-driven counters
      // await updateItemLikeCount(itemId, itemType, 1); // removed

      return { liked: true, action: "liked" };
    }
  } catch (error) {
    console.error("Failed to toggle like:", error);
    throw error;
  }
}

export async function checkUserLike(userId: string, itemId: string) {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.likesCollectionId!,
      [
        Query.equal("userId", userId),
        Query.equal("itemId", itemId),
        Query.limit(1),
      ]
    );

    return result.documents.length > 0 ? result.documents[0] : null;
  } catch (error) {
    console.error("Failed to check user like:", error);
    return null;
  }
}

export async function getUserLikeStatus(userId: string, itemIds: string[]) {
  try {
    if (itemIds.length === 0) return {};

    const result = await databases.listDocuments(
      config.databaseId!,
      config.likesCollectionId!,
      [
        Query.equal("userId", userId),
        Query.equal("itemId", itemIds),
        Query.limit(itemIds.length),
      ]
    );

    // Convert to lookup object
    const likeStatus: Record<string, boolean> = {};
    result.documents.forEach((like) => {
      likeStatus[like.itemId] = true;
    });

    return likeStatus;
  } catch (error) {
    console.error("Failed to get user like status:", error);
    return {};
  }
}

async function updateItemLikeCount(
  itemId: string,
  itemType: "post" | "comment",
  increment: number
) {
  try {
    const collectionId =
      itemType === "post"
        ? config.reviewsCollectionId!
        : config.commentsCollectionId!;

    // Get current item
    const item = await databases.getDocument(
      config.databaseId!,
      collectionId,
      itemId
    );

    // Update like count
    const newCount = Math.max(0, (item.likes || 0) + increment);
    const updateData: any = {
      likes: newCount,
    };

    // If updating a post, always include commentCount to satisfy required field
    if (itemType === "post") {
      updateData.commentCount = item.commentCount || 0;
    }

    await databases.updateDocument(
      config.databaseId!,
      collectionId,
      itemId,
      updateData
    );

    return newCount;
  } catch (error) {
    console.error("Failed to update item like count:", error);
    throw error;
  }
}

// ===== BETTING SYSTEM FUNCTIONS =====

// Points Management Functions
export async function getUserBalance(userIdOrEmail: string): Promise<UserBalance> {
  try {
    // First try to get user by document ID, if that fails, try by email
    let user;
    try {
      user = await databases.getDocument(
        config.databaseId!,
        config.usersCollectionId!,
        userIdOrEmail
      );
    } catch (error) {
      // If direct lookup fails, try to find by email (in case we got account ID instead of document ID)
      const currentAccount = await account.get();
      const userDoc = await getUserByEmail(currentAccount.email);
      if (!userDoc) {
        throw new Error("User not found in database");
      }
      user = userDoc;
    }

    // Calculate pending bets amount - use user's document ID
    const activeBets = await databases.listDocuments(
      config.databaseId!,
      config.betsCollectionId!,
      [
        Query.equal("bettor1Id", user.$id),
        Query.equal("status", ["open", "matched", "active"]),
      ]
    );

    const pendingBets = activeBets.documents.reduce((total, bet) => {
      return total + bet.amount;
    }, 0);

    return {
      totalPoints: user.balance || 0,
      pendingBets,
      availablePoints: (user.balance || 0) - pendingBets,
    };
  } catch (error) {
    console.error("Failed to get user balance:", error);
    return {
      totalPoints: 0,
      pendingBets: 0,
      availablePoints: 0,
    };
  }
}

export async function createPointsTransaction(transaction: IPointsTransaction) {
  try {
    const result = await databases.createDocument(
      config.databaseId!,
      config.pointsTransactionsCollectionId!,
      ID.unique(),
      transaction
    );
    return result;
  } catch (error) {
    console.error("Failed to create points transaction:", error);
    return null;
  }
}

export async function getPointsHistory(
  userId: string,
  limit: number = 20,
  cursorAfter?: string
) {
  try {
    const queries = [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (cursorAfter) {
      queries.push(Query.cursorAfter(cursorAfter));
    }

    const result = await databases.listDocuments(
      config.databaseId!,
      config.pointsTransactionsCollectionId!,
      queries
    );

    return result.documents;
  } catch (error) {
    console.error("Failed to get points history:", error);
    return [];
  }
}

// Betting Functions
export async function placeBet(betData: IBet) {
  try {
    // Get game data for odds
    const game = await databases.getDocument(
      config.databaseId!,
      config.gamesCollectionId!,
      betData.gameId
    );

    if (!game) {
      throw new Error("Game not found");
    }

    // Check user balance
    const userBalance = await getUserBalance(betData.bettor1Id);
    if (userBalance.availablePoints < betData.amount) {
      throw new Error("Insufficient balance");
    }

    // Set odds based on selection and bet mode
    const odds =
      betData.bettor1Selection === "home" ? game.homeOdds : game.awayOdds;

    const bet: IBet = {
      ...betData,
      bettor1Odds: odds,
      status: betData.betMode === "house" ? "active" : "open",
    };

    // If P2P bet, set opposite selection for bettor2
    if (betData.betMode === "p2p") {
      bet.bettor2Selection =
        betData.bettor1Selection === "home" ? "away" : "home";
      bet.bettor2Odds =
        betData.bettor1Selection === "home" ? game.awayOdds : game.homeOdds;
    }

    // Create bet record
    const result = await databases.createDocument(
      config.databaseId!,
      config.betsCollectionId!,
      ID.unique(),
      bet
    );

    // Create points transaction (deduct bet amount)
    await createPointsTransaction({
      userId: betData.bettor1Id,
      amount: -betData.amount,
      type: "bet_placed",
      relatedBetId: result.$id,
    });

    // Update user balance
    const currentUser = await databases.getDocument(
      config.databaseId!,
      config.usersCollectionId!,
      betData.bettor1Id
    );

    await databases.updateDocument(
      config.databaseId!,
      config.usersCollectionId!,
      betData.bettor1Id,
      {
        balance: currentUser.balance - betData.amount,
      }
    );

    return result;
  } catch (error) {
    console.error("Failed to place bet:", error);
    throw error;
  }
}

export async function getUserBets(
  userId: string,
  limit: number = 20,
  cursorAfter?: string
) {
  try {
    const queries = [
      Query.or([
        Query.equal("bettor1Id", userId),
        Query.equal("bettor2Id", userId),
      ]),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (cursorAfter) {
      queries.push(Query.cursorAfter(cursorAfter));
    }

    const result = await databases.listDocuments(
      config.databaseId!,
      config.betsCollectionId!,
      queries
    );

    return result.documents;
  } catch (error) {
    console.error("Failed to get user bets:", error);
    return [];
  }
}

export async function getActiveBets(userId: string) {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.betsCollectionId!,
      [
        Query.or([
          Query.equal("bettor1Id", userId),
          Query.equal("bettor2Id", userId),
        ]),
        Query.equal("status", ["open", "matched", "active"]),
        Query.orderDesc("$createdAt"),
      ]
    );

    return result.documents;
  } catch (error) {
    console.error("Failed to get active bets:", error);
    return [];
  }
}

export function calculatePayout(amount: number, odds: number): number {
  // Odds calculation: if odds are positive, payout = amount * (odds/100) + amount
  // if odds are negative, payout = amount * (100/Math.abs(odds)) + amount
  if (odds > 0) {
    return amount * (odds / 100) + amount;
  } else {
    return amount * (100 / Math.abs(odds)) + amount;
  }
}

// Mock settlement function for testing
export async function settleBet(betId: string, gameWinner: "home" | "away") {
  try {
    const bet = await databases.getDocument(
      config.databaseId!,
      config.betsCollectionId!,
      betId
    );

    if (!bet || bet.status !== "active") {
      throw new Error("Bet not found or not active");
    }

    let winnerId: string | undefined;
    let loserId: string | undefined;
    let bettor1Won = false;
    let bettor2Won = false;

    // Determine winner
    if (bet.bettor1Selection === gameWinner) {
      winnerId = bet.bettor1Id;
      bettor1Won = true;
      if (bet.betMode === "p2p" && bet.bettor2Id) {
        loserId = bet.bettor2Id;
      } else {
        loserId = "house";
      }
    } else if (
      bet.betMode === "p2p" &&
      bet.bettor2Id &&
      bet.bettor2Selection === gameWinner
    ) {
      winnerId = bet.bettor2Id;
      bettor2Won = true;
      loserId = bet.bettor1Id;
    } else {
      // House wins
      winnerId = "house";
      loserId = bet.bettor1Id;
      if (bet.betMode === "p2p" && bet.bettor2Id) {
        loserId = bet.bettor1Id; // Could be either, depends on selections
      }
    }

    // Calculate payouts
    const bettor1Payout = bettor1Won
      ? calculatePayout(bet.amount, bet.bettor1Odds)
      : 0;
    const bettor2Payout =
      bettor2Won && bet.bettor2Odds
        ? calculatePayout(bet.amount, bet.bettor2Odds)
        : 0;

    // Update bet record
    await databases.updateDocument(
      config.databaseId!,
      config.betsCollectionId!,
      betId,
      {
        status: "won",
        resolvedAt: new Date().toISOString(),
        winnerId,
        loserId,
        bettor1Payout,
        bettor2Payout,
      }
    );

    // Process payouts and create transactions
    if (bettor1Won && bettor1Payout > 0) {
      await createPointsTransaction({
        userId: bet.bettor1Id,
        amount: bettor1Payout,
        type: "bet_won",
        relatedBetId: betId,
      });

      // Update user balance
      const user = await databases.getDocument(
        config.databaseId!,
        config.usersCollectionId!,
        bet.bettor1Id
      );

      await databases.updateDocument(
        config.databaseId!,
        config.usersCollectionId!,
        bet.bettor1Id,
        {
          balance: user.balance + bettor1Payout,
        }
      );
    }

    if (bettor2Won && bettor2Payout > 0 && bet.bettor2Id) {
      await createPointsTransaction({
        userId: bet.bettor2Id,
        amount: bettor2Payout,
        type: "bet_won",
        relatedBetId: betId,
      });

      // Update user balance
      const user = await databases.getDocument(
        config.databaseId!,
        config.usersCollectionId!,
        bet.bettor2Id
      );

      await databases.updateDocument(
        config.databaseId!,
        config.usersCollectionId!,
        bet.bettor2Id,
        {
          balance: user.balance + bettor2Payout,
        }
      );
    }

    return true;
  } catch (error) {
    console.error("Failed to settle bet:", error);
    return false;
  }
}

// Additional utility functions for games
export async function getGames(limit: number = 10) {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.gamesCollectionId!,
      [Query.orderDesc("date"), Query.limit(limit)]
    );
    return result.documents;
  } catch (error) {
    console.error("Failed to get games:", error);
    return [];
  }
}

export async function getGameById(gameId: string) {
  try {
    const result = await databases.getDocument(
      config.databaseId!,
      config.gamesCollectionId!,
      gameId
    );
    return result;
  } catch (error) {
    console.error("Failed to get game:", error);
    return null;
  }
}

// Get open P2P bets that users can join
export async function getOpenP2PBets(
  excludeUserId?: string,
  limit: number = 20
) {
  try {
    const queries = [
      Query.equal("betMode", "p2p"),
      Query.equal("status", "open"),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (excludeUserId) {
      queries.push(Query.notEqual("bettor1Id", excludeUserId));
    }

    const result = await databases.listDocuments(
      config.databaseId!,
      config.betsCollectionId!,
      queries
    );

    return result.documents;
  } catch (error) {
    console.error("Failed to get open P2P bets:", error);
    return [];
  }
}

// Join an open P2P bet
export async function joinP2PBet(betId: string, userId: string) {
  try {
    const bet = await databases.getDocument(
      config.databaseId!,
      config.betsCollectionId!,
      betId
    );

    if (!bet || bet.status !== "open" || bet.betMode !== "p2p") {
      throw new Error("Invalid bet or bet not available");
    }

    // Check user balance
    const userBalance = await getUserBalance(userId);
    if (userBalance.availablePoints < bet.amount) {
      throw new Error("Insufficient balance");
    }

    // Update bet with second player
    await databases.updateDocument(
      config.databaseId!,
      config.betsCollectionId!,
      betId,
      {
        bettor2Id: userId,
        status: "matched",
        matchedAt: new Date().toISOString(),
      }
    );

    // Create transaction for bettor2
    await createPointsTransaction({
      userId,
      amount: -bet.amount,
      type: "bet_placed",
      relatedBetId: betId,
    });

    // Update bettor2 balance
    const currentUser = await databases.getDocument(
      config.databaseId!,
      config.usersCollectionId!,
      userId
    );

    await databases.updateDocument(
      config.databaseId!,
      config.usersCollectionId!,
      userId,
      {
        balance: currentUser.balance - bet.amount,
      }
    );

    return true;
  } catch (error) {
    console.error("Failed to join P2P bet:", error);
    throw error;
  }
}
