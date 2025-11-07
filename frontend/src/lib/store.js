// --- Default Data Initialization ---

const initializeData = () => {
  if (!localStorage.getItem("fitfood_users")) {
    const defaultUsers = [
      {
        id: "1",
        email: "admin@fitfood.com",
        password: "admin123",
        name: "Admin User",
        phone: "+1234567890",
        address: "123 Admin St",
        city: "New York",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        email: "delivery@fitfood.com",
        password: "delivery123",
        name: "John Delivery",
        phone: "+1234567891",
        address: "456 Delivery Ave",
        city: "New York",
        role: "delivery",
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        email: "user@example.com",
        password: "user123",
        name: "Jane Smith",
        phone: "+1234567892",
        address: "789 User Blvd, Apt 4B",
        city: "New York",
        role: "user",
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem("fitfood_users", JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem("fitfood_cities")) {
    const defaultCities = [
      { id: "1", name: "New York", available: true },
      { id: "2", name: "Los Angeles", available: true },
      { id: "3", name: "Chicago", available: true },
      { id: "4", name: "Houston", available: false },
      { id: "5", name: "Miami", available: true },
    ];
    localStorage.setItem("fitfood_cities", JSON.stringify(defaultCities));
  }

  if (!localStorage.getItem("fitfood_subscriptions")) {
    localStorage.setItem("fitfood_subscriptions", JSON.stringify([]));
  }

  if (!localStorage.getItem("fitfood_deliveries")) {
    localStorage.setItem("fitfood_deliveries", JSON.stringify([]));
  }
};

initializeData();

// --- Subscription Plans ---

export const subscriptionPlans = [
  {
    id: "daily",
    name: "Daily Fresh",
    description: "Fresh fruits delivered every day",
    price: 99,
    deliveriesPerWeek: 7,
    features: [
      "Daily delivery",
      "Premium fruit selection",
      "Flexible timing",
      "Cancel anytime",
    ],
  },
  {
    id: "weekly",
    name: "Weekly Bundle",
    description: "Fresh fruits 5 days a week",
    price: 349,
    deliveriesPerWeek: 5,
    features: [
      "5 deliveries per week",
      "Variety pack",
      "Weekend off",
      "Best value",
    ],
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    description: "Subscribe for a month and save",
    price: 1299,
    deliveriesPerWeek: 5,
    features: [
      "20+ deliveries",
      "Maximum savings",
      "Priority support",
      "Free delivery",
    ],
  },
];

// --- User Management ---

export const getUsers = () =>
  JSON.parse(localStorage.getItem("fitfood_users") || "[]");

export const getUserById = (id) => getUsers().find((u) => u.id === id);

export const authenticateUser = (email, password) => {
  const users = getUsers();
  return (
    users.find((u) => u.email === email && u.password === password) || null
  );
};

export const registerUser = (user) => {
  const users = getUsers();
  const newUser = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem("fitfood_users", JSON.stringify(users));
  return newUser;
};

export const updateUser = (id, updates) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem("fitfood_users", JSON.stringify(users));
  }
};

// --- Subscription Management ---

export const getSubscriptions = () =>
  JSON.parse(localStorage.getItem("fitfood_subscriptions") || "[]");

export const getUserSubscription = (userId) =>
  getSubscriptions().find(
    (s) => s.userId === userId && s.status !== "cancelled"
  );

export const createSubscription = (subscription) => {
  const subscriptions = getSubscriptions();
  const newSubscription = {
    ...subscription,
    id: Date.now().toString(),
  };
  subscriptions.push(newSubscription);
  localStorage.setItem("fitfood_subscriptions", JSON.stringify(subscriptions));
  generateDeliveriesForSubscription(newSubscription);
  return newSubscription;
};

export const updateSubscription = (id, updates) => {
  const subscriptions = getSubscriptions();
  const index = subscriptions.findIndex((s) => s.id === id);
  if (index !== -1) {
    subscriptions[index] = { ...subscriptions[index], ...updates };
    localStorage.setItem(
      "fitfood_subscriptions",
      JSON.stringify(subscriptions)
    );
  }
};

export const updateSubscriptionStatus = (id, status) => {
  updateSubscription(id, { status });
};

// --- Delivery Management ---

export const getDeliveries = () =>
  JSON.parse(localStorage.getItem("fitfood_deliveries") || "[]");

export const getUserDeliveries = (userId) => {
  const deliveries = getDeliveries();
  return deliveries
    .filter((d) => d.userId === userId)
    .sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate));
};

export const getDeliveryPartnerDeliveries = (partnerId, date) => {
  const deliveries = getDeliveries();
  const targetDate = date || new Date().toISOString().split("T")[0];
  return deliveries.filter(
    (d) =>
      d.deliveryPartnerId === partnerId && d.deliveryDate.startsWith(targetDate)
  );
};

export const updateDeliveryStatus = (id, status) => {
  const deliveries = getDeliveries();
  const index = deliveries.findIndex((d) => d.id === id);
  if (index !== -1) {
    deliveries[index] = { ...deliveries[index], status };
    localStorage.setItem("fitfood_deliveries", JSON.stringify(deliveries));
  }
};

// --- Delivery Generation ---

const generateDeliveriesForSubscription = (subscription) => {
  const deliveries = getDeliveries();
  const user = getUserById(subscription.userId);
  if (!user) return;

  const daysToGenerate = subscription.plan === "daily" ? 7 : 5;

  for (let i = 0; i < daysToGenerate; i++) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + i);

    const newDelivery = {
      id: `${Date.now()}-${i}`,
      subscriptionId: subscription.id,
      userId: subscription.userId,
      userName: user.name,
      deliveryDate: deliveryDate.toISOString().split("T")[0],
      timeSlot: subscription.timeSlot,
      status: "pending",
      deliveryPartnerId: "2", // default delivery user
      address: user.address,
      city: user.city,
    };

    deliveries.push(newDelivery);
  }

  localStorage.setItem("fitfood_deliveries", JSON.stringify(deliveries));
};

// --- City Management ---

export const getCities = () =>
  JSON.parse(localStorage.getItem("fitfood_cities") || "[]");

export const isCityAvailable = (cityName) => {
  const cities = getCities();
  const city = cities.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  );
  return city?.available || false;
};

// --- Analytics ---

export const getAnalytics = () => {
  const users = getUsers();
  const subscriptions = getSubscriptions();
  const deliveries = getDeliveries();

  const totalUsers = users.filter((u) => u.role === "user").length;
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active"
  ).length;
  const totalRevenue = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.price, 0);
  const completedDeliveries = deliveries.filter(
    (d) => d.status === "delivered"
  ).length;

  const cityStats = getCities()
    .filter((c) => c.available)
    .map((city) => {
      const cityUsers = users.filter(
        (u) => u.city === city.name && u.role === "user"
      ).length;
      const citySubscriptions = subscriptions.filter((s) => {
        const user = getUserById(s.userId);
        return user?.city === city.name && s.status === "active";
      }).length;
      return {
        city: city.name,
        users: cityUsers,
        subscriptions: citySubscriptions,
      };
    });

  return {
    totalUsers,
    activeSubscriptions,
    totalRevenue,
    completedDeliveries,
    cityStats,
  };
};

// --- Session Management ---

export const setCurrentUser = (user) =>
  localStorage.setItem("fitfood_current_user", JSON.stringify(user));

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("fitfood_current_user");
  return userStr ? JSON.parse(userStr) : null;
};

export const logout = () => localStorage.removeItem("fitfood_current_user");
