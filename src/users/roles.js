export const ROLE_IDS = ['customer', 'driver', 'staff', 'admin'];

export const ROLES = {
  customer: {
    id: 'customer',
    title: 'Customer',
    blurb: 'Order drinks and follow your delivery',
    special: false,
    capabilities: [
      'Order drinks from the menu',
      'Check out and pay with G-Cash, Maya or cash',
      'Claim coupons',
      'Enter your delivery location',
      'Chat with your driver',
    ],
    credentials: [
      { key: 'id', label: 'Email or phone number', autoComplete: 'username' },
      { key: 'password', label: 'Password', secret: true },
    ],
  },
  driver: {
    id: 'driver',
    title: 'Driver',
    blurb: 'Run deliveries from your phone',
    special: false,
    capabilities: [
      'See delivery instructions',
      'Tap quick updates instead of typing',
      'Contact customers safely, all in the phone',
    ],
    credentials: [
      { key: 'id', label: 'Phone number or email', autoComplete: 'username' },
      { key: 'password', label: 'Password', secret: true },
    ],
  },
  staff: {
    id: 'staff',
    title: 'Staff',
    blurb: 'Keep the stock in check',
    special: true,
    capabilities: [
      'See every ingredient and supply',
      'Spot what is low or out of stock',
      'Adjust counts and restock',
    ],
    credentials: [
      { key: 'id', label: 'Staff ID' },
      { key: 'password', label: 'Password', secret: true },
      { key: 'pin', label: 'Shift PIN (4 digits)', secret: true, numeric: true, maxLength: 4 },
    ],
  },
  admin: {
    id: 'admin',
    title: 'Admin',
    blurb: 'Run the café from the dashboard',
    special: true,
    capabilities: [
      'Manage the dashboard',
      'Watch sales',
      'Monitor orders',
      'Oversee chats',
      'Handle reported problems',
    ],
    credentials: [
      { key: 'id', label: 'Work email', autoComplete: 'username' },
      { key: 'password', label: 'Password', secret: true },
      { key: 'code', label: 'Verification code (6 digits)', secret: true, numeric: true, maxLength: 6 },
    ],
  },
};
