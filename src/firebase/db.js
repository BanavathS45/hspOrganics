// HSP Organics Database Service (Supports real Firebase + High-Fidelity LocalStorage Fallback)
import { isMock, db, auth, googleProvider } from './config';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, onSnapshot, orderBy, Timestamp
} from 'firebase/firestore';

// Initial preloaded database assets (Premium organic groceries)
const INITIAL_PRODUCTS = [
  // Vegetables
  {
    id: 'prod-veg-1',
    name: 'Organic Leafy Spinach (Palak)',
    category: 'Vegetables',
    price: 45,
    unit: '250g',
    stock: 45,
    description: 'Freshly harvested organic leafy spinach. Grown without synthetic pesticides, packed with iron, vitamins, and minerals. Perfect for healthy green smoothies, salads, or traditional curries.',
    organicInfo: '100% Certified Organic, Non-GMO, Pesticide-Free, Locally Sourced.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: true
  },
  {
    id: 'prod-veg-2',
    name: 'Heirloom Cherry Tomatoes',
    category: 'Vegetables',
    price: 85,
    unit: '500g',
    stock: 20,
    description: 'Sweet, juicy, and vibrant vine-ripened heirloom cherry tomatoes. Excellent source of vitamin C and antioxidants. Great for salads, roasting, or snacking.',
    organicInfo: 'Hydroponically grown under natural sunlight using organic nutrients.',
    image: 'https://images.unsplash.com/photo-1561131248-c52d89bad5af?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: false
  },
  {
    id: 'prod-veg-3',
    name: 'Fresh Hydroponic Cucumbers',
    category: 'Vegetables',
    price: 55,
    unit: '1kg',
    stock: 30,
    description: 'Crunchy, refreshing, and seedless hydroponic cucumbers. High water content makes them perfect for summer hydration, salads, and detox juices.',
    organicInfo: 'Zero chemical pesticides. Grown in clean mineralized water.',
    image: 'https://images.unsplash.com/photo-1587411768538-e95182755e5f?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: true
  },
  {
    id: 'prod-veg-4',
    name: 'Organic Farm Potatoes',
    category: 'Vegetables',
    price: 40,
    unit: '1kg',
    stock: 120,
    description: 'Fresh organic potatoes directly sourced from local soil. Earthy flavor, rich in potassium and complex carbohydrates.',
    organicInfo: 'Soil-grown in naturally fertilized organic farms.',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: false
  },
  {
    id: 'prod-veg-5',
    name: 'Tender Lady Finger (Okra)',
    category: 'Vegetables',
    price: 35,
    unit: '500g',
    stock: 15,
    description: 'Fresh, slender, and tender lady finger (okra). Crisp texture, excellent for traditional stir-fries and rich in dietary fibers.',
    organicInfo: 'Sourced from cooperative organic farms in Southern India.',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: false
  },
  
  // Fruits
  {
    id: 'prod-fruit-1',
    name: 'Premium Alphonso Mangoes',
    category: 'Fruits',
    price: 699,
    unit: '1 Dozen (12 pcs)',
    stock: 12,
    description: 'The King of Mangoes! Incredibly aromatic, sweet, and pulpy Devgad/Ratnagiri Alphonso mangoes. Naturally ripened using hay.',
    organicInfo: 'GI-Tagged authentic mangoes ripened chemical-free.',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: true
  },
  {
    id: 'prod-fruit-2',
    name: 'Fresh Organic Bananas (Yelakki)',
    category: 'Fruits',
    price: 75,
    unit: '1 Dozen (12 pcs)',
    stock: 50,
    description: 'Small, sweet, and aromatic Yelakki bananas. Loaded with instant energy, dietary fibers, and essential vitamins.',
    organicInfo: 'Ripened using natural temperature control, never carbide treated.',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: true
  },
  {
    id: 'prod-fruit-3',
    name: 'Sweet Crisp Red Apples',
    category: 'Fruits',
    price: 190,
    unit: '1kg (4-5 pcs)',
    stock: 25,
    description: 'Crisp, sweet, and wax-free red apples from Shimla orchards. Fresh, juicy, and ideal for healthy snacking.',
    organicInfo: 'Unwaxed, hand-picked, washed in ozonated water.',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: false
  },
  {
    id: 'prod-fruit-4',
    name: 'Fresh Sweet Pomegranate (Anar)',
    category: 'Fruits',
    price: 240,
    unit: '1kg',
    stock: 18,
    description: 'Juicy, deep red ruby arils with sweet taste. High in antioxidants, vitamin K, and potassium.',
    organicInfo: 'Directly sourced from organic orchard farms of Maharashtra.',
    image: 'https://images.unsplash.com/photo-1614735249478-f71694f4c27a?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: false
  },

  // Oils
  {
    id: 'prod-oil-1',
    name: 'Cold-Pressed Virgin Coconut Oil',
    category: 'Oils',
    price: 340,
    unit: '1 Liter',
    stock: 40,
    description: 'Pure, extra-virgin coconut oil extracted via cold-pressing fresh coconut milk (wood-pressed/Kachi Ghani). Highly nutritious and excellent for cooking, skin, and hair care.',
    organicInfo: 'Sulphur-free coconuts, cold-processed under 45 degrees Celsius.',
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: true
  },
  {
    id: 'prod-oil-2',
    name: 'Wood-Pressed Groundnut Oil',
    category: 'Oils',
    price: 270,
    unit: '1 Liter',
    stock: 60,
    description: 'Traditional wood-pressed groundnut (peanut) oil. High smoke point, rich in Vitamin E and monounsaturated fats. Retains natural nutty aroma and flavor.',
    organicInfo: 'Zero chemical refining, filtered naturally through sedimentation.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: true
  },

  // Cool Drinks
  {
    id: 'prod-drink-1',
    name: 'Organic Tender Coconut Water',
    category: 'Cool Drinks',
    price: 55,
    unit: '1 Piece',
    stock: 100,
    description: 'Sweet, natural, and electrolyte-rich fresh tender coconut water. Harvested fresh daily and served in raw shell or bio-degradable bottle.',
    organicInfo: 'Grown on organic coastlands, chemical fertilizer free.',
    image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600&auto=format&fit=crop&q=80',
    featured: true,
    bestSeller: true
  },
  {
    id: 'prod-drink-2',
    name: 'Pure Hibiscus Iced Tea',
    category: 'Cool Drinks',
    price: 75,
    unit: '350ml',
    stock: 25,
    description: 'Tart, ruby-red herbal infusion of real organic hibiscus flowers sweetened with raw organic honey. Extremely refreshing and rich in Vitamin C.',
    organicInfo: 'Brewed from dried organic petals, sugar-free, sweetened with pure honey.',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: false
  },
  {
    id: 'prod-drink-3',
    name: 'Tangy Organic Mint Lemonade',
    category: 'Cool Drinks',
    price: 50,
    unit: '350ml',
    stock: 35,
    description: 'Zesty lemon juice infused with fresh mint leaves and organic brown sugar. Perfect cool drink for detoxification and digestion.',
    organicInfo: 'Fresh hand-squeezed lemons, organic mint, organic unrefined sugar.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    featured: false,
    bestSeller: true
  }
];

