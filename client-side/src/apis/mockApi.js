// Mock API for Owner Portal
// TODO: Replace all functions with real HTTP calls to backend API

// Utility function to simulate network latency
const delay = (ms = Math.random() * 500 + 300) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// In-memory data storage
let mockData = {
  orders: [],
  inventory: [],
  staff: [],
  notifications: [],
  feedback: [],
  suppliers: [],
  menu: [],
  currentToken: null,
  currentOwner: null,
};

// Event subscribers
let subscribers = [];

// Event subscription system
const subscribe = (callback) => {
  subscribers.push(callback);
  return () => unsubscribe(callback);
};

const unsubscribe = (callback) => {
  subscribers = subscribers.filter((sub) => sub !== callback);
};

const emitEvent = (event) => {
  subscribers.forEach((callback) => {
    try {
      callback(event);
    } catch (error) {
      console.error("Error in event subscriber:", error);
    }
  });
};

// Initialize mock API with dummy data
const initMockApi = () => {
  // Restore session from localStorage if token exists (for persistence across page refreshes)
  const storedToken = localStorage.getItem("owner_token");
  if (storedToken) {
    mockData.currentToken = storedToken;
    mockData.currentOwner = {
      id: "owner_1",
      name: "Ahmed Restaurant Owner",
      email: "owner@restaurant.com",
      restaurantId: "restaurant_1",
    };
  }

  // Preload dummy orders
  mockData.orders = [
    {
      id: "order_1",
      orderNumber: "ORD-001",
      customerName: "Ahmed Ali",
      customerPhone: "+20 123 456 7890",
      items: [
        { name: "Beef Burger", quantity: 2, price: 45 },
        { name: "French Fries", quantity: 1, price: 15 },
      ],
      total: 105,
      status: "pending",
      orderType: "delivery",
      address: "123 Main St, Cairo",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      estimatedTime: 30,
    },
    {
      id: "order_2",
      orderNumber: "ORD-002",
      customerName: "Sarah Mohamed",
      customerPhone: "+20 987 654 3210",
      items: [{ name: "Chicken Shawarma", quantity: 1, price: 35 }],
      total: 35,
      status: "preparing",
      orderType: "pickup",
      address: "",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      estimatedTime: 20,
    },
    {
      id: "order_3",
      orderNumber: "ORD-003",
      customerName: "Omar Hassan",
      customerPhone: "+20 555 123 4567",
      items: [
        { name: "Pizza Margherita", quantity: 1, price: 60 },
        { name: "Coca Cola", quantity: 2, price: 10 },
      ],
      total: 80,
      status: "ready",
      orderType: "delivery",
      address: "456 Park Ave, Cairo",
      createdAt: new Date(Date.now() - 900000).toISOString(),
      estimatedTime: 15,
    },
    {
      id: "order_4",
      orderNumber: "ORD-004",
      customerName: "Fatima Ibrahim",
      customerPhone: "+20 111 222 3333",
      items: [{ name: "Salad Bowl", quantity: 3, price: 25 }],
      total: 75,
      status: "completed",
      orderType: "pickup",
      address: "",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      estimatedTime: 0,
    },
    {
      id: "order_5",
      orderNumber: "ORD-005",
      customerName: "Youssef Mahmoud",
      customerPhone: "+20 444 555 6666",
      items: [
        { name: "Grilled Chicken", quantity: 2, price: 50 },
        { name: "Rice", quantity: 2, price: 12 },
      ],
      total: 124,
      status: "cancelled",
      orderType: "delivery",
      address: "789 Oak St, Cairo",
      createdAt: new Date(Date.now() - 5400000).toISOString(),
      estimatedTime: 0,
    },
  ];

  // Preload dummy inventory items
  mockData.inventory = [
    {
      id: "item_1",
      name: "Beef Patty",
      category: "Meat",
      quantity: 50,
      unit: "kg",
      lowStockThreshold: 10,
      status: "in_stock",
      lastUpdated: new Date(Date.now() - 86400000).toISOString(),
      supplier: "Fresh Meat Co.",
    },
    {
      id: "item_2",
      name: "Chicken Breast",
      category: "Meat",
      quantity: 30,
      unit: "kg",
      lowStockThreshold: 15,
      status: "low_stock",
      lastUpdated: new Date(Date.now() - 172800000).toISOString(),
      supplier: "Poultry Farm Ltd.",
    },
    {
      id: "item_3",
      name: "Tomatoes",
      category: "Vegetables",
      quantity: 100,
      unit: "kg",
      lowStockThreshold: 20,
      status: "in_stock",
      lastUpdated: new Date(Date.now() - 43200000).toISOString(),
      supplier: "Green Fields",
    },
    {
      id: "item_4",
      name: "Lettuce",
      category: "Vegetables",
      quantity: 5,
      unit: "kg",
      lowStockThreshold: 10,
      status: "out_of_stock",
      lastUpdated: new Date(Date.now() - 259200000).toISOString(),
      supplier: "Fresh Produce Co.",
    },
    {
      id: "item_5",
      name: "Cheese",
      category: "Dairy",
      quantity: 25,
      unit: "kg",
      lowStockThreshold: 8,
      status: "in_stock",
      lastUpdated: new Date(Date.now() - 7200000).toISOString(),
      supplier: "Dairy Delights",
    },
    {
      id: "item_6",
      name: "Bread Buns",
      category: "Bakery",
      quantity: 200,
      unit: "pieces",
      lowStockThreshold: 50,
      status: "in_stock",
      lastUpdated: new Date(Date.now() - 3600000).toISOString(),
      supplier: "Bakery Express",
    },
  ];

  // Preload dummy menu items
  mockData.menu = [
    {
      id: "menu_1",
      name: "Caesar Salad",
      description: "Fresh romaine, croutons, and parmesan.",
      price: 9.50,
      category: "Appetizers",
      imageUrl: "",
      available: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "menu_2",
      name: "Chocolate Lava Cake",
      description: "Warm molten chocolate cake.",
      price: 7.99,
      category: "Desserts",
      imageUrl: "",
      available: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "menu_3",
      name: "Classic Cheeseburger",
      description: "Juicy beef patty with cheddar cheese.",
      price: 12.99,
      category: "Main Course",
      imageUrl: "",
      available: true,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: "menu_4",
      name: "Iced Coffee",
      description: "Cold brewed, refreshing coffee.",
      price: 4.50,
      category: "Drinks",
      imageUrl: "",
      available: true,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
      id: "menu_5",
      name: "Pepperoni Pizza",
      description: "Classic pepperoni and mozzarella.",
      price: 14.99,
      category: "Main Course",
      imageUrl: "",
      available: true,
      createdAt: new Date(Date.now() - 432000000).toISOString(),
    },
  ];

  // Preload dummy staff members
  mockData.staff = [
    {
      id: "staff_1",
      name: "Mohamed Salah",
      email: "mohamed.salah@restaurant.com",
      phone: "+20 100 123 4567",
      role: "chef",
      position: "Head Chef",
      shift: "morning",
      status: "active",
      hireDate: "2023-01-15",
      salary: 8000,
    },
    {
      id: "staff_2",
      name: "Amina Mostafa",
      email: "amina.mostafa@restaurant.com",
      phone: "+20 200 234 5678",
      role: "waiter",
      position: "Senior Waiter",
      shift: "evening",
      status: "active",
      hireDate: "2023-03-20",
      salary: 5000,
    },
    {
      id: "staff_3",
      name: "Khaled Ahmed",
      email: "khaled.ahmed@restaurant.com",
      phone: "+20 300 345 6789",
      role: "delivery",
      position: "Delivery Driver",
      shift: "flexible",
      status: "active",
      hireDate: "2023-05-10",
      salary: 4500,
    },
    {
      id: "staff_4",
      name: "Nour Hassan",
      email: "nour.hassan@restaurant.com",
      phone: "+20 400 456 7890",
      role: "manager",
      position: "Assistant Manager",
      shift: "full_day",
      status: "active",
      hireDate: "2022-11-05",
      salary: 10000,
    },
    {
      id: "staff_5",
      name: "Hassan Ali",
      email: "hassan.ali@restaurant.com",
      phone: "+20 500 567 8901",
      role: "chef",
      position: "Sous Chef",
      shift: "evening",
      status: "on_leave",
      hireDate: "2023-07-01",
      salary: 6500,
    },
  ];

  // Preload dummy notifications
  mockData.notifications = [
    {
      id: "notif_1",
      type: "order",
      title: "New Order Received",
      message: "Order ORD-001 from Ahmed Ali",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      relatedId: "order_1",
    },
    {
      id: "notif_2",
      type: "inventory",
      title: "Low Stock Alert",
      message: "Chicken Breast is running low (30 kg remaining)",
      read: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      relatedId: "item_2",
    },
    {
      id: "notif_3",
      type: "order",
      title: "Order Status Changed",
      message: "Order ORD-002 is now being prepared",
      read: true,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      relatedId: "order_2",
    },
    {
      id: "notif_4",
      type: "feedback",
      title: "New Customer Review",
      message: "5-star rating from Sarah Mohamed",
      read: false,
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      relatedId: "feedback_1",
    },
    {
      id: "notif_5",
      type: "inventory",
      title: "Out of Stock",
      message: "Lettuce is out of stock",
      read: true,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      relatedId: "item_4",
    },
  ];

  // Preload dummy customer feedback
  mockData.feedback = [
    {
      id: "feedback_1",
      customerName: "Sarah Mohamed",
      orderNumber: "ORD-002",
      rating: 5,
      comment: "Excellent food quality and fast delivery!",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      status: "unread",
    },
    {
      id: "feedback_2",
      customerName: "Ahmed Ali",
      orderNumber: "ORD-001",
      rating: 4,
      comment: "Good taste but delivery was a bit late",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      status: "read",
    },
    {
      id: "feedback_3",
      customerName: "Omar Hassan",
      orderNumber: "ORD-003",
      rating: 5,
      comment: "Perfect! Will order again soon",
      createdAt: new Date(Date.now() - 900000).toISOString(),
      status: "unread",
    },
    {
      id: "feedback_4",
      customerName: "Fatima Ibrahim",
      orderNumber: "ORD-004",
      rating: 3,
      comment: "Food was okay, but could be better",
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      status: "read",
    },
  ];

  // Preload dummy suppliers
  mockData.suppliers = [
    {
      id: "supplier_1",
      name: "Fresh Meat Co.",
      contactPerson: "Mahmoud Sayed",
      email: "contact@freshmeat.com",
      phone: "+20 123 456 7890",
      address: "Industrial Zone, Cairo",
      itemsSupplied: ["Beef Patty", "Lamb"],
      status: "active",
      rating: 4.5,
      lastOrder: "2024-01-10",
    },
    {
      id: "supplier_2",
      name: "Poultry Farm Ltd.",
      contactPerson: "Ali Mohamed",
      email: "orders@poultryfarm.com",
      phone: "+20 987 654 3210",
      address: "Agricultural Road, Giza",
      itemsSupplied: ["Chicken Breast", "Chicken Wings"],
      status: "active",
      rating: 4.8,
      lastOrder: "2024-01-12",
    },
    {
      id: "supplier_3",
      name: "Green Fields",
      contactPerson: "Nada Ibrahim",
      email: "info@greenfields.com",
      phone: "+20 555 111 2222",
      address: "Farm Area, Delta",
      itemsSupplied: ["Tomatoes", "Onions", "Peppers"],
      status: "active",
      rating: 4.2,
      lastOrder: "2024-01-11",
    },
    {
      id: "supplier_4",
      name: "Dairy Delights",
      contactPerson: "Youssef Hassan",
      email: "sales@dairydelights.com",
      phone: "+20 333 444 5555",
      address: "Dairy Street, Alexandria",
      itemsSupplied: ["Cheese", "Milk", "Butter"],
      status: "active",
      rating: 4.7,
      lastOrder: "2024-01-13",
    },
    {
      id: "supplier_5",
      name: "Bakery Express",
      contactPerson: "Fatma Ali",
      email: "orders@bakeryexpress.com",
      phone: "+20 666 777 8888",
      address: "Bakery District, Cairo",
      itemsSupplied: ["Bread Buns", "Pizza Dough", "Pita Bread"],
      status: "active",
      rating: 4.6,
      lastOrder: "2024-01-09",
    },
  ];

  console.log("Mock API initialized with dummy data");
};

