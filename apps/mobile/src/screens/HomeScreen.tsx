import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { creatorsApi } from "../services/api";

interface Creator {
  id: string;
  username: string;
  displayName: string;
  creatorProfile?: {
    avatarUrl?: string;
    bio?: string;
    baseSubPrice: number;
  };
}

export default function HomeScreen({ navigation }: any) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      const response = await creatorsApi.list({ limit: 20 });
      setCreators(response.data || []);
    } catch (error) {
      console.error("Failed to load creators:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCreator = ({ item }: { item: Creator }) => (
    <TouchableOpacity
      style={styles.creatorCard}
      onPress={() => navigation.navigate("CreatorProfile", { username: item.username })}
    >
      <Image
        source={{ uri: item.creatorProfile?.avatarUrl || "https://via.placeholder.com/100" }}
        style={styles.avatar}
      />
      <View style={styles.creatorInfo}>
        <Text style={styles.creatorName}>{item.displayName}</Text>
        <Text style={styles.creatorUsername}>@{item.username}</Text>
        {item.creatorProfile?.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {item.creatorProfile.bio}
          </Text>
        )}
        <Text style={styles.price}>
          ${Number(item.creatorProfile?.baseSubPrice || 0).toFixed(2)}/month
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading creators...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover Creators</Text>
      <FlatList
        data={creators}
        renderItem={renderCreator}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadCreators}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  creatorCard: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  creatorUsername: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff6b6b",
  },
});

