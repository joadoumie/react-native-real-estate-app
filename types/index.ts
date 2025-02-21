export type INewPost = {
  userId: string;
  name: string;
  avatar: string;
  review: string;
  rating: double;
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
  ß;
};