// Authentication module
const auth = {
  // TODO: Replace with POST /api/owner/auth/login
  async login({ identifier, password }) {
    await delay();

    if (!identifier || !password) {
      throw new Error("Identifier and password are required");
    }

    // Mock successful login for any non-empty credentials
    const mockOwner = {
      id: "owner_1",
      name: "Ahmed Restaurant Owner",
      email: "owner@restaurant.com",
      restaurantId: "restaurant_1",
    };

    const mockRestaurant = {
      id: "restaurant_1",
      name: "Delicious Eats",
      address: "123 Food Street, Cairo",
      phone: "+20 123 456 7890",
      cuisine: "Mixed",
      status: "active",
    };

    const token = "owner_dummy_token";

    mockData.currentToken = token;
    mockData.currentOwner = mockOwner;

    return {
      token,
      owner: mockOwner,
      restaurant: mockRestaurant,
    };
  },

  // TODO: Replace with POST /api/owner/auth/logout
  async logout() {
    await delay();

    mockData.currentToken = null;
    mockData.currentOwner = null;

    return { success: true };
  },

  // TODO: Replace with GET /api/owner/auth/me
  async me() {
    await delay();

    // Check localStorage if in-memory token is not set (e.g., after page refresh)
    if (!mockData.currentToken) {
      const storedToken = localStorage.getItem("owner_token");
      if (storedToken) {
        // Restore session from localStorage
        mockData.currentToken = storedToken;
        // Restore owner data (same mock owner for all sessions)
        mockData.currentOwner = {
          id: "owner_1",
          name: "Ahmed Restaurant Owner",
          email: "owner@restaurant.com",
          restaurantId: "restaurant_1",
        };
      }
    }

    if (!mockData.currentToken) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    const mockRestaurant = {
      id: "restaurant_1",
      name: "Delicious Eats",
      address: "123 Food Street, Cairo",
      phone: "+20 123 456 7890",
      cuisine: "Mixed",
      status: "active",
    };

    return {
      owner: mockData.currentOwner,
      restaurant: mockRestaurant,
    };
  },
};

