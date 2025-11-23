import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Card, Paragraph, Title } from "react-native-paper";

function StampCard({ log }: { log: any }) {
  return (
    <Card style={{ marginTop: 20 }}>
      <Card.Content>
        <Title>Senaste stämpel: {log.type}</Title>
        <Paragraph>Namn: {log.name}</Paragraph>
        <Paragraph>Personnummer: {log.personnummer}</Paragraph>
        <Paragraph>Datum: {log.date}</Paragraph>
        <Paragraph>Tid: {log.time}</Paragraph>
        <Paragraph>
          Plats: {log.location.street}, {log.location.city}, {log.location.region}
        </Paragraph>
      </Card.Content>
    </Card>
  );
}

export default function IndexScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [personnummer, setPersonnummer] = useState("");
  const [log, setLog] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const savedFirst = await AsyncStorage.getItem("firstName");
      const savedLast = await AsyncStorage.getItem("lastName");
      const savedPn = await AsyncStorage.getItem("personnummer");

      if (savedFirst) setFirstName(savedFirst);
      if (savedLast) setLastName(savedLast);
      if (savedPn) setPersonnummer(savedPn);
    };
    loadUserData();
  }, []);

  const saveUserData = async () => {
    await AsyncStorage.setItem("firstName", firstName);
    await AsyncStorage.setItem("lastName", lastName);
    await AsyncStorage.setItem("personnummer", personnummer);
  };

  const handleStamp = async (type: "IN" | "OUT") => {
    if (!firstName || !lastName || !personnummer) {
      alert("Du måste fylla i alla fält.");
      return;
    }
    

    await saveUserData();

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Platsåtkomst nekad");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const geocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    const address = geocode[0] || {};

    const time = new Date();

    const entry = {
      name: `${firstName} ${lastName}`,
      personnummer,
      type,
      date: time.toLocaleDateString(),
      time: time.toLocaleTimeString(),
      location: {
        street: address.street || "",
        city: address.city || "",
        region: address.region || "",
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    };

    setLog(entry);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>EP-Liggare</Text>

          <TextInput
            style={styles.input}
            placeholder="Förnamn"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Efternamn"
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            placeholder="Personnummer"
            keyboardType="number-pad"
            value={personnummer}
            maxLength={12}
            onChangeText={setPersonnummer}
            returnKeyType="done"
            blurOnSubmit={true}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => handleStamp("IN")}
              style={{ flex: 1, marginRight: 10 }}
            >
              Stämpla IN
            </Button>
            <Button
              mode="contained"
              onPress={() => handleStamp("OUT")}
              style={{ flex: 1, marginLeft: 10 }}
            >
              Stämpla UT
            </Button>
          </View>

          {log && <StampCard log={log} />}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 30,
  },
});
