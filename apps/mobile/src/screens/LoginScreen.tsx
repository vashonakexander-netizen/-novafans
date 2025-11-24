import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { authApi } from "../services/api";
import * as SecureStore from "expo-secure-store";

export default function LoginScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [ageVerified, setAgeVerified] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      const { accessToken, user } = response.data;

      // Store token securely
      await SecureStore.setItemAsync("authToken", accessToken);
      await SecureStore.setItemAsync("userId", user.id);

      navigation.replace("Main");
    } catch (error: any) {
      Alert.alert("Login Failed", error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !username || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!ageVerified) {
      Alert.alert("Error", "You must be 18+ to use this platform");
      return;
    }

    if (!tosAccepted || !privacyAccepted) {
      Alert.alert("Error", "You must accept Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        email,
        username,
        password,
        displayName: displayName || username,
        ageVerified: true,
        tosAccepted: true,
        privacyAccepted: true,
      });

      const { accessToken, user } = response.data;

      // Store token securely
      await SecureStore.setItemAsync("authToken", accessToken);
      await SecureStore.setItemAsync("userId", user.id);

      navigation.replace("Main");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isLogin ? "Login" : "Sign Up"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Display Name (optional)"
            placeholderTextColor="#888"
            value={displayName}
            onChangeText={setDisplayName}
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {!isLogin && (
        <View style={styles.checkboxContainer}>
          <View style={styles.checkboxRow}>
            <Switch value={ageVerified} onValueChange={setAgeVerified} />
            <Text style={styles.checkboxLabel}>I confirm I am 18+ years old</Text>
          </View>

          <View style={styles.checkboxRow}>
            <Switch value={tosAccepted} onValueChange={setTosAccepted} />
            <Text style={styles.checkboxLabel}>
              I accept the{" "}
              <Text style={styles.link} onPress={() => {/* Navigate to terms */}}>
                Terms of Service
              </Text>
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <Switch value={privacyAccepted} onValueChange={setPrivacyAccepted} />
            <Text style={styles.checkboxLabel}>
              I accept the{" "}
              <Text style={styles.link} onPress={() => {/* Navigate to privacy */}}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={isLogin ? handleLogin : handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
        <Text style={styles.switchText}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  checkboxContainer: {
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxLabel: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 14,
  },
  link: {
    color: "#ff6b6b",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#ff6b6b",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchButton: {
    marginTop: 24,
    alignItems: "center",
  },
  switchText: {
    color: "#888",
    fontSize: 14,
  },
});

