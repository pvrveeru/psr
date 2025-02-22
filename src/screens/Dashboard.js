import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';

const Dashboard = () => {
  const route = useRoute();
  const [siteData, setSiteData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => {
    if (route.params?.userData) {
      setSiteData((prevData) => [...prevData, route.params.userData]);
    }
  }, [route.params?.userData]);
  // Function to open modal with site details
  const openModal = (site) => {
    setSelectedSite(site);
    setModalVisible(true);
  };

  // Function to generate and share PDF for a single site
  const shareSiteAsPDF = async (site) => {
    const htmlContent = `
      <h1>${site.site_name}</h1>
      <p><strong>Date:</strong> ${site.date}</p>
      <p><strong>Location:</strong> ${site.location}</p>
      <p><strong>Details:</strong> ${site.details}</p>
    `;

    try {
      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: `Site_${site.site_name}`,
        base64: false,
      });

      await Share.open({
        url: `file://${file.filePath}`,
        type: 'application/pdf',
        title: 'Share Site Details',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  // Function to generate and share PDF for all sites
  const shareAllSitesAsPDF = async () => {
    let htmlContent = '<h1>All Sites</h1>';
    siteData.forEach(site => {
      htmlContent += `
        <h2>${site.site_name}</h2>
        <p><strong>Date:</strong> ${site.date}</p>
        <p><strong>Location:</strong> ${site.location}</p>
        <p><strong>Details:</strong> ${site.details}</p>
        <hr/>
      `;
    });

    try {
      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: 'All_Sites',
        base64: false,
      });

      await Share.open({
        url: `file://${file.filePath}`,
        type: 'application/pdf',
        title: 'Share All Sites',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Search by date..." />
      <FlatList
        data={siteData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.siteItem}>
            <TouchableOpacity onPress={() => openModal(item)}>
              <Text style={styles.siteName}>{item.site_name}</Text>
            </TouchableOpacity>
            <Text style={styles.siteDate}>{item.date}</Text>
            <TouchableOpacity style={styles.shareButton} onPress={() => shareSiteAsPDF(item)}>
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={styles.shareAllButton} onPress={shareAllSitesAsPDF}>
        <Text style={styles.buttonText}>Share All Sites</Text>
      </TouchableOpacity>

      {/* Modal for Site Details */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedSite && (
              <>
                <Text style={styles.modalTitle}>{selectedSite.site_name}</Text>
                <Text><strong>Date:</strong> {selectedSite.date}</Text>
                <Text><strong>Location:</strong> {selectedSite.location}</Text>
                <Text><strong>Details:</strong> {selectedSite.details}</Text>
                <TouchableOpacity style={styles.shareButton} onPress={() => shareSiteAsPDF(selectedSite)}>
                  <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 20 },
  siteItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1 },
  siteName: { fontSize: 18, fontWeight: 'bold' },
  siteDate: { fontSize: 16, color: 'gray' },
  shareButton: { backgroundColor: '#ff9800', padding: 8, borderRadius: 5 },
  shareText: { color: '#fff', fontSize: 14 },
  shareAllButton: { backgroundColor: '#2196F3', padding: 15, borderRadius: 5, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  closeButton: { backgroundColor: 'red', padding: 10, marginTop: 10, borderRadius: 5 },
  closeText: { color: '#fff', textAlign: 'center' },
});

export default Dashboard;