// Seed initial state in local storage helper
const initLocalStorageDB = () => {
  if (!localStorage.getItem('hsp_products')) {
    localStorage.setItem('hsp_products', JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem('hsp_orders')) {
    localStorage.setItem('hsp_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('hsp_notifications')) {
    localStorage.setItem('hsp_notifications', JSON.stringify([
      {
        id: 'noti-init',
        title: 'Welcome to HSP Organics!',
        body: 'Fresh vegetables, fruits, and cold pressed oils are now available. Get free delivery on your first order.',
        createdAt: new Date().toISOString(),
        read: false,
        type: 'general',
        userId: 'all'
      }
    ]));
  }
  if (!localStorage.getItem('hsp_users')) {
    localStorage.setItem('hsp_users', JSON.stringify([
      {
        uid: 'admin-default',
        email: 'admin@hsporganics.com',
        displayName: 'Master Admin',
        role: 'admin',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      },
      {
        uid: 'user-demo',
        email: 'customer@gmail.com',
        displayName: 'John Doe',
        role: 'customer',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
      }
    ]));
  }
  if (!localStorage.getItem('hsp_addresses')) {
    localStorage.setItem('hsp_addresses', JSON.stringify([
      {
        id: 'addr-1',
        userId: 'user-demo',
        name: 'Home',
        addressLine: 'Block 4A, Green Meadows Apartment, Near Outer Ring Road',
        city: 'Bengaluru',
        postalCode: '560103',
        lat: 12.9234,
        lng: 77.6854,
        isDefault: true
      },
      {
        id: 'addr-2',
        userId: 'user-demo',
        name: 'Office',
        addressLine: 'Ecospace Business Park, Bellandur, Phase 3',
        city: 'Bengaluru',
        postalCode: '560103',
        lat: 12.9344,
        lng: 77.6744,
        isDefault: false
      }
    ]));
  }
  if (!localStorage.getItem('hsp_wishlist')) {
    localStorage.setItem('hsp_wishlist', JSON.stringify([]));
  }
  if (!localStorage.getItem('hsp_coupons')) {
    localStorage.setItem('hsp_coupons', JSON.stringify([
      { id: 'cpn-1', code: 'ORGANIC20', discountType: 'percentage', discountValue: 20, minCartValue: 300, description: '20% Off on orders above ₹300' },
      { id: 'cpn-2', code: 'FREE50', discountType: 'flat', discountValue: 50, minCartValue: 200, description: 'Flat ₹50 Off on orders above ₹200' },
      { id: 'cpn-3', code: 'FARMTY10', discountType: 'percentage', discountValue: 10, minCartValue: 0, description: '10% Off for your loyalty' }
    ]));
  }
};

// Execute DB initialization
if (typeof window !== 'undefined') {
  initLocalStorageDB();
}

// Memory-based Listeners for Emulated real-time updates
const eventListeners = {};

export const subscribeToLocalCollection = (collectionKey, callback) => {
  const fullKey = `hsp_${collectionKey}`;
  if (!eventListeners[fullKey]) {
    eventListeners[fullKey] = [];
  }
  eventListeners[fullKey].push(callback);
  
  // Call immediately
  const rawData = localStorage.getItem(fullKey);
  callback(rawData ? JSON.parse(rawData) : []);
  
  // Unsubscribe
  return () => {
    eventListeners[fullKey] = eventListeners[fullKey].filter(cb => cb !== callback);
  };
};

const triggerCollectionChange = (collectionKey) => {
  const fullKey = `hsp_${collectionKey}`;
  if (eventListeners[fullKey]) {
    const rawData = localStorage.getItem(fullKey);
    const parsedData = rawData ? JSON.parse(rawData) : [];
    eventListeners[fullKey].forEach(cb => cb(parsedData));
  }
};

// HELPER API IMPLEMENTATIONS (TRANSPARENT FALLBACKS)

// 1. Authentication Functions
export const authService = {
  // Returns currently logged-in user (real Firebase user or mock session)
  getCurrentUser: () => {
    if (!isMock && auth && auth.currentUser) {
      const fu = auth.currentUser;
      return {
        uid: fu.uid,
        email: fu.email,
        displayName: fu.displayName || fu.email,
        photoURL: fu.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fu.displayName || fu.email)}&background=2E7D32&color=fff`,
        role: fu.email === import.meta.env.VITE_ADMIN_EMAIL ? 'admin' : 'customer'
      };
    }
    // Fallback: mock session stored in sessionStorage
    const session = sessionStorage.getItem('hsp_session');
    return session ? JSON.parse(session) : null;
  },

  // Google Sign-In via Firebase popup (real) or demo simulation (mock)
  loginWithGoogle: async () => {
    if (!isMock && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fu = result.user;
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@hsporganics.com';
        const userObj = {
          uid: fu.uid,
          email: fu.email,
          displayName: fu.displayName || fu.email,
          photoURL: fu.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fu.displayName || fu.email)}&background=2E7D32&color=fff`,
          role: fu.email === adminEmail ? 'admin' : 'customer'
        };
        // Persist for session
        sessionStorage.setItem('hsp_session', JSON.stringify(userObj));
        return userObj;
      } catch (error) {
        // popup blocked or closed — propagate error to UI
        throw new Error(error.message || 'Google Sign-In was cancelled or blocked.');
      }
    }

    // ── MOCK mode: simulate a Google login ──────────────────────────────────
    const demoUser = {
      uid: 'user-google-' + Math.random().toString(36).substring(2, 9),
      email: 'organic.shopper@gmail.com',
      displayName: 'Organic Lover',
      role: 'customer',
      photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80'
    };
    const users = JSON.parse(localStorage.getItem('hsp_users') || '[]');
    if (!users.some(u => u.email === demoUser.email)) {
      users.push(demoUser);
      localStorage.setItem('hsp_users', JSON.stringify(users));
      triggerCollectionChange('users');
    }
    sessionStorage.setItem('hsp_session', JSON.stringify(demoUser));
    return demoUser;
  },

  // Email / Password Sign-In via Firebase (real) or LocalStorage lookup (mock)
  loginEmail: async (email, password) => {
    if (!isMock && auth) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const fu = result.user;
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@hsporganics.com';
        const userObj = {
          uid: fu.uid,
          email: fu.email,
          displayName: fu.displayName || fu.email,
          photoURL: fu.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fu.displayName || fu.email)}&background=2E7D32&color=fff`,
          role: fu.email === adminEmail ? 'admin' : 'customer'
        };
        sessionStorage.setItem('hsp_session', JSON.stringify(userObj));
        return userObj;
      } catch (error) {
        throw new Error(error.message || 'Authentication failed. Please check your credentials.');
      }
    }

    // ── MOCK mode ────────────────────────────────────────────────────────────
    const users = JSON.parse(localStorage.getItem('hsp_users') || '[]');
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('User not found. Try customer@gmail.com or admin@hsporganics.com');
    }
    if (email.toLowerCase().includes('admin') && password !== 'admin123') {
      throw new Error('Incorrect admin password. Hint: admin123');
    }
    sessionStorage.setItem('hsp_session', JSON.stringify(user));
    return user;
  },

  // Sign out (real Firebase or mock clear)
  logout: async () => {
    if (!isMock && auth) {
      await signOut(auth);
    }
    sessionStorage.removeItem('hsp_session');
    return true;
  },

  // Listen for auth state changes (used in AppContext on mount)
  onAuthStateChanged: (callback) => {
    if (!isMock && auth) {
      return onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@hsporganics.com';
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email,
            photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email)}&background=2E7D32&color=fff`,
            role: firebaseUser.email === adminEmail ? 'admin' : 'customer'
          });
        } else {
          callback(null);
        }
      });
    }
    // Mock: one-time call with current session
    const session = sessionStorage.getItem('hsp_session');
    callback(session ? JSON.parse(session) : null);
    return () => {}; // no-op unsubscribe
  }
};

