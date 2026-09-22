export const STATUS_FLOW = ['preparing', 'ready', 'picked', 'arrived', 'delivered'];

export const STATUS_LABEL = {
  preparing: 'Preparing',
  ready: 'Ready for pickup',
  picked: 'On the way',
  arrived: 'Arrived',
  delivered: 'Delivered',
};

export const STATUS_LOG = {
  preparing: "Order placed. We're preparing it now.",
  ready: 'Your order is packed and waiting for a rider.',
  picked: 'Your rider left the café with your order.',
  arrived: 'Your rider has arrived.',
  delivered: 'Delivered. Enjoy!',
};

export const PAYMENT_LABEL = { gcash: 'G-Cash', maya: 'Maya', cod: 'Cash on delivery' };

export const QUICK_UPDATES = [
  { text: 'Need help finding you', log: 'Your rider needs help finding you.' },
  { text: 'Running 5 min late', log: 'Your rider is running about 5 minutes late.' },
  { text: 'Waiting at the gate', log: 'Your rider is waiting at the gate.' },
];

export const REPORT_CATEGORIES = ['Late delivery', 'Wrong or missing item', 'Payment problem', 'Rider behavior', 'Something else'];

export const COUPON_RATE = 0.1;
