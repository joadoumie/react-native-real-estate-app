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
