// App.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import ChatScreen from "./screens/ChatScreen";

import {
  auth,
  onAuthStateChangedFn,
  loginWithEmail,
  getUsernameForUser,
} from "./firebase";
import type { User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type RootStackParamList = {
  Login: undefined;
  Chat: { name: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [_firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [initialName, setInitialName] = useState<string | null>(null);
  const [initialRoute, setInitialRoute] = useState<"Login" | "Chat">("Login");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. cek di AsyncStorage apakah ada email/password (auto-login)
        const [email, password, username] = await Promise.all([
          AsyncStorage.getItem("lastEmail"),
          AsyncStorage.getItem("lastPassword"),
          AsyncStorage.getItem("lastUsername"),
        ]);

        if (email && password) {
          // coba login ke Firebase
          try {
            const user = await loginWithEmail(email, password);
            setFirebaseUser(user);

            // Ambil username dari Firestore kalau belum ada di AsyncStorage
            let displayName = username;
            if (!displayName) {
              displayName = await getUsernameForUser(user);
              await AsyncStorage.setItem("lastUsername", displayName);
            }

            setInitialName(displayName);
            setInitialRoute("Chat");
          } catch (e) {
            console.warn("Auto-login gagal, fallback ke Login:", e);
            setInitialRoute("Login");
          }
        } else {
          setInitialRoute("Login");
        }

        // 2. Listener perubahan user Firebase (optional)
        const unsub = onAuthStateChangedFn(auth, (u) => {
          setFirebaseUser(u ?? null);
        });

        return () => unsub();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <View style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Login" }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: "Chat Room" }}
          initialParams={{ name: initialName ?? "" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const appStyles = {
  loadingContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};