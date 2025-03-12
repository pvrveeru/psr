import axios from 'axios';
import apiconfig from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const avdurl1 = apiconfig.develpoment.apibaseUrl;

const api = axios.create({
    baseURL: avdurl1,
    headers: {
        'Content-Type': 'application/json',
    },
});

async function getBearerToken() {
    try {
        const token = await AsyncStorage.getItem('acessToken');
        return token;
    } catch (err) {
        console.log('Async storage function error', err);
    }
}

api.interceptors.request.use(
    async config => {
        try {
            const token = await getBearerToken();
            // console.log('token', token);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        } catch (err) {
            console.log('Request interceptor error', err);
            return config;
        }
    },
    error => {
        console.log('Request interceptor error', error);
        return Promise.reject(error);
    },
);

export const createUser = async (body) => {
    console.log(body);
    try {
        const response = await axios.post(avdurl1 + 'users/login', body);
        return response.data.data;
    } catch (error) {
        console.log('Login API error:', error.response?.data);
        throw error.response?.data.error;
    }
};
export const validateOtp = async (body) => {
    console.log(body);
    try {
        const response = await axios.post(avdurl1 + '/otp/validate', body);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || 'An error occurred';
    }
};

export const getAllAssignors = async () => {
    try {
        const response = await api.get(avdurl1 + 'assignor');
        return response.data?.data?.Assignors;
    } catch (error) {
        console.log('getAllAssignors error:', error.response?.data || error);
        throw error.response?.data?.error || 'Error fetching assignors';
    }
};

export const getAllAssignments = async (userId) => {
    try {
        const response = await api.get(avdurl1 + 'assignments', { params: { userId } });
        return response.data?.data?.result;
    } catch (error) {
        console.log('getall assignments error:', error.response?.data || error);
        throw error.response?.data?.error || 'Error fetching assignors';
    }
};

export const postAssignment = async (body) => {
    console.log(body);
    try {
        const response = await api.post(avdurl1 + 'assignments', body);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || 'An error occurred';
    }
};

export const uploadAssignmentImages = async (formData, assignmentId) => {
    // const url = avdurl1 + `/uploads/assignment/${assignmentId}`;
    // console.log(url);
    try {
      const response = await api.post(avdurl1 + `uploads/assignment/${assignmentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.log('Upload error:', error);
      throw error.response?.data;
    }
  };
