import React from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const Dashboard = ({ navigation }) => {
  const data = [{ id: '1', name: 'Site A' }, { id: '2', name: 'Site B' }];

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Search by date..." />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
      />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddSite')}>
        <Text style={styles.buttonText}>Add Site</Text>
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

export default Dashboard;
