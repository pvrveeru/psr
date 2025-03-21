import React, { useEffect, useState } from 'react';
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
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAllAssignors, postAssignment, uploadAssignmentImages } from '../services/Apiservices';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Dialog } from '@rneui/themed';

const UserLoc = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [site, setSite] = useState('');
  const [activity, setActivity] = useState('');
  const [assigned, setAssigned] = useState('');
  const [remarks, setRemarks] = useState('');
  const [photo, setPhoto] = useState([]);
  const [location, setLocation] = useState(null);
  const [assignors, setAssignors] = useState([]);
  const [userData, setUserData] = useState('');
  const [allAssignors, setAllAssignors] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await AsyncStorage.getItem('userData');
        if (response) {
          const parsedData = JSON.parse(response);
          setUserData(parsedData);
          setName(parsedData.userName);
        }

      } catch (error) {
        console.error('Error fetching user data from AsyncStorage:', error);
      }
    };

    getUserId();
  }, []);
  // console.log('name', allAssignors);
  useEffect(() => {
    const fetchAssignors = async () => {
      try {
        const data = await getAllAssignors();
        setAssignors(data.map(item => item.assignor));
        setAllAssignors(data);
      } catch (err) {
        console.log('fetch Assignors error', err);
      }
    };

    fetchAssignors();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // Assume iOS permissions are granted
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // Assume iOS permissions are granted
  };

  const captureImage = async () => {
    const cameraPermission = await requestCameraPermission();
    if (!cameraPermission) {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }

    // Check if the limit of 5 images has been reached
    if (photo.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload a maximum of 5 images.');
      return;
    }

    try {
      const result = await ImagePicker.launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        saveToPhotos: true,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.6,
      });

      if (result.didCancel) {
        Alert.alert('Cancelled', 'You cancelled the camera operation.');
      } else if (result.errorCode) {
        console.error('Camera Error:', result.errorMessage);
        Alert.alert('Camera Error', `Code: ${result.errorCode}, Message: ${result.errorMessage}`);
      } else if (result.assets && result.assets.length > 0) {
        // Add the new photo to the existing array of photos
        console.log('upload result', result.assets[0]);
        setPhoto((prevPhotos) => [...prevPhotos, result.assets[0]]);
        fetchLocation();
      } else {
        Alert.alert('Error', 'No photo was captured.');
      }
    } catch (error) {
      console.error('Unexpected Camera Error:', error);
      Alert.alert('Unexpected Error', 'Something went wrong while opening the camera.');
    }
  };

  const fetchLocation = async () => {
    const granted = await requestLocationPermission();
    if (!granted) {
      Alert.alert('Permission Denied', 'Location access denied.');
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
          .padStart(2, '0')}:${now
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${now
              .getSeconds()
              .toString()
              .padStart(2, '0')}`;
        console.log(formattedDateTime);
      },
      (error) => {
        Alert.alert('Location Error', JSON.stringify(error));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const selectedAssignor = allAssignors?.find(
    (assignor) => assignor.assignor === assigned
  );

  const selectedAssignorId = selectedAssignor ? selectedAssignor?.assignorId : null;

  const handleSubmit = async () => {
    setLoading(true);
    if (!name || !client || !site || !activity || !assigned || !remarks || !location) {
      Alert.alert('Error', 'Please fill all fields and upload an image.');
      return;
    }
    const postBody = {
      name: name,
      clientName: client,
      siteId: site,
      activity: activity,
      assignedBy: selectedAssignorId,
      remarks: remarks,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      imageUrl: '',
      userId: userData?.userId,
    };

    // console.log('Post Body:', postBody);
    try {
      const response = await postAssignment(postBody);
      // console.log('response', response);
      if (response && response.assignmentId) {
        await uploadImages(response.assignmentId);
        navigation.goBack();
        setLoading(false);
      } else {
        setLoading(false);
        Alert.alert('Error', 'Failed to submit assignment.');
      }
    } catch (error) {
      setLoading(false);
      console.log('Error:', error);
    }
  };

  // const uploadImages = async (assignmentId) => {
  //   try {
  //     const formData = new FormData();
  //     photo.forEach((image, index) => {
  //       formData.append('images', {
  //         uri: image.uri,
  //         name: `image_${index}.jpg`,
  //         type: 'image/jpeg',
  //       });
  //     });
  //     // console.log('formData', formData);
  //     try {
  //       const response = await uploadAssignmentImages(formData, assignmentId);
  //       // Alert.alert('Upload Success', response.message);
  //       console.log('Uploaded URLs:', response.urls);
  //     } catch (error) {
  //       Alert.alert('Upload Failed', error.message);
  //     }
  //   } catch (error) {
  //     console.error('Image upload error:', error);
  //     Alert.alert('Error', 'Image upload failed.');
  //   }
  // };

  const uploadImages = async (assignmentId) => {
    try {
      for (let index = 0; index < photo.length; index++) {
        const image = photo[index];
        const formData = new FormData();
        formData.append('images', {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: 'image/jpeg',
        });

        console.log(`Uploading Image ${index + 1}...`);

        try {
          const response = await uploadAssignmentImages(formData, assignmentId);
          console.log(`Image ${index + 1} Uploaded:`, response.urls);
        } catch (error) {
          console.log(`Upload Failed for Image ${index + 1}:`, error.message);
        }
      }
      console.log('All images uploaded successfully.');
    } catch (error) {
      console.log('Image upload error:', error);
      Alert.alert('Error', 'Image upload failed.');
    }
  };
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Your Information</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View>

          {/* <Text style={styles.label}>Name:</Text>
          <TextInput style={styles.input} placeholder="Enter your Name" value={name} onChangeText={setName} /> */}

          <Text style={styles.label}>Client:</Text>
          <TextInput style={styles.input} placeholder="Enter Client Name" value={client} onChangeText={setClient} />

          <Text style={styles.label}>Site ID:</Text>
          <TextInput style={styles.input} placeholder="Enter Site ID" value={site} onChangeText={setSite} />

          <Text style={styles.label}>Activity:</Text>
          <TextInput style={styles.input} placeholder="Enter Activity" value={activity} onChangeText={setActivity} />

          <Text style={styles.label}>Assigned By:</Text>
          <SelectDropdown
            data={assignors}
            onSelect={(selectedItem, index) => {
              setAssigned(selectedItem, index);
            }}
            renderButton={(selectedItem, isOpen) => (
              <View style={styles.dropdownButtonStyle}>
                <Text style={styles.dropdownButtonTxtStyle}>
                  {selectedItem || 'Select Assigned By'}
                </Text>
              </View>
            )}
            renderItem={(item, index, isSelected) => (
              <View
                style={{
                  ...styles.dropdownItemStyle,
                  ...(isSelected && { backgroundColor: '#D2D9DF' }),
                }}
              >
                <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
              </View>
            )}
            dropdownStyle={styles.dropdownMenuStyle}
            search
            searchInputStyle={styles.dropdownSearchInputStyle}
            searchInputTxtColor={'#151E26'}
            searchPlaceHolder={'Search here'}
            searchPlaceHolderColor={'#72808D'}
            renderSearchInputLeftIcon={() => (
              <FontAwesome name={'search'} color={'#72808D'} size={18} />
            )}
            defaultButtonText="Select Assigned By"
            buttonStyle={styles.dropdownButtonStyle}
            buttonTextStyle={styles.dropdownButtonTxtStyle}
          />
          {/* <TextInput style={styles.input} placeholder="Enter Assigned By" value={assigned} onChangeText={setAssigned} /> */}
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
          <View style={styles.imageContainer}>
            {photo.map((image, index) => (
              <Image key={index} source={{ uri: image.uri }} style={styles.image} />
            ))}
          </View>
        </View>
      </ScrollView>
      {!isKeyboardVisible && (
        <View style={styles.button}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
      <Dialog isVisible={loading}>
        <ActivityIndicator
          size="large"
          color="red"
        />
        <Text style={{ color: '#000', textAlign: 'center' }}>Assignment Subbmitting...</Text>
      </Dialog>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    columnGap: 10,
    backgroundColor: '#ccc',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContainer: { padding: 20 },
  // header: {fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: 'black', borderRadius: 8, padding: 10, marginVertical: 10 },
  label: { fontSize: 12, fontWeight: 'bold', marginTop: 0 },
  commentBox: { borderWidth: 1, borderColor: 'black', borderRadius: 8, padding: 10, marginVertical: 10, textAlignVertical: 'top' },
  image: { width: 100, height: 100, borderRadius: 10, marginVertical: 10, marginRight: 5 },
  imageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 },
  details: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  info: { fontSize: 16, marginTop: 10 },
  // submitButton: { backgroundColor: "#28a745", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
  // submitText: { color: "white", fontSize: 18, fontWeight: "bold" },
  shareIcon: { position: 'absolute', left: 0, top: 0 },

  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    padding: 10,
  },
  submitText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  dropdownButtonStyle: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  dropdownButtonTxtStyle: {
    fontSize: 16,
    color: '#333',
  },
  dropdownMenuStyle: {
    position: 'absolute',
    width: '90%',
    maxHeight: 150,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  dropdownItemStyle: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownItemTxtStyle: {
    fontSize: 16,
  },
  dropdownSearchInputStyle: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 10,
    fontSize: 16,
  },
});

export default UserLoc;
