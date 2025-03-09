/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-catch-shadow */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */

import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Keyboard, Platform, ActivityIndicator } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/Ionicons';
// import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { getAllAssignments } from '../services/Apiservices';
import { Dialog } from '@rneui/themed';

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
  const [loading, setLoading] = useState(false);

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
        console.log('Error fetching user data from AsyncStorage:', error);
      }
    };

    getUserId();
  }, []);

  const fetchAssignments = async (userId) => {
    try {
      if (userId) {
        const data = await getAllAssignments(userId);
        setAssignments(data);
      }
    } catch (err) {
      console.log('error get all assignments', err);
    }
  };

  useEffect(() => {
    if (userData?.userId) {
      fetchAssignments(userData.userId);
    }
  }, [userData]);

  useFocusEffect(
    useCallback(() => {
      if (userData?.userId) {
        fetchAssignments(userData?.userId);
      }
    }, [userData])
  );

  const openModal = (site) => {
    console.log('site', site);
    setSelectedSite(site);
    setModalVisible(true);
  };

  const addSite = () => {
    navigation.navigate('AddSite');
  };
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) { return 'No Date'; }
    const parsedDate = moment(dateTimeString, ['DD/MM/YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss', 'YYYY/MM/DD HH:mm:ss']);
    if (!parsedDate.isValid()) {
      return 'Invalid Date';
    }
    return parsedDate.format('D/M/YYYY hh:mm A');
  };
  const filteredSites = assignments?.filter(site => {
    if (!site.createdAt) { return false; }
    const formattedDate = formatDateTime(site.createdAt);
    return formattedDate.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const shareAllSitesAsPDF = async () => {
    setLoading(true);
    console.log('Generating PDF...');
    let htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            .site-container { border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px; }
            .site-container h2 { margin: 0; padding-bottom: 5px; border-bottom: 1px solid #ccc; }
            .site-container p { margin: 5px 0; }
            .boldText { font-weight: bold; }
            .photo { display: flex; flex-wrap: wrap; justify-content: center; margin-top: 10px; }
            .photo img { width: 100px; height: 100px; margin: 5px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Work Report</h1>
    `;
    assignments.forEach(site => {
      htmlContent += `
        <div class="site-container">
          <h2>${site.userId?.userName}</h2>
          <p><strong>Activity:</strong> ${site?.activity}</p>
          <p><strong>Assigned To:</strong> ${site.assignedBy?.assignor}</p>
          <p><strong>Client:</strong> ${site?.clientName}</p>
          <p><strong>Date & Time:</strong> ${formatDateTime(site?.createdAt)}</p>
           <div class="line"><span class="boldText">Latitude:</span> ${site?.latitude}</div>
          <div class="line"><span class="boldText">Longitude:</span> ${site?.longitude}</div>
          <p><strong>Remarks:</strong> ${site?.remarks}</p>
          <p><strong>Site:</strong> ${site?.siteId}</p>
          <div class="line"><span class="boldText">Phone Number:</span> ${site.userId?.phoneNumber}</div>
  
          ${site?.galleryImages?.length > 0 ? `
            <div class="photo">
              ${site.galleryImages.map(img => `<img src="${img}" />`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    });

    htmlContent += '</body></html>';

    try {
      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: 'Work_Report',
        directory: 'Documents',
        base64: false,
      });

      console.log('PDF File Path:', file.filePath);
      if (!file.filePath) {
        console.error('Failed to generate PDF file');
        return;
      }

      const filePath = Platform.OS === 'android' ? `file://${file.filePath}` : file.filePath;
      setLoading(false);
      await Share.open({
        url: filePath,
        type: 'application/pdf',
        title: 'Share Work Report',
      });
    } catch (error) {
      setLoading(false);
      console.log('Error sharing PDF:', error);
    }
  };
  const shareSiteAsPDF = async (site) => {
    setLoading(true);
    if (!site) return;

    let htmlContent = `
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
            color: #333;
          }
          h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
            color: #2c3e50;
            font-weight: bold;
          }
          .container {
            background-color: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
          }
          .line {
            margin-bottom: 15px;
            font-size: 14px;
            line-height: 1.6;
          }
          .boldText {
            font-weight: bold;
            color: #2c3e50;
            display: inline-block;
            min-width: 120px;
          }
          .photo-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
          }
          .photo-container img {
            width: 100px;
            height: 100px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid #e0e0e0;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            width: 80px;
            height: 80px;
            margin-bottom: 10px;
          }
          .header h2 {
            font-size: 20px;
            color: #2c3e50;
            margin: 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Site Report</h2>
        </div>
        <div class="container">
          <div class="line"><span class="boldText">User Name:</span> ${site.userId?.userName}</div>
          <div class="line"><span class="boldText">Site:</span> ${site?.siteId}</div>
          <div class="line"><span class="boldText">Activity:</span> ${site?.activity}</div>
          <div class="line"><span class="boldText">Client:</span> ${site?.clientName}</div>
          <div class="line"><span class="boldText">Assigned By:</span> ${site.assignedBy?.assignor}</div>
          <div class="line"><span class="boldText">Remarks:</span> ${site?.remarks}</div>
          <div class="line"><span class="boldText">Date & Time:</span> ${formatDateTime(site?.createdAt)}</div>
          <div class="line"><span class="boldText">Latitude:</span> ${site?.latitude}</div>
          <div class="line"><span class="boldText">Longitude:</span> ${site?.longitude}</div>
          <div class="line"><span class="boldText">Phone Number:</span> ${site.userId?.phoneNumber}</div>
          ${site?.galleryImages?.length > 0 ? `
            <div class="photo-container">
              ${site.galleryImages.map(img => `<img src="${img}" />`).join('')}
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;

    try {
      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: `Site_Report_${site.siteId}`,
        directory: 'Documents',
        base64: false,
      });

      console.log('PDF File Path:', file.filePath);
      if (!file.filePath) {
        console.error('Failed to generate PDF file');
        return;
      }

      const filePath = Platform.OS === 'android' ? `file://${file.filePath}` : file.filePath;
      setLoading(false);
      await Share.open({
        url: filePath,
        type: 'application/pdf',
        title: 'Share Site Report',
      });
    } catch (error) {
      setLoading(false);
      console.log('Error sharing PDF:', error);
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
          {filteredSites?.length === 0 ? (
            <Text style={styles.noDataText}>No sites available</Text>
          ) : (
            filteredSites?.map((site, index) => (
              <View key={index} style={styles.siteItem}>
                <TouchableOpacity onPress={() => openModal(site)}>
                  <Text style={styles.siteName}>{site.name}</Text>
                </TouchableOpacity>
                <Text style={styles.siteDate}>{formatDateTime(site.createdAt)}</Text>
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
        <Dialog isVisible={loading}>
        <ActivityIndicator
          size="large"
          color="red"
        />
        <Text style={{ color: '#000', textAlign: 'center' }}>PDF Generating...</Text>
      </Dialog>
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#ccc',
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
