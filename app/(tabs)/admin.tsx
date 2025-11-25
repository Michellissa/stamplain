import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Card, Paragraph, Title } from "react-native-paper";
import { supabase } from "../../lib/supabase";

interface Stamp {
  id: number;
  user_id: string;
  type: "IN" | "OUT";
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  created_at: string;
  users?: { name: string; personal_number: string };
}

export default function AdminScreen() {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const role = await AsyncStorage.getItem("userRole");
      if (role !== "admin") {
        Alert.alert("Otillåtet", "Du har inte behörighet att se admin-sidan");
        router.replace("/"); // redirect to home
      }
    };
    checkAdmin();
  }, []);

  // Fetch stamps and subscribe to real-time updates
  useEffect(() => {
    let isMounted = true; // to avoid state updates after unmount

    const fetchStamps = async () => {
      const { data, error } = await supabase
        .from("stamps")
        .select("*, users(name, personal_number)")
        .order("id", { ascending: false });

      if (error) console.error(error);
      else if (isMounted) setStamps(data || []);
    };

    fetchStamps();

    const channel = supabase
      .channel("public:stamps")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "stamps" },
        async (payload: { new: Stamp }) => {
          // Fetch the full record with user info
          const { data: joined, error } = await supabase
            .from("stamps")
            .select("*, users(name, personal_number)")
            .eq("id", payload.new.id)
            .single();

          if (joined && isMounted) {
            setStamps((prev) => [joined, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      {stamps.map((stamp) => (
        <Card key={stamp.id} style={styles.card}>
          <Card.Content>
            <Title>
              {stamp.users?.name} ({stamp.users?.personal_number}) —{" "}
              {stamp.type}
            </Title>
            <Paragraph>
              Adress: {stamp.address}, {stamp.city}
            </Paragraph>
            <Paragraph>
              Tid: {new Date(stamp.created_at).toLocaleTimeString()}
            </Paragraph>
            <Paragraph>
              Datum: {new Date(stamp.created_at).toLocaleDateString()}
            </Paragraph>
          </Card.Content>
          {stamp.latitude && stamp.longitude && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: stamp.latitude,
                longitude: stamp.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: stamp.latitude,
                  longitude: stamp.longitude,
                }}
              />
            </MapView>
          )}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { marginBottom: 15 },
  map: { height: 180, marginTop: 10, borderRadius: 8 },
});
