# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Environment Variables

This project uses AppWrite (free) for user authentication and basic database solutions. You'll need to ensure that you have all the proper configuration options set up:

```plaintext
# .env.local
EXPO_PUBLIC_APPWRITE_PROJECT_ID={...}
EXPO_PUBLIC_APPWRITE_ENDPOINT={...}
EXPO_PUBLIC_APPWRITE_DATABASE_ID={...}
EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID={...}
EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID={...}
EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID={...}
EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID={...}
EXPO_PUBLIC_APPWRITE_PROFILE_PIC_STORAGE_ID={...}
EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID={...}
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Potential 🐛

- I think it's very possible that the like functionality is technically broken. What I mean by that is that I have this suspicion that it will actually let a user like/unlike a post multiple times (increment endlessly or decrement endlessly) if they find the network call. This is probably not something I need to worry about for now tbh. But maybe this will bite us one day? Hopefully? That means people use this thing... gotta get there first I guess.
