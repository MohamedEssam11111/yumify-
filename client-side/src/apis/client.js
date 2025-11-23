// API Client for Owner Portal
// Uses real HTTP calls to backend API

import axios from 'axios';

const API_BASE_URL =  'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include token from localStorage if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ownerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('ownerToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Owner API client
 * Provides a consistent interface for all owner portal API operations
 */
const ownerApi = {
  // ==================== Authentication ====================

  /**
   * Login as owner
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{token, user, role}>}
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/user/login', {
        email: credentials.identifier || credentials.email,
        password: credentials.password
      });
      
      // Store token if provided
      if (response.data.tokenGenerated) {
        localStorage.setItem('ownerToken', response.data.tokenGenerated);
      }
      
      return {
        token: response.data.tokenGenerated,
        owner: response.data.user,
        role: response.data.role
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  /**
   * Logout current owner
   * @returns {Promise<{success: boolean}>}
   */
  async logout() {
    try {
      await apiClient.post('/user/logout');
      localStorage.removeItem('ownerToken');
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local token
      localStorage.removeItem('ownerToken');
      return { success: true };
    }
  },

  /**
   * Get current owner profile
   * @returns {Promise<{owner, restaurant}>}
   */
  async me() {
    try {
      const response = await apiClient.get('/user/profile');
      return {
        owner: response.data,
        restaurant: response.data.restaurant
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  // ==================== Orders ====================

  /**
   * Get all orders with optional filters
   * @param {Object} filter - { status, search, dateFrom, dateTo }
   * @returns {Promise<Array>} Array of order objects
   */
  async getOrders(filter = {}) {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);
      if (filter.dateFrom) params.append('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.append('dateTo', filter.dateTo);
      
      const response = await apiClient.get(`/order?${params}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  /**
   * Get single order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order object
   */
  async getOrderById(id) {
    try {
      const response = await apiClient.get(`/order/trackOrder/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order object
   */
  async updateOrderStatus(id, status) {
    try {
      const response = await apiClient.patch(`/order/deliveredOrder/${id}`, {
        orderStatus: status
      });
      return response.data.order;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  // ==================== Inventory ====================

  /**
   * Get all inventory items (using food items as inventory)
   * @returns {Promise<Array>} Array of inventory items
   */
  async getInventory() {
    try {
      const response = await apiClient.get('/foods');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  },

  /**
   * Create new inventory item
   * @param {Object} item - Item data
   * @returns {Promise<Object>} Created item object
   */
  async createItem(item) {
    try {
      const formData = new FormData();
      formData.append('name', item.name);
      formData.append('description', item.description);
      formData.append('price', item.price);
      formData.append('category', item.category);
      
      if (item.image) {
        formData.append('image', item.image);
      }
      
      const response = await apiClient.post('/foods/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create item');
    }
  },

  /**
   * Update inventory item
   * @param {string} id - Item ID
   * @param {Object} item - Updated item data
   * @returns {Promise<Object>} Updated item object
   */
  async updateItem(id, item) {
    try {
      const response = await apiClient.put(`/foods/modify/${id}`, item);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update item');
    }
  },

  /**
   * Delete inventory item
   * @param {string} id - Item ID
   * @returns {Promise<{success: boolean}>}
   */
  async deleteItem(id) {
    try {
      await apiClient.delete(`/foods/delete/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete item');
    }
  },

  // ==================== Staff ====================

  /**
   * Get all staff members
   * Note: Staff routes are not in your backend yet, keeping mock for now
   * @returns {Promise<Array>} Array of staff objects
   */
  async getStaff() {
    try {
      // TODO: Implement staff routes in backend
      // const response = await apiClient.get('/staff');
      // return Array.isArray(response.data) ? response.data : [];
      console.warn('Staff API not implemented yet - returning empty array');
      return [];
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  },

  /**
   * Add new staff member
   * @param {Object} staffMember - Staff data
   * @returns {Promise<Object>} Created staff object
   */
  async addStaff(staffMember) {
    try {
      // TODO: Implement staff routes in backend
      // const response = await apiClient.post('/staff', staffMember);
      // return response.data;
      console.warn('Staff API not implemented yet');
      throw new Error('Staff API not implemented yet');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add staff');
    }
  },

  /**
   * Update staff member
   * @param {string} id - Staff ID
   * @param {Object} staffMember - Updated staff data
   * @returns {Promise<Object>} Updated staff object
   */
  async updateStaff(id, staffMember) {
    try {
      // TODO: Implement staff routes in backend
      // const response = await apiClient.put(`/staff/${id}`, staffMember);
      // return response.data;
      console.warn('Staff API not implemented yet');
      throw new Error('Staff API not implemented yet');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update staff');
    }
  },

  /**
   * Delete staff member
   * @param {string} id - Staff ID
   * @returns {Promise<{success: boolean}>}
   */
  async deleteStaff(id) {
    try {
      // TODO: Implement staff routes in backend
      // await apiClient.delete(`/staff/${id}`);
      // return { success: true };
      console.warn('Staff API not implemented yet');
      throw new Error('Staff API not implemented yet');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete staff');
    }
  },

  // ==================== Notifications ====================

  /**
   * Get all notifications
   * @returns {Promise<Array>} Array of notification objects
   */
  async getNotifications() {
    try {
      const response = await apiClient.get('/user/getNotification');
      return Array.isArray(response.data?.notifications) 
        ? response.data.notifications 
        : [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification object
   */
  async markNotificationRead(id) {
    try {
      const response = await apiClient.patch('/user/markAsRead', {
        notificationId: id
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<{success: boolean}>}
   */
  async markAllNotifications() {
    try {
      await apiClient.patch('/user/markAllAsRead');
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  // ==================== Feedback ====================

  /**
   * Get all customer feedback (using reviews)
   * @returns {Promise<Array>} Array of feedback objects
   */
  async getFeedback() {
    try {
      // Note: You might want to create a specific endpoint for owner to get all reviews
      // For now, this will need to be implemented based on your restaurant's foods
      console.warn('Feedback API needs specific implementation');
      return [];
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return [];
    }
  },

  // ==================== Suppliers ====================

  /**
   * Get all suppliers
   * Note: Supplier routes are not in your backend yet
   * @returns {Promise<Array>} Array of supplier objects
   */
  async getSuppliers() {
    try {
      // TODO: Implement supplier routes in backend
      console.warn('Supplier API not implemented yet - returning empty array');
      return [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  },

  /**
   * Send request to supplier
   * @param {string} supplierId - Supplier ID
   * @param {Object} request - Request data { items, notes }
   * @returns {Promise<Object>} Request object
   */
  async sendSupplierRequest(supplierId, request) {
    try {
      // TODO: Implement supplier routes in backend
      console.warn('Supplier API not implemented yet');
      throw new Error('Supplier API not implemented yet');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send supplier request');
    }
  },

  // ==================== Menu ====================

  /**
   * Get all menu items
   * @returns {Promise<Array>} Array of menu item objects
   */
  async getMenuItems() {
    try {
      const response = await apiClient.get('/foods');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  },

  /**
   * Create new menu item
   * @param {Object} item - Menu item data
   * @returns {Promise<Object>} Created menu item object
   */
  async createMenuItem(item) {
    try {
      const formData = new FormData();
      formData.append('name', item.name);
      formData.append('description', item.description);
      formData.append('price', item.price);
      formData.append('category', item.category);
      
      if (item.image) {
        formData.append('image', item.image);
      }
      
      const response = await apiClient.post('/foods/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create menu item');
    }
  },

  /**
   * Update menu item
   * @param {string} id - Menu item ID
   * @param {Object} item - Updated menu item data
   * @returns {Promise<Object>} Updated menu item object
   */
  async updateMenuItem(id, item) {
    try {
      const response = await apiClient.put(`/foods/modify/${id}`, item);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update menu item');
    }
  },

  /**
   * Delete menu item
   * @param {string} id - Menu item ID
   * @returns {Promise<{success: boolean}>}
   */
  async deleteMenuItem(id) {
    try {
      await apiClient.delete(`/foods/delete/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete menu item');
    }
  },

  // ==================== Event Subscription ====================

  /**
   * Subscribe to API events (new orders, notifications, etc.)
   * @param {Function} callback - Event callback function
   * @returns {Function} Unsubscribe function
   * 
   * TODO: Implement WebSocket or SSE for real-time updates
   */
  subscribe(callback) {
    console.warn('Real-time subscription not implemented yet');
    // TODO: Implement WebSocket connection
    // const ws = new WebSocket(`ws://localhost:5000/owner/events`);
    // ws.onmessage = (event) => callback(JSON.parse(event.data));
    // return () => ws.close();
    
    // Return dummy unsubscribe function for now
    return () => {};
  },
};

export default ownerApi;