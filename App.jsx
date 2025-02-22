// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * 
//  */

// import React from 'react';
// import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
// import UserLoc from './src/components/location';

// function App(): React.JSX.Element {
//   return (
//     <>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView style={styles.container}>
//         <UserLoc />
//       </SafeAreaView>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff', // Optional: Adjust background color
//   },
// });

// export default App;

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';
import Dashboard from './src/screens/Dashboard';
import AddSite from './src/screens/AddSite';
import UserLoc from './src/components/location'

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
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