// 2. Product Services (CRUD)
export const productService = {
  getAll: async () => {
    const raw = localStorage.getItem('hsp_products');
    return raw ? JSON.parse(raw) : [];
  },
  
  subscribe: (callback) => {
    return subscribeToLocalCollection('products', callback);
  },

  add: async (productData) => {
    const products = JSON.parse(localStorage.getItem('hsp_products') || '[]');
    const newProduct = {
      ...productData,
      id: 'prod-' + Math.random().toString(36).substring(2, 9),
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      featured: !!productData.featured,
      bestSeller: !!productData.bestSeller
    };
    products.push(newProduct);
    localStorage.setItem('hsp_products', JSON.stringify(products));
    triggerCollectionChange('products');
    
    // Trigger FCM notifications manually
    notificationService.addSystemNotification({
      title: 'New Organic Harvest!',
      body: `${newProduct.name} is now available in the ${newProduct.category} section!`,
      type: 'new_product'
    });
    
    return newProduct;
  },

  update: async (productId, updatedFields) => {
    const products = JSON.parse(localStorage.getItem('hsp_products') || '[]');
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) throw new Error("Product not found");
    
    products[index] = {
      ...products[index],
      ...updatedFields,
      price: parseFloat(updatedFields.price),
      stock: parseInt(updatedFields.stock)
    };
    
    // Check inventory alerts
    if (products[index].stock <= 5) {
      notificationService.addSystemNotification({
        title: 'Inventory Alert ⚠️',
        body: `Low stock alert: ${products[index].name} has only ${products[index].stock} units left!`,
        type: 'inventory_alert',
        userId: 'admin'
      });
    }
    
    localStorage.setItem('hsp_products', JSON.stringify(products));
    triggerCollectionChange('products');
    return products[index];
  },

  delete: async (productId) => {
    let products = JSON.parse(localStorage.getItem('hsp_products') || '[]');
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('hsp_products', JSON.stringify(products));
    triggerCollectionChange('products');
    return true;
  }
};

