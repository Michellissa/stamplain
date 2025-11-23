import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput } from 'react-native';
import { Button } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personnummer, setPersonnummer] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (!firstName || !lastName || !personnummer) {
      Alert.alert("Fyll i alla fält!");
      return;
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('personal_number', personnummer)
      .single();

    if (existingUser) {
      Alert.alert("Personnummer finns redan!");
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ first_name: firstName, last_name: lastName, personal_number: personnummer, role: 'employee' }])
      .select()
      .single();

    if (error) {
      console.error(error);
      Alert.alert("Något gick fel vid registrering!");
      return;
    }

    Alert.alert("Registrering klar!", "Du kan nu logga in.");
    router.replace('/login');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Text style={styles.title}>Registrera</Text>
      <TextInput style={styles.input} placeholder="Förnamn" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Efternamn" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Personnummer" keyboardType="number-pad" value={personnummer} onChangeText={setPersonnummer} />
      <Button mode="contained" onPress={handleRegister}>Registrera</Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15 }
});