// Orders module
const orders = {
  // TODO: Replace with GET /api/owner/orders?filter=...
  async getOrders(filter = {}) {
    await delay();

    let filteredOrders = [...mockData.orders];

    // Apply filters
    if (filter.status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === filter.status
      );
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower)
      );
    }

    if (filter.dateFrom) {
      filteredOrders = filteredOrders.filter(
        (order) => new Date(order.createdAt) >= new Date(filter.dateFrom)
      );
    }

    if (filter.dateTo) {
      filteredOrders = filteredOrders.filter(
        (order) => new Date(order.createdAt) <= new Date(filter.dateTo)
      );
    }

    // Sort by newest first
    filteredOrders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return filteredOrders;
  },

  // TODO: Replace with GET /api/owner/orders/:id
  async getOrderById(id) {
    await delay();

    const order = mockData.orders.find((o) => o.id === id);
    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  },

  // TODO: Replace with PATCH /api/owner/orders/:id/status
  async updateOrderStatus(id, status) {
    await delay();

    const order = mockData.orders.find((o) => o.id === id);
    if (!order) {
      throw new Error("Order not found");
    }

    const validStatuses = [
      "pending",
      "preparing",
      "ready",
      "out_for_delivery",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid order status");
    }

    order.status = status;

    // Emit event for order status change
    emitEvent({
      type: "order_status_changed",
      orderId: id,
      status,
      order,
    });

    return order;
  },
};