// 3. Address Services
export const addressService = {
  getByUser: async (userId) => {
    const addresses = JSON.parse(localStorage.getItem('hsp_addresses') || '[]');
    return addresses.filter(a => a.userId === userId);
  },

  save: async (userId, addressData) => {
    const addresses = JSON.parse(localStorage.getItem('hsp_addresses') || '[]');
    
    // If setting as default, reset other addresses
    if (addressData.isDefault) {
      addresses.forEach(a => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    const newAddress = {
      ...addressData,
      id: addressData.id || 'addr-' + Math.random().toString(36).substring(2, 9),
      userId,
      lat: addressData.lat || 12.9716, // Default Bangalore coordinates
      lng: addressData.lng || 77.5946
    };

    if (addressData.id) {
      // Edit
      const index = addresses.findIndex(a => a.id === addressData.id);
      if (index !== -1) addresses[index] = newAddress;
    } else {
      // Add
      addresses.push(newAddress);
    }

    localStorage.setItem('hsp_addresses', JSON.stringify(addresses));
    return newAddress;
  },

  delete: async (addressId) => {
    let addresses = JSON.parse(localStorage.getItem('hsp_addresses') || '[]');
    addresses = addresses.filter(a => a.id !== addressId);
    localStorage.setItem('hsp_addresses', JSON.stringify(addresses));
    return true;
  }
};

// 4. Order Services
export const orderService = {
  getAll: async () => {
    // Before loading orders, run the 30-day cleanup function
    orderService.cleanupOldOrders();
    
    const raw = localStorage.getItem('hsp_orders');
    return raw ? JSON.parse(raw) : [];
  },

  subscribe: (callback) => {
    // Cleanup old orders on subscription
    orderService.cleanupOldOrders();
    return subscribeToLocalCollection('orders', callback);
  },

  create: async (userId, orderData) => {
    const orders = JSON.parse(localStorage.getItem('hsp_orders') || '[]');
    const newOrder = {
      id: 'HSP-' + Math.floor(100000 + Math.random() * 900000),
      userId,
      customerName: orderData.customerName || 'Customer',
      customerEmail: orderData.customerEmail || '',
      items: orderData.items,
      subtotal: orderData.subtotal,
      deliveryCharge: orderData.deliveryCharge,
      couponApplied: orderData.couponApplied || null,
      discountAmount: orderData.discountAmount || 0,
      total: orderData.total,
      address: orderData.address,
      distanceKm: parseFloat(orderData.distanceKm.toFixed(1)),
      status: 'Pending', // Pending, Accepted, Preparing, Out for Delivery, Delivered, Cancelled
      createdAt: new Date().toISOString(),
      statusTimeline: [
        { status: 'Pending', time: new Date().toISOString(), message: 'Order placed successfully.' }
      ],
      paymentMethod: orderData.paymentMethod || 'Cash On Delivery',
      deliveryOTP: Math.floor(1000 + Math.random() * 9000).toString(), // Delivery verification OTP
    };

    orders.unshift(newOrder); // Newest orders first
    localStorage.setItem('hsp_orders', JSON.stringify(orders));
    triggerCollectionChange('orders');

    // Reduce inventory stocks
    const products = JSON.parse(localStorage.getItem('hsp_products') || '[]');
    orderData.items.forEach(orderItem => {
      const pIndex = products.findIndex(p => p.id === orderItem.id);
      if (pIndex !== -1) {
        products[pIndex].stock = Math.max(0, products[pIndex].stock - orderItem.quantity);
      }
    });
    localStorage.setItem('hsp_products', JSON.stringify(products));
    triggerCollectionChange('products');

    // Trigger FCM Notification for Admin
    notificationService.addSystemNotification({
      title: 'New Order Received! 🛒',
      body: `Order ${newOrder.id} for ₹${newOrder.total} from ${newOrder.customerName}.`,
      type: 'new_order',
      userId: 'admin'
    });

    // Trigger FCM Notification for Customer
    notificationService.addSystemNotification({
      title: 'Order Placed! 🌱',
      body: `Your order ${newOrder.id} of ₹${newOrder.total} is pending admin acceptance.`,
      type: 'order_status',
      userId
    });

    return newOrder;
  },

  updateStatus: async (orderId, newStatus) => {
    const orders = JSON.parse(localStorage.getItem('hsp_orders') || '[]');
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error("Order not found");

    const oldStatus = orders[index].status;
    if (oldStatus === newStatus) return orders[index];

    orders[index].status = newStatus;
    
    // Add to timeline
    let timelineMessage = '';
    switch(newStatus) {
      case 'Accepted': timelineMessage = 'Your order has been accepted by the farm team.'; break;
      case 'Preparing': timelineMessage = 'Harvesting fresh produce & packing your items.'; break;
      case 'Out for Delivery': timelineMessage = 'Our delivery partner is on the way to your home.'; break;
      case 'Delivered': timelineMessage = 'Order delivered successfully. Enjoy your organic goods!'; break;
      case 'Cancelled': timelineMessage = 'Order has been cancelled.'; break;
      default: timelineMessage = `Status updated to ${newStatus}.`;
    }

    orders[index].statusTimeline.push({
      status: newStatus,
      time: new Date().toISOString(),
      message: timelineMessage
    });

    localStorage.setItem('hsp_orders', JSON.stringify(orders));
    triggerCollectionChange('orders');

    // Push notification to Customer
    notificationService.addSystemNotification({
      title: `Order Update: ${newStatus} 📦`,
      body: `Your order ${orderId} is now ${newStatus}. ${timelineMessage}`,
      type: 'order_status',
      userId: orders[index].userId
    });

    return orders[index];
  },

  // Automatically delete order data after 30 days
  cleanupOldOrders: () => {
    const raw = localStorage.getItem('hsp_orders');
    if (!raw) return;
    
    const orders = JSON.parse(raw);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const remainingOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= thirtyDaysAgo;
    });

    if (orders.length !== remainingOrders.length) {
      localStorage.setItem('hsp_orders', JSON.stringify(remainingOrders));
      triggerCollectionChange('orders');
      console.log(`HSP Organics CleanUp: Automatically purged ${orders.length - remainingOrders.length} orders older than 30 days.`);
    }
  }
};

