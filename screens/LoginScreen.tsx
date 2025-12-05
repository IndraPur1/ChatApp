// screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import {
  registerWithEmail,
  loginWithEmail,
  getUsernameForUser,
} from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // dipakai saat register
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !password) {
        Alert.alert("Error", "Email dan password harus diisi");
        return;
      }

      const user = await loginWithEmail(trimmedEmail, password);
      const name = await getUsernameForUser(user);

      // Simpan ke AsyncStorage untuk auto-login berikutnya
      await AsyncStorage.setItem("lastEmail", trimmedEmail);
      await AsyncStorage.setItem("lastPassword", password);
      await AsyncStorage.setItem("lastUsername", name);

      navigation.replace("Chat", { name });
    } catch (e: any) {
      Alert.alert("Login gagal", e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      const trimmedUsername = username.trim();

      if (!trimmedUsername) {
        Alert.alert("Error", "Username tidak boleh kosong");
        return;
      }
      if (!trimmedEmail || !password) {
        Alert.alert("Error", "Email dan password harus diisi");
        return;
      }

      await registerWithEmail(
        trimmedEmail,
        password,
        trimmedUsername
      );

      // Simpan ke AsyncStorage
      await AsyncStorage.setItem("lastEmail", trimmedEmail);
      await AsyncStorage.setItem("lastPassword", password);
      await AsyncStorage.setItem("lastUsername", trimmedUsername);

      navigation.replace("Chat", { name: trimmedUsername });
    } catch (e: any) {
      Alert.alert("Registrasi gagal", e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === "login" ? "Login" : "Register"}
      </Text>

      {mode === "register" && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          editable={!loading}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : mode === "login" ? (
        <Button title="Login" onPress={handleLogin} />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}

      <View style={styles.spacer} />

      <Button
        title={
          mode === "login"
            ? "Belum punya akun? Register"
            : "Sudah punya akun? Login"
        }
        onPress={() =>
          setMode((prev) => (prev === "login" ? "register" : "login"))
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  spacer: {
    height: 16,
  },
  loadingContainer: {
    padding: 10,
    alignItems: "center",
  },
});