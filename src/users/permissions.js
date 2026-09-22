export const PERMISSIONS = {
  customer: ['menu.browse', 'order.place', 'order.pay', 'coupon.claim', 'location.set', 'chat.send', 'report.create'],
  driver: ['job.accept', 'delivery.instructions', 'delivery.update', 'chat.send', 'customer.contact'],
  staff: ['inventory.view', 'inventory.adjust'],
  admin: ['dashboard.view', 'sales.view', 'orders.monitor', 'chats.oversee', 'reports.handle', 'inventory.view'],
};

export function can(user, permission) {
  if (!user) return false;
  const list = PERMISSIONS[user.role];
  return !!list && list.indexOf(permission) !== -1;
}
