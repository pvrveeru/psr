/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * 
 */

import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import UserLoc from './src/components/location';

function App(): React.JSX.Element {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <UserLoc />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Optional: Adjust background color
  },
});

export default App;