// 5. Notifications Service
export const notificationService = {
  subscribe: (callback) => {
    return subscribeToLocalCollection('notifications', callback);
  },

  addSystemNotification: (notiData) => {
    const notifications = JSON.parse(localStorage.getItem('hsp_notifications') || '[]');
    const newNoti = {
      id: 'noti-' + Math.random().toString(36).substring(2, 9),
      title: notiData.title,
      body: notiData.body,
      createdAt: new Date().toISOString(),
      read: false,
      type: notiData.type || 'general',
      userId: notiData.userId || 'all' // 'all', 'admin', or specific userId
    };

    notifications.unshift(newNoti);
    localStorage.setItem('hsp_notifications', JSON.stringify(notifications));
    triggerCollectionChange('notifications');

    // Custom Web Notification dispatch for in-app browser alert simulation
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(newNoti.title, { body: newNoti.body, icon: '/pwa-192x192.png' });
      }
    }
    
    // Broadcast a custom JS event for inside-app instant alerts
    const event = new CustomEvent('hsp_fcm_notification', { detail: newNoti });
    window.dispatchEvent(event);

    return newNoti;
  },

  markAllAsRead: async (userId) => {
    const notifications = JSON.parse(localStorage.getItem('hsp_notifications') || '[]');
    notifications.forEach(n => {
      if (n.userId === userId || n.userId === 'all') {
        n.read = true;
      }
    });
    localStorage.setItem('hsp_notifications', JSON.stringify(notifications));
    triggerCollectionChange('notifications');
    return true;
  }
};

