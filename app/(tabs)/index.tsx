import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Card, Paragraph, Title } from 'react-native-paper';
import { supabase } from '../../lib/supabase';

export default function IndexScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personnummer, setPersonnummer] = useState('');
  const [log, setLog] = useState<any>(null);
  const [stamping, setStamping] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false); 

  useEffect(() => {
    const loadData = async () => {
      const f = await AsyncStorage.getItem('firstName');
      const l = await AsyncStorage.getItem('lastName');
      const p = await AsyncStorage.getItem('personnummer');
      if(f) setFirstName(f);
      if(l) setLastName(l);
      if(p) setPersonnummer(p);
    };
    loadData();
  }, []);

  const handleStamp = async () => {
    if(!firstName || !lastName || !personnummer){
      alert("Fyll i alla fält!");
      return;
    }

    setStamping(true);

    await AsyncStorage.setItem('firstName', firstName);
    await AsyncStorage.setItem('lastName', lastName);
    await AsyncStorage.setItem('personnummer', personnummer);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if(status !== 'granted'){
      alert("Platsåtkomst nekad");
      setStamping(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const geo = await Location.reverseGeocodeAsync(location.coords);
    const place = geo[0] || {};

    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('personal_number', personnummer)
      .single();

    if(!userData){
      const { data, error } = await supabase
        .from('users')
        .insert([{ personal_number: personnummer, name: `${firstName} ${lastName}`, role: 'employee' }])
        .select()
        .single();
      if(error) console.error(error);
      userData = data;
    }

    const type = log?.type === 'IN' ? 'OUT' : 'IN';
    const stampEntry = {
      user_id: userData.id,
      type,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      city: place.city || '',
      address: `${place.street || ''} ${place.streetNumber || ''}`.trim(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };

    const { data, error } = await supabase.from('stamps').insert([stampEntry]);
    if(error) console.error(error);

    setLog({ ...stampEntry, name: userData.name, type });
    setStamping(false);
    setInfoVisible(true); 
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
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

      <Button
        mode="contained"
        onPress={handleStamp}
        style={{
          borderRadius: 60,
          width: 120,
          height: 120,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          marginTop: 20
        }}
        contentStyle={{ width: 120, height: 120 }}
        loading={stamping}
      >
        {log?.type === 'IN' ? 'Stämpla UT' : 'Stämpla IN'}
      </Button>

     
      {infoVisible && log && (
        <Card style={{ marginTop: 20, backgroundColor: '#eef', padding: 10 }}>
          <Card.Content>
            <Title>✔ Stämpling registrerad</Title>
            <Paragraph>Du har stämplat: {log.type}</Paragraph>
            <Paragraph>Tid: {log.time}</Paragraph>
            <Paragraph>Datum: {log.date}</Paragraph>
            <Paragraph>Plats: {log.address}</Paragraph>
            <Button onPress={() => setInfoVisible(false)}>Stäng</Button>
          </Card.Content>
        </Card>
      )}

      {log && (
        <Card style={{ marginTop: 20 }}>
          <Card.Content>
            <Title>{log.name} — {log.type}</Title>
            <Paragraph>Datum: {log.date}</Paragraph>
            <Paragraph>Tid: {log.time}</Paragraph>
            <Paragraph>Adress: {log.address}, {log.city}</Paragraph>
          </Card.Content>
          {log.latitude && (
            <MapView
              style={{ height: 180, marginTop: 10 }}
              initialRegion={{
                latitude: log.latitude,
                longitude: log.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={{ latitude: log.latitude, longitude: log.longitude }} />
            </MapView>
          )}
        </Card>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 20, justifyContent:'center' },
  title:{ fontSize:28, fontWeight:'bold', textAlign:'center', marginBottom:20 },
  input:{ borderWidth:1, borderRadius:8, padding:10, marginBottom:10 }
});