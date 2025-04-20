import apiClient from './ApiClient';

// Define university interface
export interface University {
  id: string;
  name: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

// University services
const UniversityService = {
  // Get all universities
  getAll: async (): Promise<University[]> => {
    try {
      const response = await apiClient.get('/api/v1/universities');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching universities:', error);
      throw error.response?.data || error;
    }
  },

  // Get university by ID
  getById: async (id: string): Promise<University> => {
    try {
      const response = await apiClient.get(`/api/v1/universities/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Error fetching university with ID ${id}:`, error);
      throw error.response?.data || error;
    }
  },
  
  // Search universities by name
  search: async (query: string): Promise<University[]> => {
    try {
      const response = await apiClient.get('/api/v1/universities/search', {
        params: { query }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error searching universities:', error);
      throw error.response?.data || error;
    }
  }
};

export default UniversityService; 