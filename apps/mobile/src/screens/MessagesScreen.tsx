import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Image } from "react-native";
import { messagesApi } from "../services/api";

export default function MessagesScreen({ navigation, route }: any) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await messagesApi.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await messagesApi.getConversation(conversationId);
      setMessages(response.data.messages || []);
      setSelectedConversation(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load messages");
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      await messagesApi.sendMessage(selectedConversation.id, messageText);
      setMessageText("");
      loadMessages(selectedConversation.id);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const unlockMessage = async (messageId: string) => {
    try {
      await messagesApi.unlockMessage(messageId);
      if (selectedConversation) {
        loadMessages(selectedConversation.id);
      }
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to unlock message");
    }
  };

  if (selectedConversation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedConversation(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.senderType === "FAN" ? styles.myMessage : styles.theirMessage,
              ]}
            >
              {item.isLocked && item.senderType === "CREATOR" ? (
                <View style={styles.lockedMessage}>
                  <Text style={styles.lockedText}>🔒 Locked Message</Text>
                  <Text style={styles.priceText}>Unlock for ${Number(item.price || 0).toFixed(2)}</Text>
                  <TouchableOpacity
                    style={styles.unlockButton}
                    onPress={() => unlockMessage(item.id)}
                  >
                    <Text style={styles.unlockButtonText}>Unlock</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.messageText}>{item.body}</Text>
                  {item.mediaUrl && (
                    <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} />
                  )}
                </>
              )}
            </View>
          )}
          style={styles.messagesList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!messageText.trim() || loading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!messageText.trim() || loading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => loadMessages(item.id)}
          >
            <Text style={styles.conversationName}>
              {item.creator?.displayName || item.fan?.displayName}
            </Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.body || "No messages yet"}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    color: "#ff6b6b",
    fontSize: 16,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    padding: 16,
  },
  conversationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  conversationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#888",
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#ff6b6b",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#1a1a1a",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  lockedMessage: {
    alignItems: "center",
  },
  lockedText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  priceText: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  unlockButton: {
    backgroundColor: "#ff6b6b",
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  unlockButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
});

