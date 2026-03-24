import axios from 'axios';
import { store } from '../redux/store';

const API_URL = `${import.meta.env.VITE_API_URL}/faqs`;

// Helper function to get the authentication token from Redux store
const getAuthToken = () => {
  const state = store.getState();
  return state.auth?.token || localStorage.getItem('accessToken');
};

// Helper to create headers with authentication token
const getHeaders = () => ({
  headers: {
    'Content-Type': 'application/json',
    'accesstoken': getAuthToken()
  }
});

export const faqService = {
  // Get all FAQs
  async getAllFaqs() {
    try {
      console.log('Fetching all FAQs');
      const response = await axios.get(`${API_URL}/all`);
      console.log('FAQs fetched successfully:', response.data);
      return response.data.faqs;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  },

  // Create a new FAQ
  async createFaq(faqData) {
    try {
      console.log('Creating new FAQ:', faqData);
      const response = await axios.post(API_URL, faqData, getHeaders());
      console.log('FAQ created successfully:', response.data);
      return response.data.faq;
    } catch (error) {
      console.error('Error creating FAQ:', error);
      throw error;
    }
  },

  // Update an existing FAQ
  async updateFaq(id, faqData) {
    try {
      console.log(`Updating FAQ with ID ${id}:`, faqData);
      
      // Check if id is undefined, null, or empty string
      if (!id) {
        console.error('Missing FAQ ID for update operation');
        throw new Error('FAQ ID is required for update');
      }
      
      // Ensure we have the correct headers
      const headers = getHeaders();
      
      // Make sure the ID is properly formatted for the API request
      const formattedId = id.toString().trim();
      
      const response = await axios.put(`${API_URL}/${formattedId}`, faqData, headers);
      
      console.log('FAQ updated successfully:', response.data);
      
      return response.data.faq;
    } catch (error) {
      console.error(`Error updating FAQ with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a FAQ
  async deleteFaq(id) {
    try {
      console.log(`Deleting FAQ with ID ${id}`);
      await axios.delete(`${API_URL}/${id}`, getHeaders());
      console.log('FAQ deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting FAQ with ID ${id}:`, error);
      throw error;
    }
  },

  // Search FAQs by term
  async searchFaqs(searchTerm) {
    try {
      console.log(`Searching FAQs with term: ${searchTerm}`);
      const response = await axios.get(`${API_URL}/search/${searchTerm}`);
      console.log('Search results:', response.data);
      return response.data.faqs;
    } catch (error) {
      console.error(`Error searching FAQs with term ${searchTerm}:`, error);
      throw error;
    }
  },

  // Get FAQ by ID
  async getFaqById(id) {
    try {
      console.log(`Fetching FAQ with ID ${id}`);
      const response = await axios.get(`${API_URL}/${id}`);
      console.log('FAQ fetched successfully:', response.data);
      return response.data.faq;
    } catch (error) {
      console.error(`Error fetching FAQ with ID ${id}:`, error);
      throw error;
    }
  }
};

export default faqService;