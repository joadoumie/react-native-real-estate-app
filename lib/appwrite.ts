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
import { INewPost, INewUser } from "@/types";
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
    const userDoc = await getUserByEmail(user.email || "");
    if (!userDoc) {
      // Create user in our DB if it does not exist
      const user = await account.get();
      await createUser({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        balance: 0,
      });
    }

    return true;
  } catch (error) {
    console.error(error);
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

    if (response.$id) {
      const userAvatar = avatar.getInitials(response.name);

      return {
        ...response,
        avatar: userAvatar.toString(),
      };
    }
  } catch (error) {
    console.error(error);
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
    const users = await databases.listDocuments(
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
