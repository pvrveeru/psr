import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "react-native-image-picker";
import Geolocation from "react-native-geolocation-service";
import { PermissionsAndroid, Platform } from "react-native";

const UserLoc = () => {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [dateTime, setDateTime] = useState("");

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app requires access to your location.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // Assume iOS permissions are granted
  };

  const captureImage = async () => {
    try {
      const result = await ImagePicker.launchCamera({
        mediaType: "photo",
        saveToPhotos: true,
      });

      console.log("ImagePicker Response:", result);

      if (result.didCancel) {
        Alert.alert("Cancelled", "Image capture cancelled by user.");
      } else if (result.errorCode) {
        Alert.alert("Error", `Error Code: ${result.errorCode}`);
      } else if (result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0]);
        fetchlocation(); // Fetch location after capturing the photo
      } else {
        Alert.alert("Error", "Unexpected response structure from ImagePicker.");
      }
    } catch (error) {
      console.error("Capture Image Error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const fetchlocation = async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      Geolocation.getCurrentPosition(
        (position) => {
          Alert.alert("Position", JSON.stringify(position)); // Debug
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setDateTime(new Date().toLocaleString());
        },
        (error) => {
          Alert.alert("Error", JSON.stringify(error)); // Debug
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      Alert.alert("Permission Denied", "Location access denied.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nameaaaa:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your Name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Area:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your area"
        value={area}
        onChangeText={setArea}
      />

      <Button title="Capture Photo" onPress={captureImage} />
      {photo && <Image source={{ uri: photo.uri }} style={styles.image} />}

      {location && location.latitude && location.longitude && (
        <Text style={styles.info}>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </Text>
      )}
      {dateTime && <Text style={styles.info}>Date/Time: {dateTime}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  info: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default UserLoc;
