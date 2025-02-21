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
import { Picker } from "@react-native-picker/picker";

const UserLoc = () => {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [dateTime, setDateTime] = useState("");

  // New states
  const [client, setClient] = useState("");
  const [site, setSite] = useState("");
  const [activity, setActivity] = useState("");
  const [assigned, setAssigned] = useState(""); // Dropdown state
  const [remarks, setRemarks] = useState("");

  // Assigned By dropdown values
  const assignedByOptions = ["User1", "User2", "User3"];

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
        cameraType: "front",
        saveToPhotos: true,
      });
      if (result.errorCode) {
        Alert.alert("Camera Error", `Code: ${result.errorCode}, Message: ${result.errorMessage}`);
      } else if (result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0]);
        fetchLocation();
      } else {
        Alert.alert("Error", "No photo was captured.");
      }
    } catch (error) {
      Alert.alert("Unexpected Error", "Something went wrong while opening the camera.");
    }
  };

  const fetchLocation = async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          // Format Date & Time
          const now = new Date();
          const formattedDateTime = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now
            .getHours()
            .toString()
            .padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${now
            .getSeconds()
            .toString()
            .padStart(2, "0")}`;
          setDateTime(formattedDateTime);
        },
        (error) => {
          Alert.alert("Error", JSON.stringify(error));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      Alert.alert("Permission Denied", "Location access denied.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your Name"
        value={name}
        onChangeText={setName}
      />
      
      <Text style={styles.label}>Client:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Client Name"
        value={client}
        onChangeText={setClient}
      />

      <Text style={styles.label}>Site Id:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Site Id"
        value={site}
        onChangeText={setSite}
      />

      <Text style={styles.label}>Activity:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Activity"
        value={activity}
        onChangeText={setActivity}
      />

      <Text style={styles.label}>Assigned By:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={assigned}
          onValueChange={(itemValue) => setAssigned(itemValue)}
        >
          <Picker.Item label="Select User" value="" />
          {assignedByOptions.map((user, index) => (
            <Picker.Item key={index} label={user} value={user} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Remarks:</Text>
      <TextInput
        style={styles.commentBox}
        placeholder="Enter Remarks"
        value={remarks}
        onChangeText={setRemarks}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Area:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your area"
        value={area}
        onChangeText={setArea}
      />

      
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Name: {name}</Text>
          <Text style={styles.infoText}>Client: {client}</Text>
          <Text style={styles.infoText}>Site ID: {site}</Text>
          <Text style={styles.infoText}>Activity: {activity}</Text>
          <Text style={styles.infoText}>Assigned By: {assigned}</Text>
          <Text style={styles.infoText}>Remarks: {remarks}</Text>
        </View>
     

      <Button title="Capture Photo" onPress={captureImage} />
      {photo && <Image source={{ uri: photo.uri }} style={styles.image} />}

      <Text style={styles.details}>Position</Text>
      {location && (
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  commentBox: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    textAlignVertical: "top", // Ensures text starts at the top
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
  details: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 14,
    marginTop: 5,
  },
  infoContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
});

export default UserLoc;