// 6. Wishlist Service
export const wishlistService = {
  subscribe: (callback) => {
    return subscribeToLocalCollection('wishlist', callback);
  },

  toggle: async (userId, productId) => {
    const wishlist = JSON.parse(localStorage.getItem('hsp_wishlist') || '[]');
    const index = wishlist.findIndex(w => w.userId === userId && w.productId === productId);
    
    let isAdded = false;
    if (index !== -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push({ userId, productId });
      isAdded = true;
    }

    localStorage.setItem('hsp_wishlist', JSON.stringify(wishlist));
    triggerCollectionChange('wishlist');
    return isAdded;
  }
};

// 7. Coupons Service
export const couponService = {
  getAll: async () => {
    const raw = localStorage.getItem('hsp_coupons');
    return raw ? JSON.parse(raw) : [];
  },

  subscribe: (callback) => {
    return subscribeToLocalCollection('coupons', callback);
  },

  add: async (couponData) => {
    const coupons = JSON.parse(localStorage.getItem('hsp_coupons') || '[]');
    const newCoupon = {
      id: 'cpn-' + Math.random().toString(36).substring(2, 9),
      code: couponData.code.toUpperCase().trim(),
      discountType: couponData.discountType,
      discountValue: parseFloat(couponData.discountValue),
      minCartValue: parseFloat(couponData.minCartValue || 0),
      description: couponData.description || `${couponData.discountValue}% Off`
    };
    coupons.push(newCoupon);
    localStorage.setItem('hsp_coupons', JSON.stringify(coupons));
    triggerCollectionChange('coupons');
    return newCoupon;
  },

  delete: async (couponId) => {
    let coupons = JSON.parse(localStorage.getItem('hsp_coupons') || '[]');
    coupons = coupons.filter(c => c.id !== couponId);
    localStorage.setItem('hsp_coupons', JSON.stringify(coupons));
    triggerCollectionChange('coupons');
    return true;
  }
};