// Inventory module
const inventory = {
  // TODO: Replace with GET /api/owner/inventory
  async getItems() {
    await delay();

    return [...mockData.inventory];
  },

  // TODO: Replace with POST /api/owner/inventory
  async createItem(item) {
    await delay();

    const newItem = {
      id: `item_${Date.now()}`,
      ...item,
      lastUpdated: new Date().toISOString(),
      status: item.status || "in_stock",
    };

    mockData.inventory.push(newItem);

    // Emit event for new inventory item
    emitEvent({
      type: "inventory_item_added",
      item: newItem,
    });

    return newItem;
  },

  // TODO: Replace with PUT /api/owner/inventory/:id
  async updateItem(id, updates) {
    await delay();

    const itemIndex = mockData.inventory.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      throw new Error("Item not found");
    }

    const updatedItem = {
      ...mockData.inventory[itemIndex],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    mockData.inventory[itemIndex] = updatedItem;

    // Emit event for inventory update
    emitEvent({
      type: "inventory_item_updated",
      item: updatedItem,
    });

    return updatedItem;
  },

  // TODO: Replace with DELETE /api/owner/inventory/:id
  async deleteItem(id) {
    await delay();

    const itemIndex = mockData.inventory.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      throw new Error("Item not found");
    }

    const deletedItem = mockData.inventory[itemIndex];
    mockData.inventory.splice(itemIndex, 1);

    return { success: true, deletedItem };
  },
};

