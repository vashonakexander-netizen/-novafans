import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { creatorsApi, subscriptionsApi } from "../services/api";

export default function CreatorProfileScreen({ route, navigation }: any) {
  const { username } = route.params;
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    loadCreator();
  }, [username]);

  const loadCreator = async () => {
    try {
      const response = await creatorsApi.getPublicProfile(username);
      setCreator(response.data);
      // TODO: Check subscription status
    } catch (error) {
      Alert.alert("Error", "Failed to load creator profile");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await subscriptionsApi.subscribe(creator.id, "crypto");
      if (response.data.paymentUrl) {
        // Open payment URL in browser
        Alert.alert("Payment", "Redirecting to payment page...");
        // TODO: Open URL
      } else {
        setIsSubscribed(true);
        Alert.alert("Success", "Subscribed successfully!");
      }
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Subscription failed");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (!creator) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: creator.creatorProfile?.headerImageUrl || "https://via.placeholder.com/400" }}
        style={styles.headerImage}
      />
      <View style={styles.content}>
        <Image
          source={{ uri: creator.creatorProfile?.avatarUrl || "https://via.placeholder.com/100" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{creator.displayName}</Text>
        <Text style={styles.username}>@{creator.username}</Text>
        {creator.creatorProfile?.bio && <Text style={styles.bio}>{creator.creatorProfile.bio}</Text>}

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Subscription Price</Text>
          <Text style={styles.price}>
            ${Number(creator.creatorProfile?.baseSubPrice || 0).toFixed(2)}/month
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, isSubscribed && styles.subscribedButton]}
          onPress={handleSubscribe}
          disabled={isSubscribed}
        >
          <Text style={styles.subscribeButtonText}>
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => navigation.navigate("Messages", { creatorId: creator.id })}
        >
          <Text style={styles.messageButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
  headerImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: -50,
    borderWidth: 4,
    borderColor: "#000",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
  },
  username: {
    fontSize: 16,
    color: "#888",
    marginTop: 4,
  },
  bio: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 16,
    textAlign: "center",
  },
  priceContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6b6b",
  },
  subscribeButton: {
    backgroundColor: "#ff6b6b",
    padding: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 24,
  },
  subscribedButton: {
    backgroundColor: "#333",
  },
  subscribeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  messageButton: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  messageButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

