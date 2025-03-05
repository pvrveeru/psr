/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-catch-shadow */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Keyboard } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/Ionicons';
// import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { getAllAssignments } from '../services/Apiservices';

const Dashboard = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [siteData, setSiteData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [userData, setUserData] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await AsyncStorage.getItem('userData');
        if (response) {
          const parsedData = JSON.parse(response);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error('Error fetching user data from AsyncStorage:', error);
      }
    };

    getUserId();
  }, []);
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        if (userData?.userId) { // Ensure userId is available
          const data = await getAllAssignments(userData.userId);
          setAssignments(data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [userData]);
  console.log('assignments', assignments);

  const filteredSites = siteData?.filter(site => {
    return site.dateTime.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openModal = (site) => {
    console.log('site', site);
    setSelectedSite(site);
    setModalVisible(true);
  };

  const shareAllSitesAsPDF = async () => {
    let htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
            .site-container {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 10px;
              border-radius: 5px;
            }
            .site-container h2 {
              margin: 0;
              padding-bottom: 5px;
              border-bottom: 1px solid #ccc;
            }
            .site-container p {
              margin: 5px 0;
            }
            .photo {
              text-align: center;
              margin-top: 10px;
            }
            img {
              width: 300px;
              height: auto;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <h1>All Site Details</h1>
    `;

    siteData.forEach(site => {
      htmlContent += `
        <div class="site-container">
          <h2>${site.name}</h2>
          <p><strong>Activity:</strong> ${site.activity}</p>
          <p><strong>Assigned To:</strong> ${site.assigned}</p>
          <p><strong>Client:</strong> ${site.client}</p>
          <p><strong>Date & Time:</strong> ${site.dateTime}</p>
          <p><strong>Location:</strong> ${site.location.latitude}, ${site.location.longitude}</p>
          <p><strong>Remarks:</strong> ${site.remarks}</p>
          <p><strong>Site:</strong> ${site.site}</p>
          ${site.photo?.uri ? `<div class="photo"><img src="${site.photo.uri}" /></div>` : ''}
        </div>
      `;
    });

    htmlContent += '</body></html>';

    try {
      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: 'All_Sites',
        base64: false,
        width: 612,
        height: 792,
      });

      await Share.open({
        url: `file://${file.filePath}`,
        type: 'application/pdf',
        title: 'Share All Sites',
      });
    } catch (error) {
      console.log('Error', 'Failed to generate PDF');
    }
  };


  const addSite = () => {
    navigation.navigate('AddSite');
  };

  const shareSiteAsPDF = async () => {
    let htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .site-container {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 10px;
              border-radius: 5px;
            }
            .site-container h2 {
              margin: 0;
              padding-bottom: 5px;
              border-bottom: 1px solid #ccc;
            }
            .site-container p {
              margin: 5px 0;
            }
            .photo {
              text-align: center;
              margin-top: 10px;
            }
            img {
              width: 300px;
              height: auto;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
    `;

    siteData.forEach(site => {
      htmlContent += `
        <div class="site-container">
          <h2>${site.name}</h2>
          <p><strong>Activity:</strong> ${site.activity}</p>
          <p><strong>Assigned To:</strong> ${site.assigned}</p>
          <p><strong>Client:</strong> ${site.client}</p>
          <p><strong>Date & Time:</strong> ${site.dateTime}</p>
          <p><strong>Location:</strong> ${site.location.latitude}, ${site.location.longitude}</p>
          <p><strong>Remarks:</strong> ${site.remarks}</p>
          <p><strong>Site:</strong> ${site.site}</p>
          ${site.photo?.uri ? `<div class="photo"><img src="${site.photo.uri}" /></div>` : ''}
        </div>
      `;
    });

    htmlContent += '</body></html>';

    try {
      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: 'All_Sites',
        base64: false,
        width: 612,
        height: 792,
      });

      await Share.open({
        url: `file://${file.filePath}`,
        type: 'application/pdf',
        title: 'Share All Sites',
      });
    } catch (error) {
      console.log('Error', 'Failed to generate PDF');
    }
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Work Report</Text>
        <TouchableOpacity onPress={shareAllSitesAsPDF} style={{ marginLeft: 'auto' }}>
          <Icon name="share-social-outline" size={28} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.searchHeader}>
          <TextInput
            style={styles.input}
            placeholder="Search by date..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView style={styles.scrollView}>
          {assignments?.length === 0 ? (
            <Text style={styles.noDataText}>No sites available</Text>
          ) : (
            assignments?.map((site, index) => (
              <View key={index} style={styles.siteItem}>
                <TouchableOpacity onPress={() => openModal(site)}>
                  <Text style={styles.siteName}>{site.name}</Text>
                </TouchableOpacity>
                {/* <Text style={styles.siteDate}>{formatDateTime(site.dateTime)}</Text> */}
              </View>
            ))
          )}
        </ScrollView>
        {!isKeyboardVisible && (
          <TouchableOpacity style={styles.shareAllButton} onPress={addSite}>
            <Text style={styles.shareText}>Add Site</Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal visible={modalVisible} transparent={true} animationType="slide" style={{ flex: 1 }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.headerTitle}>Work Information</Text>
                <TouchableOpacity onPress={() => shareSiteAsPDF(selectedSite)} style={styles.headerIcon}>
                  <Icon name="share-social-outline" size={28} color="black" />
                </TouchableOpacity>
              </View>
              {selectedSite && (
                <>
                  <View style={styles.line}>
                    <Text style={styles.boldText}>Site:</Text>
                    <Text style={styles.normalText}>{selectedSite?.siteId}</Text>
                  </View>

                  <View style={styles.line}>
                    <Text style={styles.boldText}>Activity:</Text>
                    <Text style={styles.normalText}>{selectedSite?.activity}</Text>
                  </View>

                  <View style={styles.line}>
                    <Text style={styles.boldText}>Client:</Text>
                    <Text style={styles.normalText}>{selectedSite?.clientName}</Text>
                  </View>

                  <View style={styles.line}>
                    <Text style={styles.boldText}>Assigned By:</Text>
                    <Text style={styles.normalText}>{selectedSite?.assignedBy?.assignor}</Text>
                  </View>

                  <View style={styles.line}>
                    <Text style={styles.boldText}>Remarks:</Text>
                    <Text style={styles.normalText}>{selectedSite?.remarks}</Text>
                  </View>

                  <View style={styles.line}>
                    <Text style={styles.boldText}>Latitude:</Text>
                    <Text style={styles.normalText}>{selectedSite?.latitude}</Text>
                  </View>

                  <View style={styles.line}>
                    <Text style={styles.boldText}>Longitude:</Text>
                    <Text style={styles.normalText}>{selectedSite?.longitude}</Text>
                  </View>

                  <View style={styles.line}>
                    <Text style={styles.boldText}>User Name:</Text>
                    <Text style={styles.normalText}>{selectedSite?.userId?.userName}</Text>
                  </View>

                  <View style={styles.line}>
                    <Text style={styles.boldText}>Phone Number:</Text>
                    <Text style={styles.normalText}>{selectedSite?.userId?.phoneNumber}</Text>
                  </View>

                  <View style={styles.line}>
                    <Text style={styles.boldText}>Device ID:</Text>
                    <Text style={styles.normalText}>{selectedSite?.userId?.deviceId}</Text>
                  </View>

                  {selectedSite?.galleryImages && selectedSite?.galleryImages.length > 0 && (
                    <>
                      <Text style={styles.boldText}>Photos:</Text>
                      <View style={styles.imageContainer}>
                        {selectedSite?.galleryImages.map((photo, index) => (
                          <Image
                            key={index}
                            source={{ uri: photo }} // Fixed issue with incorrect `photo.uri`
                            style={styles.image}
                          />
                        ))}
                      </View>
                    </>
                  )}

                  <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </>
  );
};

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#ccc'
  },

  headerTitle: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 20 },
  siteItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1 },
  siteName: { fontSize: 18, fontWeight: 'bold' },
  siteDate: { fontSize: 16, color: 'gray' },
  shareButton: { backgroundColor: '#ff9800', padding: 8, borderRadius: 5 },
  shareText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  shareAllButton: { backgroundColor: '#2196F3', padding: 15, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  closeButton: { backgroundColor: 'red', padding: 10, marginTop: 10, borderRadius: 5 },
  closeText: { color: '#fff', textAlign: 'center' },
  boldText: { fontWeight: 'bold', marginTop: 5, width: 90 },
  noDataText: { textAlign: 'center' },
  shareIcon: { position: 'absolute', right: 10, top: 20 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerIcon: {
    marginLeft: 'auto',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  normalText: {
    color: 'black',
    marginLeft: 5,
  },
  imageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 },
  image: { width: 100, height: 100, borderRadius: 10, marginVertical: 10, marginRight: 5 },
});

export default Dashboard;
