/**
 * @typedef {'user' | 'admin' | 'delivery'} UserRole
 * @typedef {'daily' | 'weekly' | 'monthly'} SubscriptionPlan
 * @typedef {'morning' | 'afternoon' | 'evening'} TimeSlot
 * @typedef {'active' | 'paused' | 'cancelled'} SubscriptionStatus
 * @typedef {'pending' | 'in-transit' | 'delivered' | 'failed'} DeliveryStatus
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} password
 * @property {string} name
 * @property {string} phone
 * @property {string} address
 * @property {string} city
 * @property {UserRole} role
 * @property {string} createdAt
 */

/**
 * @typedef {Object} SubscriptionPlanDetails
 * @property {SubscriptionPlan} id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {number} deliveriesPerWeek
 * @property {string[]} features
 */

/**
 * @typedef {Object} Subscription
 * @property {string} id
 * @property {string} userId
 * @property {SubscriptionPlan} plan
 * @property {TimeSlot} timeSlot
 * @property {SubscriptionStatus} status
 * @property {string} startDate
 * @property {number} price
 * @property {string} nextDeliveryDate
 */

/**
 * @typedef {Object} Delivery
 * @property {string} id
 * @property {string} subscriptionId
 * @property {string} userId
 * @property {string} userName
 * @property {string} deliveryDate
 * @property {TimeSlot} timeSlot
 * @property {DeliveryStatus} status
 * @property {string} deliveryPartnerId
 * @property {string} address
 * @property {string} city
 */

/**
 * @typedef {Object} City
 * @property {string} id
 * @property {string} name
 * @property {boolean} available
 */

// ✅ You can now import these for IntelliSense without TypeScript
export {};