// Staff module
const staff = {
  // TODO: Replace with GET /api/owner/staff
  async getStaff() {
    await delay();

    return [...mockData.staff];
  },

  // TODO: Replace with POST /api/owner/staff
  async addStaff(staffMember) {
    await delay();

    const newStaff = {
      id: `staff_${Date.now()}`,
      ...staffMember,
      status: staffMember.status || "active",
      hireDate: staffMember.hireDate || new Date().toISOString().split("T")[0],
    };

    mockData.staff.push(newStaff);

    return newStaff;
  },

  // TODO: Replace with PUT /api/owner/staff/:id
  async updateStaff(id, updates) {
    await delay();

    const staffIndex = mockData.staff.findIndex((s) => s.id === id);
    if (staffIndex === -1) {
      throw new Error("Staff member not found");
    }

    const updatedStaff = {
      ...mockData.staff[staffIndex],
      ...updates,
    };

    mockData.staff[staffIndex] = updatedStaff;

    return updatedStaff;
  },

  // TODO: Replace with DELETE /api/owner/staff/:id
  async deleteStaff(id) {
    await delay();

    const staffIndex = mockData.staff.findIndex((s) => s.id === id);
    if (staffIndex === -1) {
      throw new Error("Staff member not found");
    }

    const deletedStaff = mockData.staff[staffIndex];
    mockData.staff.splice(staffIndex, 1);

    return { success: true, deletedStaff };
  },
};

