import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { liveSessionsApi } from "../services/api";
// TODO: Implement LiveKitView when LiveKit is properly configured
// import { LiveKitView } from "@livekit/react-native";

export default function LiveScreen({ navigation }: any) {
  const [sessions, setSessions] = useState<any>({ live: [], upcoming: [] });
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [viewerToken, setViewerToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await liveSessionsApi.getPublicSessions();
      setSessions(response.data);
    } catch (error) {
      console.error("Failed to load live sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (session: any) => {
    try {
      const response = await liveSessionsApi.getViewerToken(session.id);
      setViewerToken(response.data.token);
      setSelectedSession(session);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to join session");
    }
  };

  if (selectedSession && viewerToken) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setSelectedSession(null);
            setViewerToken(null);
          }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        {/* LiveKitView requires proper setup - placeholder for now */}
        <View style={styles.liveView}>
          <Text style={styles.text}>Live Stream</Text>
          <Text style={styles.text}>Room: {selectedSession.liveRoomId || "N/A"}</Text>
          {/* TODO: Implement LiveKitView with proper configuration */}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Shows</Text>

      <Text style={styles.sectionTitle}>Live Now</Text>
      <FlatList
        data={sessions.live}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.sessionCard}
            onPress={() => joinSession(item)}
          >
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>🔴 LIVE</Text>
            </View>
            <Text style={styles.sessionTitle}>{item.title}</Text>
            <Text style={styles.creatorName}>{item.creator?.displayName}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No live sessions at the moment</Text>
        }
      />

      <Text style={styles.sectionTitle}>Upcoming</Text>
      <FlatList
        data={sessions.upcoming}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>{item.title}</Text>
            <Text style={styles.creatorName}>{item.creator?.displayName}</Text>
            <Text style={styles.scheduledTime}>
              {new Date(item.scheduledStartAt).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No upcoming sessions</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  sessionCard: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  liveBadge: {
    backgroundColor: "#ff0000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  liveBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  scheduledTime: {
    fontSize: 12,
    color: "#888",
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    color: "#ff6b6b",
    fontSize: 16,
  },
  liveView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
});

