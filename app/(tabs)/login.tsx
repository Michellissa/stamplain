import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [personnummer, setPersonnummer] = useState("");
  const [loginType, setLoginType] = useState<"user" | "admin">("user");

  const handleLogin = async () => {
    if (loginType === "admin") {
      if (personnummer !== "0611") {
        Alert.alert("Fel", "Fel kod för admin!");
        return;
      }

      await AsyncStorage.setItem("userRole", "admin");
      router.replace("/admin");
      return;
    }

    if (!personnummer) {
      Alert.alert("Fyll i personnummer!");
      return;
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("personal_number", personnummer)
      .single();

    if (error || !user) {
      Alert.alert(
        "Användare hittades inte",
        "Vill du registrera dig som ny användare?",
        [
          { text: "Avbryt", style: "cancel" },
          {
            text: "Registrera",
            onPress: async () => {
              const { data, error: insertError } = await supabase
                .from("users")
                .insert([{ personal_number: personnummer, role: "employee" }])
                .select()
                .single();

              if (insertError) {
                Alert.alert("Fel vid registrering", insertError.message);
                return;
              }

              await AsyncStorage.setItem("userRole", "employee");
              await AsyncStorage.setItem("userId", data.id.toString());
              router.replace("/");
            },
          },
        ]
      );
      return;
    }

    await AsyncStorage.setItem("userRole", user.role);
    await AsyncStorage.setItem("userId", user.id.toString());
    router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Login</Text>

      <View style={styles.switchContainer}>
        <Button
          mode={loginType === "user" ? "contained" : "outlined"}
          onPress={() => setLoginType("user")}
          style={styles.switchButton}
        >
          Användare
        </Button>

        {/* Admin-knapp visas endast om koden 0611 skrivs in */}
        {personnummer === "0611" && (
          <Button
            mode={loginType === "admin" ? "contained" : "outlined"}
            onPress={() => setLoginType("admin")}
            style={styles.switchButton}
          >
            Admin
          </Button>
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder={loginType === "admin" ? "Adminkod" : "Personnummer"}
        keyboardType={loginType === "admin" ? "default" : "number-pad"}
        value={personnummer}
        onChangeText={setPersonnummer}
        maxLength={12}
        returnKeyType="done"
        blurOnSubmit
      />

      <Button mode="contained" onPress={handleLogin}>
        Logga in
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15 },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  switchButton: { flex: 1, marginHorizontal: 5 },
});
