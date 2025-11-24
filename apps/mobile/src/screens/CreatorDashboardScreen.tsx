import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { creatorApi } from "../services/api";

export default function CreatorDashboardScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, earningsRes, balanceRes, subscribersRes] = await Promise.all([
        creatorApi.getMyProfile(),
        creatorApi.getMyEarnings(),
        creatorApi.getMyBalance(),
        creatorApi.getMySubscribers(),
      ]);

      setProfile(profileRes.data);
      setEarnings(earningsRes.data);
      setBalance(balanceRes.data);
      setSubscribers(subscribersRes.data || []);
    } catch (error) {
      console.error("Failed to load creator data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = () => {
    // TODO: Show payout request modal
    Alert.alert("Payout", "Payout request feature coming soon");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Creator Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Balance</Text>
        <Text style={styles.balanceAmount}>
          ${Number(balance?.balance?.available || 0).toFixed(2)}
        </Text>
        <Text style={styles.pendingAmount}>
          Pending: ${Number(balance?.balance?.pending || 0).toFixed(2)}
        </Text>
        <TouchableOpacity style={styles.payoutButton} onPress={handleRequestPayout}>
          <Text style={styles.payoutButtonText}>Request Payout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Earnings</Text>
        <Text style={styles.earningsAmount}>
          ${Number(earnings?.totalEarnings || 0).toFixed(2)}
        </Text>
        <Text style={styles.monthlyEarnings}>
          This month: ${Number(earnings?.monthlyEarnings || 0).toFixed(2)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Subscribers</Text>
        <Text style={styles.subscriberCount}>
          {subscribers.length} active subscribers
        </Text>
        <Text style={styles.newSubscribers}>
          New this month: {earnings?.newSubscribersLast30d || 0}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate("Messages")}
      >
        <Text style={styles.actionButtonText}>View Messages</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginBottom: 4,
  },
  pendingAmount: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
  },
  payoutButton: {
    backgroundColor: "#ff6b6b",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  payoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  monthlyEarnings: {
    fontSize: 14,
    color: "#888",
  },
  subscriberCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  newSubscribers: {
    fontSize: 14,
    color: "#888",
  },
  actionButton: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

