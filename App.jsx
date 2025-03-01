import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';
import Dashboard from './src/screens/Dashboard';
import UserLoc from './src/components/location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkAppStatus = async () => {
      try {
        const userStatus = await AsyncStorage.getItem('isLoggedIn');
        console.log('userStatus', userStatus);
        if (!userStatus) {
          await AsyncStorage.setItem('isLoggedIn', 'false');
          setIsLoggedIn(false);
        } else if (userStatus === 'true') {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.log(err);
        setIsLoggedIn(false);
      }
    };

    checkAppStatus();
  }, []);

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={'red'} />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "Dashboard" : "Login"} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        {/* <Stack.Screen name="AddSite" component={AddSite} /> */}
        <Stack.Screen name="AddSite" component={UserLoc} />
      </Stack.Navigator>
    </NavigationContainer>

  );
};

export default App;
