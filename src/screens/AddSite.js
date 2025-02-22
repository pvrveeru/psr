import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const AddSite = () => {
  return (
    <View style={styles.container}>
      <Text>Enter Site Details:</Text>
      <TextInput style={styles.input} placeholder="Site Name" />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 20 },
    item: { fontSize: 18, marginVertical: 5 },
    button: { backgroundColor: '#ff9800', padding: 15, borderRadius: 5, marginTop: 20 },
    buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  });

export default AddSite;
