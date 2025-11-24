import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  process.env.API_BASE_URL ||
  "http://localhost:3001";

const AI_SERVICE_URL =
  Constants.expoConfig?.extra?.aiServiceUrl ||
  process.env.AI_SERVICE_URL ||
  "http://localhost:3002";

// API Client
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  // Get token from secure storage
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Ignore errors, continue without token
  }
  return config;
});

// AI Service Client
export const aiApi = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API
export const authApi = {
  register: async (data: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
    ageVerified: boolean;
    tosAccepted: boolean;
    privacyAccepted: boolean;
  }) => {
    return api.post("/auth/register", data);
  },

  login: async (email: string, password: string) => {
    return api.post("/auth/login", { email, password });
  },

  getMe: async () => {
    return api.get("/auth/me");
  },
};

// Creators API
export const creatorsApi = {
  getPublicProfile: async (username: string) => {
    return api.get(`/creators/${username}`);
  },

  list: async (params?: { page?: number; limit?: number }) => {
    return api.get("/creators", { params });
  },
};

// Subscriptions API
export const subscriptionsApi = {
  subscribe: async (creatorId: string, method: "card" | "crypto" = "crypto") => {
    if (method === "crypto") {
      return api.post(`/subscriptions/${creatorId}/crypto`);
    }
    return api.post(`/subscriptions/${creatorId}`);
  },

  getMySubscriptions: async () => {
    return api.get("/subscriptions/me");
  },

  cancel: async (creatorId: string) => {
    return api.delete(`/subscriptions/${creatorId}`);
  },
};

// Messages API
export const messagesApi = {
  getConversations: async () => {
    return api.get("/messages/conversations");
  },

  getConversation: async (conversationId: string) => {
    return api.get(`/messages/conversations/${conversationId}`);
  },

  sendMessage: async (conversationId: string, body: string) => {
    return api.post(`/messages/conversations/${conversationId}`, { body });
  },

  sendPaidMessage: async (conversationId: string, data: { body?: string; mediaUrl?: string; price: number }) => {
    return api.post(`/messages/conversations/${conversationId}/send-paid`, data);
  },

  unlockMessage: async (messageId: string) => {
    return api.post(`/messages/${messageId}/unlock`);
  },
};

// Live Sessions API
export const liveSessionsApi = {
  getPublicSessions: async () => {
    return api.get("/live-sessions");
  },

  getSession: async (sessionId: string) => {
    return api.get(`/live-sessions/${sessionId}`);
  },

  getViewerToken: async (sessionId: string) => {
    return api.get(`/live-sessions/${sessionId}/viewer-token`);
  },

  sendTip: async (sessionId: string, amount: number, message?: string) => {
    return api.post(`/live-sessions/${sessionId}/tips`, { amount, message });
  },
};

// Notifications API
export const notificationsApi = {
  registerToken: async (expoPushToken: string) => {
    return api.post("/notifications/register-token", { expoPushToken });
  },
};

// Creator APIs (for creator mode)
export const creatorApi = {
  getMyProfile: async () => {
    return api.get("/creators/me");
  },

  getMySubscribers: async () => {
    return api.get("/creators/me/subscribers");
  },

  getMyEarnings: async () => {
    return api.get("/creators/me/analytics");
  },

  getMyBalance: async () => {
    return api.get("/payouts/me");
  },

  requestPayout: async (data: { amount: number; payoutMethod: string; payoutDetails?: any }) => {
    return api.post("/payouts/request", data);
  },
};

export { API_BASE_URL, AI_SERVICE_URL };

