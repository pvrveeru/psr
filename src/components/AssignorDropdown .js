import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getAllAssignors } from '../services/Apiservices';

const AssignorDropdown = () => {
    const [assignors, setAssignors] = useState([]);

    useEffect(() => {
        const fetchAssignors = async () => {
            try {
                const data = await getAllAssignors();
                setAssignors(data.map(item => item.assignor));
            } catch (error) {
                console.error('Error fetching assignors:', error);
            }
        };

        fetchAssignors();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Assigned By:</Text>
            <SelectDropdown
                data={assignors}
                onSelect={(selectedItem, index) => {
                    console.log(selectedItem, index);
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    label: { fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
    dropdownButtonStyle: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 5,
        padding: 10,
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

export default AssignorDropdown;
