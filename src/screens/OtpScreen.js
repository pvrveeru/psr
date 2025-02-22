import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const OtpScreen = ({ route }) => {
    const navigation = useNavigation();
  const { mobile } = route.params;
  const [otp, setOtp] = useState('');

  const verifyOtp = () => {
    if (otp === '1234') {
      navigation.navigate('Dashboard');
    } else {
      Alert.alert('Invalid OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter OTP sent to {mobile}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        maxLength={4}
        value={otp}
        onChangeText={setOtp}
      />
      <TouchableOpacity style={styles.button} onPress={verifyOtp}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  label: { fontSize: 18, marginBottom: 10 },
  input: { width: '100%', borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 20 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 16 },
});

export default OtpScreen;
