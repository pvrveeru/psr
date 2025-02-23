/* eslint-disable react-hooks/exhaustive-deps */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const userStatus = await AsyncStorage.getItem('isLoggedIn');
        console.log('userStatus:', userStatus);
        if (userStatus === 'true') {
          navigation.replace('Dashboard');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error retrieving user status:', error);
        navigation.replace('Login');
      }
    };

    setTimeout(() => {
      checkUserStatus();
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 296, height: 200, marginBottom: 20 },
});

export default SplashScreen;
