import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { validateOtp } from '../services/Apiservices';

const OtpScreen = ({ route }) => {
    const navigation = useNavigation();
  const { mobile, otpcode } = route.params;
  const [otp, setOtp] = useState(otpcode ? otpcode : '');

  const verifyOtp = async () => {
    if (otp === '1234') {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      navigation.navigate('Dashboard');
    } else {
      Alert.alert('Invalid OTP');
    }
  };
  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
      const body = {
        phoneNumber: mobile,
        otpCode: otp,
      };
      try {
        const userData = await validateOtp(body);
        console.log('userData', userData);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem(
          'userData',
          JSON.stringify(userData),
        );
        // af9e56931a4ce7e4
        await AsyncStorage.setItem('acessToken', userData.accessToken);
        Alert.alert(
          'Success',
          'OTP verified successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Dashboard' }],
                });
              },
            },
          ]
        );
      } catch (error) {
        console.log('Error', error);
      }
    } else {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/slogo.png')} style={styles.logo} />
      <Text style={styles.label}>Enter OTP sent to {mobile}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 18, marginBottom: 10 },
  input: { width: '100%', borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 16 },
  logo: { width: 162, height: 85, marginBottom: 20 },
});

export default OtpScreen;
