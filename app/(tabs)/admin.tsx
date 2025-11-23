import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface Stamp {
  id: number;
  user_id: string;
  type: 'IN' | 'OUT';
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  created_at: string;
  users?: { name: string };
}

export default function AdminScreen() {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const router = useRouter();

  // Kontrollera admin-behörighet
  useEffect(() => {
    const checkAdmin = async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (role !== 'admin') {
        Alert.alert('Otillåtet', 'Du har inte behörighet att se admin-sidan');
        router.replace('/'); // skicka till index
      }
    };
    checkAdmin();
  }, []);

  // Hämta initiala stämplar och subscriba realtime
  useEffect(() => {
    const fetchStamps = async () => {
      const { data, error } = await supabase
        .from('stamps')
        .select('*, users(name)')
        .order('id', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setStamps(data || []);
      }
    };

    fetchStamps();

    // Realtime channel
    const channel = supabase
      .channel('public:stamps')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stamps' },
        (payload: { new: Stamp }) => {
          setStamps(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      {stamps.map(stamp => (
        <Card key={stamp.id} style={styles.card}>
          <Card.Content>
            <Title>
              {stamp.users?.name || 'Okänt namn'} — {stamp.type}
            </Title>
            <Paragraph>Adress: {stamp.address}, {stamp.city}</Paragraph>
            <Paragraph>Tid: {new Date(stamp.created_at).toLocaleTimeString()}</Paragraph>
            <Paragraph>Datum: {new Date(stamp.created_at).toLocaleDateString()}</Paragraph>
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
              <Marker coordinate={{ latitude: stamp.latitude, longitude: stamp.longitude }} />
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
