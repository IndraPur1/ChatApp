// screens/ChatScreen.tsx
import React, {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  messagesCollection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  logout,
} from "../firebase";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  launchImageLibrary,
  type ImageLibraryOptions,
} from "react-native-image-picker";

type MessageType = {
  id: string;
  user: string;
  type: "text" | "image";
  text?: string;
  imageBase64?: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

const CHAT_HISTORY_KEY = "chatHistory";

export default function ChatScreen({ route, navigation }: Props) {
  const [displayName, setDisplayName] = useState<string>("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);

  // Inisialisasi nama user (route.params.name atau AsyncStorage)
  useEffect(() => {
    const initName = async () => {
      const fromRoute = route?.params?.name;
      if (fromRoute && fromRoute.trim().length > 0) {
        setDisplayName(fromRoute);
        await AsyncStorage.setItem("lastUsername", fromRoute);
        return;
      }

      const stored = await AsyncStorage.getItem("lastUsername");
      if (stored) {
        setDisplayName(stored);
      } else {
        setDisplayName("Anon");
      }
    };

    initName().catch((e) =>
      console.warn("Gagal inisialisasi nama di ChatScreen", e)
    );
  }, [route?.params?.name]);

  // Logout: bersihkan auth & local storage, kembali ke Login
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      await AsyncStorage.removeItem("lastEmail");
      await AsyncStorage.removeItem("lastPassword");
      await AsyncStorage.removeItem("lastUsername");
      // history chat boleh tetap ada atau dihapus, bebas:
      // await AsyncStorage.removeItem(CHAT_HISTORY_KEY);

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (e: any) {
      console.warn("Gagal logout:", e);
      Alert.alert("Error", e.message ?? String(e));
    }
  }, [navigation]);

  // Tampilkan tombol Logout di header
  const LogoutButton = useCallback(
    () => <Button title="Logout" onPress={handleLogout} />,
    [handleLogout]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chat Room",
      headerRight: LogoutButton,
    });
  }, [navigation, LogoutButton]);

  // Load history dari AsyncStorage sekali di awal
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const json = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
        if (!json) return;
        const stored = JSON.parse(json) as MessageType[];
        setMessages(stored);
      } catch (e) {
        console.warn("Gagal membaca history chat:", e);
      }
    };

    loadHistory();
  }, []);

  // Listener realtime Firestore + update history AsyncStorage
  useEffect(() => {
    const q = query(messagesCollection, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, async (snapshot) => {
      const list: MessageType[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        list.push({
          id: docSnap.id,
          user: data.user,
          type:
            (data.type as "text" | "image") ??
            (data.imageBase64 ? "image" : "text"),
          text: data.text,
          imageBase64: data.imageBase64,
          createdAt: data.createdAt ?? null,
        });
      });
      setMessages(list);
      // simpan ke AsyncStorage sebagai history
      try {
        await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn("Gagal menyimpan history chat:", e);
      }
    });

    return () => unsub();
  }, []);

  // Kirim pesan teks
  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    if (!displayName) {
      Alert.alert("Error", "Nama belum siap, coba lagi sebentar.");
      return;
    }

    try {
      await addDoc(messagesCollection, {
        type: "text",
        text: trimmed,
        user: displayName,
        createdAt: serverTimestamp(),
      });
      setMessage("");
    } catch (e: any) {
      console.warn("Gagal mengirim pesan teks:", e);
      Alert.alert("Error", e.message ?? String(e));
    }
  };

  // Pilih gambar & kirim base64
  const pickImageAndSend = () => {
    if (!displayName) {
      Alert.alert("Error", "Nama belum siap, coba lagi sebentar.");
      return;
    }

    const options: ImageLibraryOptions = {
      mediaType: "photo",
      includeBase64: true,
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.7,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert("Error", response.errorMessage || "Gagal memilih gambar");
        return;
      }

      const asset = response.assets?.[0];
      if (!asset || !asset.base64) {
        Alert.alert("Error", "Data base64 tidak ditemukan");
        return;
      }

      const mime = asset.type ?? "image/jpeg";
      const base64Uri = `data:${mime};base64,${asset.base64}`;

      try {
        await addDoc(messagesCollection, {
          type: "image",
          imageBase64: base64Uri,
          user: displayName,
          createdAt: serverTimestamp(),
        });
      } catch (e: any) {
        console.warn("Gagal mengirim gambar:", e);
        Alert.alert("Error", e.message ?? String(e));
      }
    });
  };

  // Render chat bubble (text / image)
  const renderItem = ({ item }: { item: MessageType }) => {
    const isMe = item.user === displayName;
    const containerStyle = [
      styles.msgBox,
      isMe ? styles.myMsg : styles.otherMsg,
    ];

    if (item.type === "image" && item.imageBase64) {
      return (
        <View style={containerStyle}>
          <Text style={styles.sender}>{item.user}</Text>
          <Image
            source={{ uri: item.imageBase64 }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      );
    }

    return (
      <View style={containerStyle}>
        <Text style={styles.sender}>{item.user}</Text>
        <Text>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImageAndSend}>
          <Text style={styles.imageButtonText}>Img</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Kirim" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 10,
  },
  msgBox: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: "80%",
  },
  myMsg: {
    backgroundColor: "#d1f0ff",
    alignSelf: "flex-end",
  },
  otherMsg: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },
  sender: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 8,
    marginTop: 4,
  },
  imageButton: {
    width: 40,
    height: 40,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  imageButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});