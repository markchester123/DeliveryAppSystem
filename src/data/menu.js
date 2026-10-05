export const MENU = [
  { id: 'spanish', name: 'Spanish Latte', price: 85, type: 'Coffee', size: 16, needs: { beans: 0.02, milk: 0.2, cup16: 1, lids: 1, straws: 1 }, image: require('../../assets/products/image-removebg-preview.png'), },
  { id: 'caramel', name: 'Caramel Macchiato', price: 90, type: 'Coffee', size: 16, needs: { beans: 0.02, milk: 0.2, caramel: 0.04, cup16: 1, lids: 1, straws: 1 }, image: require('../../assets/products/caramel macchiato.png'), },
  { id: 'matcha', name: 'Dirty Matcha', price: 80, type: 'Coffee', size: 16, needs: { matcha: 0.06, beans: 0.02, milk: 0.2, cup16: 1, lids: 1, straws: 1 }, image: require('../../assets/products/dirty_labubu.png'), },
  { id: 'hazel', name: 'Hazelnut Coffee', price: 80, type: 'Coffee', size: 16, needs: { beans: 0.02, hazelnut: 0.04, milk: 0.2, cup16: 1, lids: 1, straws: 1 }, image: require('../../assets/products/caramel macchiato.png'), },
  { id: 'straw', name: 'Strawberry Soda', price: 65, type: 'Soda', size: 12, needs: { strawberry: 0.04, soda: 0.3, cup12: 1, lids: 1, straws: 1 }, image: require('../../assets/products/caramel macchiato.png'), },
  { id: 'blue', name: 'Blueberry Soda', price: 65, type: 'Soda', size: 12, needs: { blueberry: 0.04, soda: 0.3, cup12: 1, lids: 1, straws: 1 }, image: require('../../assets/products/caramel macchiato.png'), },
  { id: 'cuke', name: 'Cucumber Fresh', price: 65, type: 'Juice', size: 12, needs: { cucumber: 0.1, soda: 0.3, cup12: 1, lids: 1, straws: 1 }, image: require('../../assets/products/caramel macchiato.png'), },
];

export const menuItem = (id) => MENU.find((m) => m.id === id);