import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';

const LoginScreen = () => {
    const navigation = useNavigation();
  const [mobile, setMobile] = useState('');

  const handleLogin = () => {
    if (mobile.length === 10) {
      navigation.navigate('Otp', { mobile });
    } else {
      Alert.alert('Enter a valid 10-digit mobile number');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/slogo.png')} style={styles.logo} />
      <Text style={styles.label}>Enter Mobile Number</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        maxLength={10}
        value={mobile}
        onChangeText={setMobile}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff', },
  label: { fontSize: 18, marginBottom: 10 },
  input: { width: '100%', borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 20, textAlign: 'center', fontSize: 16, },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 16 },
  logo: { width: 162, height: 85, marginBottom: 20 },
});

export default LoginScreen;