// Notifications module
const notifications = {
  // TODO: Replace with GET /api/owner/notifications
  async getNotifications() {
    await delay();

    // Sort by newest first
    return [...mockData.notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  // TODO: Replace with PATCH /api/owner/notifications/:id/read
  async markRead(id) {
    await delay();

    const notification = mockData.notifications.find((n) => n.id === id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    notification.read = true;

    return notification;
  },

  // TODO: Replace with PATCH /api/owner/notifications/read-all
  async markAllRead() {
    await delay();

    mockData.notifications.forEach((notification) => {
      notification.read = true;
    });

    return { success: true };
  },

  // TODO: Replace with POST /api/owner/notifications/simulate (or remove in production)
  async simulateNewNotification() {
    await delay();

    const notificationTypes = ["order", "inventory", "feedback", "system"];
    const type =
      notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

    let title, message, relatedId;

    switch (type) {
      case "order":
        title = "New Order Received";
        const customerNames = ["Ahmed", "Sarah", "Omar", "Fatima"];
        const randomCustomer =
          customerNames[Math.floor(Math.random() * customerNames.length)];
        message = `New order from ${randomCustomer}`;
        relatedId = `order_${Date.now()}`;
        break;
      case "inventory":
        title = "Low Stock Alert";
        message = "One of your inventory items is running low";
        relatedId = `item_${Date.now()}`;
        break;
      case "feedback":
        title = "New Customer Review";
        message = "You have received a new customer feedback";
        relatedId = `feedback_${Date.now()}`;
        break;
      default:
        title = "System Notification";
        message = "Important system update";
        relatedId = null;
    }

    const newNotification = {
      id: `notif_${Date.now()}`,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      relatedId,
    };

    mockData.notifications.unshift(newNotification);

    // Emit event for new notification
    emitEvent({
      type: "new_notification",
      notification: newNotification,
    });

    return newNotification;
  },
};

// Feedback module
const feedback = {
  // TODO: Replace with GET /api/owner/feedback
  async getFeedback() {
    await delay();

    // Sort by newest first
    return [...mockData.feedback].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },
};

// Suppliers module
const suppliers = {
  // TODO: Replace with GET /api/owner/suppliers
  async getSuppliers() {
    await delay();

    return [...mockData.suppliers];
  },

  // TODO: Replace with POST /api/owner/suppliers/:id/requests
  async sendRequest(supplierId, request) {
    await delay();

    const supplier = mockData.suppliers.find((s) => s.id === supplierId);
    if (!supplier) {
      throw new Error("Supplier not found");
    }

    const requestRecord = {
      id: `request_${Date.now()}`,
      supplierId,
      supplierName: supplier.name,
      items: request.items,
      requestedDate: new Date().toISOString(),
      status: "pending",
      notes: request.notes || "",
    };

    // In a real implementation, this would be stored separately
    // For mock, we'll just return the request record
    return requestRecord;
  },
};

// Helper function to simulate new order (for testing)
const simulateNewOrder = () => {
  const orderNumber = `ORD-${String(mockData.orders.length + 1).padStart(3, "0")}`;
  const customerNames = ["Ahmed Ali", "Sarah Mohamed", "Omar Hassan"];
  const randomCustomer =
    customerNames[Math.floor(Math.random() * customerNames.length)];

  const newOrder = {
    id: `order_${Date.now()}`,
    orderNumber,
    customerName: randomCustomer,
    customerPhone: `+20 ${Math.floor(Math.random() * 900000000) + 100000000}`,
    items: [
      {
        name: "Beef Burger",
        quantity: Math.floor(Math.random() * 3) + 1,
        price: 45,
      },
    ],
    total: 45,
    status: "pending",
    orderType: Math.random() > 0.5 ? "delivery" : "pickup",
    address: "123 Main St, Cairo",
    createdAt: new Date().toISOString(),
    estimatedTime: 30,
  };

  mockData.orders.unshift(newOrder);

  // Create notification for new order
  const notification = {
    id: `notif_${Date.now()}`,
    type: "order",
    title: "New Order Received",
    message: `Order ${orderNumber} from ${randomCustomer}`,
    read: false,
    createdAt: new Date().toISOString(),
    relatedId: newOrder.id,
  };

  mockData.notifications.unshift(notification);

  // Emit events
  emitEvent({
    type: "new_order",
    order: newOrder,
  });

  emitEvent({
    type: "new_notification",
    notification,
  });

  return newOrder;
};

// Menu module
const menu = {
  // TODO: Replace with GET /api/owner/menu
  async getItems() {
    await delay();
    return mockData.menu;
  },

  // TODO: Replace with POST /api/owner/menu
  async createItem(item) {
    await delay();

    const newItem = {
      id: `menu_${Date.now()}`,
      name: item.name,
      description: item.description || "",
      price: parseFloat(item.price) || 0,
      category: item.category || "Main Course",
      imageUrl: item.imageUrl || "",
      available: item.available !== false,
      createdAt: new Date().toISOString(),
    };

    mockData.menu.push(newItem);
    return newItem;
  },

  // TODO: Replace with PUT /api/owner/menu/:id
  async updateItem(id, updates) {
    await delay();

    const index = mockData.menu.findIndex((item) => item.id === id);
    if (index === -1) {
      const error = new Error("Menu item not found");
      error.status = 404;
      throw error;
    }

    mockData.menu[index] = {
      ...mockData.menu[index],
      ...updates,
      price: updates.price !== undefined ? parseFloat(updates.price) : mockData.menu[index].price,
    };

    return mockData.menu[index];
  },

  // TODO: Replace with DELETE /api/owner/menu/:id
  async deleteItem(id) {
    await delay();

    const index = mockData.menu.findIndex((item) => item.id === id);
    if (index === -1) {
      const error = new Error("Menu item not found");
      error.status = 404;
      throw error;
    }

    mockData.menu.splice(index, 1);
    return { success: true };
  },
};

// Export default object with all modules and utilities
export default {
  initMockApi,
  auth,
  orders,
  inventory,
  staff,
  notifications,
  feedback,
  suppliers,
  menu,
  subscribe,
  unsubscribe,
  // Expose simulateNewOrder for testing/demo purposes
  simulateNewOrder,
};

