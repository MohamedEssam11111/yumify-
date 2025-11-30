// API Client for Owner Portal
// Uses real HTTP calls to backend API

import axios from 'axios';
import userAPI from './user.api';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookie-based auth
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
    // Silently handle 401 errors (expected when user is not authenticated)
    if (error.response?.status === 401) {
      // Don't redirect automatically - let components handle it
      // Just clear the token if it exists
      localStorage.removeItem('ownerToken');
      // Suppress console logging for 401s
      error.suppressLog = true;
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

  async login(credentials) {
    try {
      const response = await apiClient.post('/user/login', {
        email: credentials.identifier || credentials.email,
        password: credentials.password
      });
      
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

  async logout() {
    try {
      await apiClient.post('/user/logout');
      localStorage.removeItem('ownerToken');
      return { success: true };
    } catch (error) {
      localStorage.removeItem('ownerToken');
      return { success: true };
    }
  },

  async me() {
    try {
      const response = await apiClient.get('/user/profile');
      return {
        owner: response?.data || null,
        restaurant: response?.data?.restaurant || null
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  // ==================== Orders ====================

  async getOrders(filter = {}) {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);
      if (filter.dateFrom) params.append('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.append('dateTo', filter.dateTo);
      
      const response = await apiClient.get(`/orders${params.toString() ? `?${params}` : ''}`);
      
      // Transform sub-orders data to match dashboard expectations
      const orders = Array.isArray(response.data) ? response.data : [];
      
      // Create a separate card for each sub-order
      const transformedOrders = orders.flatMap(order => {
        if (!order.subOrders || order.subOrders.length === 0) {
          return [];
        }
        
        return order.subOrders.map(subOrder => ({
          id: `${order._id}-${subOrder._id}`, // Composite ID for status updates
          mainOrderId: order._id,
          subOrderId: subOrder._id,
          orderNumber: order._id?.slice(-6) || 'N/A',
          customerName: order.customer?.name || 'Unknown',
          items: subOrder.items?.map(item => ({
            name: item.food?.name || 'Unknown',
            quantity: item.quantity || 0,
            price: item.food?.price || 0
          })) || [],
          total: subOrder.subtotal || 0,
          status: subOrder.status || 'pending',
          orderType: order.paymentMethod === 'cash' ? 'delivery' : 'pickup',
          createdAt: order.createdAt || new Date().toISOString(),
          deliveryAddress: order.deliveryAddress || '',
          restaurantName: subOrder.restaurant?.name || 'Your Restaurant'
        }));
      });
      
      console.log('Transformed orders:', transformedOrders); // Debug log
      return transformedOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  async getOrderById(id) {
    try {
      const response = await apiClient.get(`/order/trackOrder/${id}`);
      return response?.data || null;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    try {
      console.log('updateOrderStatus called with:', { orderId, newStatus });
      
      // Parse orderId to extract main order ID and sub-order ID
      // Format expected: "mainOrderId-subOrderId"
      if (!orderId || typeof orderId !== 'string') {
        throw new Error('Invalid order ID');
      }

      const parts = orderId.split('-');
      
      if (parts.length !== 2) {
        throw new Error(`Order ID must be in format: mainOrderId-subOrderId. Received: ${orderId}`);
      }

      const [mainOrderId, subOrderId] = parts;
      
      console.log('Parsed IDs:', { mainOrderId, subOrderId });

      // Update specific sub-order status
      const response = await apiClient.patch(
        `/orders/subOrder/${mainOrderId}/${subOrderId}/status`,
        { status: newStatus }
      );
      
      console.log('Update response:', response.data);
      return response?.data?.order || null;
    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || error.message || 'Failed to update order status');
    }
  },

  // ==================== Inventory ====================

  async getInventory() {
    try {
      // Get user profile to filter by restaurant
      let userProfile = null;
      try {
        const profileResponse = await apiClient.get('/user/profile');
        userProfile = profileResponse?.data;
      } catch (error) {
        // If not authenticated, return empty array
        if (error.response?.status === 401) return [];
        throw error;
      }

      const response = await apiClient.get('/foods');
      const foods = Array.isArray(response.data) ? response.data : [];
      // Transform to match dashboard expectations
      return foods
      .filter(food => userProfile?.restaurant?._id ? String(food.restaurant._id) === String(userProfile.restaurant._id) : true)
      .map(food => ({
        id: food?._id || food?.id,
        name: food?.name || 'Unknown',
        category: food?.category || 'Other',
        quantity: food?.availability ? 100 : 0, // Mock quantity based on availability
        unit: 'units',
        reorderLevel: 20,
        status: food?.availability ? 'in_stock' : 'out_of_stock',
        price: food?.price || 0,
        restaurant: food?.restaurant
      }));
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  },

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
      return response?.data || null;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create item');
    }
  },

  async updateItem(id, item) {
    try {
      const response = await apiClient.put(`/foods/modify/${id}`, item);
      return response?.data || null;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update item');
    }
  },

  async deleteItem(id) {
    try {
      await apiClient.delete(`/foods/delete/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete item');
    }
  },

  // ==================== Staff ====================

  async getStaff() {
    try {
      // Get user profile to filter by restaurant
      let userProfile = null;
      try {
        const profileResponse = await apiClient.get('/user/profile');
        userProfile = profileResponse?.data;
      } catch (error) {
        // If not authenticated, return empty array
        if (error.response?.status === 401) return [];
        throw error;
      }

      const response = await apiClient.get('/staff');
      return Array.isArray(response.data) 
        ? response.data.filter(staff => staff.restaurant === userProfile?.restaurant?._id || staff.restaurant === userProfile?.restaurant) 
        : [];
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  },

  async addStaff(staffMember) {
    try {
      const response = await apiClient.post('/staff/add', staffMember);
      return response?.data || null;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add staff');
    }
  },

  async updateStaff(id, staffMember) {
    try {
      const response = await apiClient.patch(`/staff/${id}`, staffMember);
      return response?.data || null;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update staff');
    }
  },

  async deleteStaff(id) {
    try {
      await apiClient.delete(`/staff/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete staff');
    }
  },

  // ==================== Notifications ====================

  async getNotifications() {
    try {
      const response = await apiClient.get('/notifications');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async markNotificationRead(id) {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response?.data || null;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  async markAllNotifications() {
    try {
      await apiClient.patch('/notifications/read-all');
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  // ==================== Feedback ====================

  async getFeedback() {
    try {
      // Get user profile to filter by restaurant
      let userProfile = null;
      try {
        const profileResponse = await apiClient.get('/user/profile');
        userProfile = profileResponse?.data;
      } catch (error) {
        // If not authenticated, return empty array
        if (error.response?.status === 401) return [];
        throw error;
      }

      const response = await apiClient.get('/reviews');
      const reviews = Array.isArray(response.data) ? response.data : [];
      // Transform to match dashboard expectations
      return reviews
      .filter(review => userProfile?.restaurant?._id ? review.restaurant === String(userProfile.restaurant._id) : true)
      .map(review => ({
        id: review?._id || review?.id,
        customerName: review?.user?.name || 'Anonymous',
        rating: review?.rating || 0,
        comment: review?.comment || '',
        orderNumber: 'N/A',
        createdAt: review?.createdAt || new Date().toISOString(),
        timestamp: review?.createdAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return [];
    }
  },

  // ==================== Suppliers ====================

  async getSuppliers() {
    try {
      // Suppliers not implemented yet - return empty array
      console.warn('Supplier API not implemented yet');
      return [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  },

  async sendSupplierRequest(supplierId, request) {
    try {
      console.warn('Supplier API not implemented yet');
      throw new Error('Supplier API not implemented yet');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send supplier request');
    }
  },

  // ==================== Menu ====================

  async getMenuItems() {
    try {
      const response = await apiClient.get('/foods');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  },

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
      return response?.data || null;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create menu item');
    }
  },

  async updateMenuItem(id, item) {
    try {
      const response = await apiClient.put(`/foods/modify/${id}`, item);
      return response?.data || null;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update menu item');
    }
  },

  async deleteMenuItem(id) {
    try {
      await apiClient.delete(`/foods/delete/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete menu item');
    }
  },

  // ==================== Bookings ====================

  async getBookings() {
    try {
      const response = await apiClient.get('/bookings');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  // ==================== Event Subscription ====================

  subscribe(callback) {
    console.warn('Real-time subscription not implemented yet');
    // TODO: Implement WebSocket or polling
    return () => {};
  },

  // ==================== Simulation (for testing) ====================

  async simulateNewOrder() {
    console.warn('Simulation not available with real API');
    return null;
  },

  async simulateNewNotification() {
    console.warn('Simulation not available with real API');
    return null;
  },
};

export default ownerApi;