import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { createUser } from '../services/Apiservices';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [mobile, setMobile] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await DeviceInfo.getUniqueId();
      setDeviceId(id);
    };
    fetchDeviceId();
  }, []);

  // const handleLogin = () => {
  //   if (!mobile) {
  //     Alert.alert('Error', 'Please enter your mobile number');
  //     return;
  //   }

  //   if (mobile.length !== 10) {
  //     Alert.alert('Error', 'Enter a valid 10-digit mobile number');
  //     return;
  //   }
  //   const body = {
  //     phoneNumber: mobile,
  //     deviceId: deviceId,
  //   };

  //   console.log('Request Body:', body);

  //   navigation.navigate('Otp', { mobile, otpCode });
  // };
  const handleOtpRequest = async () => {
    const formattedPhoneNumber = `+91${mobile}`;
    setLoading(true);
    if (!mobile) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (mobile.length !== 10) {
      Alert.alert('Error', 'Enter a valid 10-digit mobile number');
      return;
    }
    const body = {
      phoneNumber: formattedPhoneNumber,
      deviceId: deviceId,
    };
    try {
      const response = await createUser(body);
      const otpcode = response?.otpCode;
      console.log('response45', response);
      console.log('otpcode', otpcode);
      Alert.alert('Success', 'OTP request sent successfully!');
      navigation.navigate('Otp', { formattedPhoneNumber, otpcode });
    } catch (error) {
      console.log('Error', error);
      Alert.alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/slogo.png')} style={styles.logo} />

      <Text style={styles.label}>Enter Mobile Number</Text>

      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="Phone Number"
        maxLength={10}
        value={mobile}
        onChangeText={setMobile}
        placeholderTextColor="#000"
      />

      <TouchableOpacity style={styles.button} onPress={handleOtpRequest}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 18, marginBottom: 10 },
  deviceIdLabel: { fontSize: 18, fontWeight: 'bold' },
  deviceIdText: { fontSize: 16, marginTop: 10 },
  input: { width: '100%', borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 20, fontSize: 16 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 16 },
  logo: { width: 162, height: 85, marginBottom: 20 },
});

export default LoginScreen;
