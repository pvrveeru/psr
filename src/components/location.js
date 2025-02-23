import React, { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  Image,
  ScrollView,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "react-native-image-picker";
import Geolocation from "react-native-geolocation-service";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";

const UserLoc = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { setSiteData } = route.params || {};
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [site, setSite] = useState("");
  const [activity, setActivity] = useState("");
  const [assigned, setAssigned] = useState(""); // Dropdown state
  const [remarks, setRemarks] = useState("");
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [dateTime, setDateTime] = useState("");
  const assignedByOptions = ["User1", "User2", "User3"];

  // Request camera permission (Android)
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "This app needs access to your camera.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // Assume iOS permissions are granted
  };

  // Request location permission (Android)
  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // Assume iOS permissions are granted
  };

  // Capture image using the camera
  const captureImage = async () => {
    const cameraPermission = await requestCameraPermission();
    if (!cameraPermission) {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }

    try {
      const result = await ImagePicker.launchCamera({
        mediaType: "photo",
        cameraType: "front",
        saveToPhotos: true,
      });

      if (result.didCancel) {
        Alert.alert("Cancelled", "You cancelled the camera operation.");
      } else if (result.errorCode) {
        console.error("Camera Error:", result.errorMessage);
        Alert.alert("Camera Error", `Code: ${result.errorCode}, Message: ${result.errorMessage}`);
      } else if (result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0]);
        fetchLocation();
      } else {
        Alert.alert("Error", "No photo was captured.");
      }
    } catch (error) {
      console.error("Unexpected Camera Error:", error);
      Alert.alert("Unexpected Error", "Something went wrong while opening the camera.");
    }
  };

  // Fetch user's location
  const fetchLocation = async () => {
    const granted = await requestLocationPermission();
    if (!granted) {
      Alert.alert("Permission Denied", "Location access denied.");
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

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
        Alert.alert("Location Error", JSON.stringify(error));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleSubmit = () => {
    if (!name || !client || !site || !activity || !assigned || !remarks || !photo || !location) {
      Alert.alert("Error", "Please fill all fields and upload an image.");
      return;
    }
    const userData = { name, client, site, activity, assigned, remarks, photo, location, dateTime };
    // setSiteData(userData)
    console.log("Submitted Data:", name, client, site);
    console.log("Submitted Data:");
    Alert.alert(
      "Submitted Data",
      `Name: ${userData.name}\nClient: ${userData.client}\nSite: ${userData.site}\nActivity: ${userData.activity}\nAssigned By: ${userData.assigned}\nRemarks: ${userData.remarks}\nDate/Time: ${userData.dateTime}\nLocation: ${userData.location.latitude}, ${userData.location.longitude}`,
      [{ text: "OK", onPress: () => navigation.navigate("Dashboard", { userData }) }]
    );
    navigation.navigate("Dashboard", {userData});
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={styles.label}>Name:</Text>
          <TextInput style={styles.input} placeholder="Enter your Name" value={name} onChangeText={setName} />

          <Text style={styles.label}>Client:</Text>
          <TextInput style={styles.input} placeholder="Enter Client Name" value={client} onChangeText={setClient} />

          <Text style={styles.label}>Site ID:</Text>
          <TextInput style={styles.input} placeholder="Enter Site ID" value={site} onChangeText={setSite} />

          <Text style={styles.label}>Activity:</Text>
          <TextInput style={styles.input} placeholder="Enter Activity" value={activity} onChangeText={setActivity} />

          <Text style={styles.label}>Assigned By:</Text>
          <TextInput style={styles.input} placeholder="Enter Assigned By" value={assigned} onChangeText={setAssigned} />
          <Text style={styles.label}>Remarks:</Text>
          <TextInput
            style={styles.commentBox}
            placeholder="Enter Remarks"
            value={remarks}
            onChangeText={setRemarks}
            multiline
            numberOfLines={4}
          />

          <Button title="Capture Photo" onPress={captureImage} />
          {photo && <Image source={{ uri: photo.uri }} style={styles.image} />}

          <Text style={styles.details}>Position</Text>
          {location && location.latitude && location.longitude && (
            <Text style={styles.info}>Latitude: {location.latitude}, Longitude: {location.longitude}</Text>
          )}
          {dateTime && <Text style={styles.info}>Date/Time: {dateTime}</Text>}
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  input: { borderWidth: 1, borderColor: "black", borderRadius: 8, padding: 10, marginVertical: 10 },
  label: { fontSize: 12, fontWeight: "bold", marginTop: 0 },
  commentBox: { borderWidth: 1, borderColor: "black", borderRadius: 8, padding: 10, marginVertical: 10, textAlignVertical: "top" },
  image: { width: 200, height: 200, borderRadius: 10, marginVertical: 10 },
  details: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  info: { fontSize: 16, marginTop: 10 },
  submitButton: { backgroundColor: "#28a745", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
  submitText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default UserLoc;
